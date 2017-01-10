// LICENSE : MIT
"use strict";
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
import {getLang} from "./language-detection";
import {getMarker, hasMarker, markerSliceCode, removeMarkers} from "./marker";
import {sliceCode, hasSliceRange, getSliceRange} from "./slicer";
import {hasTitle, parseTitle} from "./title"
const markdownLinkFormatRegExp = /\[([^\]]*?)\]\(([^\)]*?)\)/gm;

/**
 * A counter to count how many code are imported.
 */
var codeCounter = (function() {
    var count = 0;
    return function() {
        return count++;
    };  // Return and increment
})();

/**
 * split label to commands
 * @param {string} label
 * @returns {Array}
 */
export function splitLabelToCommands(label = "") {
    const result = label.split(/(:|[,\s])/);
    if (!result) {
        return [];
    }
    // remove null command
    return result.map(command => {
        return command.trim();
    }).filter(command => {
        return command.length > 0;
    });
}
/**
 * if contain "include" or "import" command, then return true
 * @param {Array} commands
 * @returns {boolean}
 */
export function containIncludeCommand(commands = []) {
    var reg = /^(include|import)$/;
    return commands.some(command => {
        return reg.test(command.trim());
    })
}
/** Parse the command label and return key-value object
 * @example
 *      [import,title:"<thetitle>",label:"<thelabel>"](path/to/file.ext)
 * @param {string} label
 * @return {Object}
 */
export function parseVariablesFromLabel(label) {
    var keyvals = {
        "title": undefined,
        "id": undefined,
        "class": undefined,
        "name": undefined,
        "marker": undefined,
        "unindent": undefined,
        "edit": undefined,
        "theme": undefined,
        "check": undefined,
        "fixlang": undefined
    };
    Object.keys(keyvals).forEach(key => {
        var keyReg = key;
        if (key === "marker") {
            keyReg = "import|include";
        }

        const regStr = "\^.*,?\\s*(" + keyReg + ")\\s*:\\s*[\"']([^'\"]*)[\"'],?.*\$";
        const reg = new RegExp(regStr);
        const res = label.match(reg);
        if (res) {
            keyvals[key] = res[2];
        }
    });
    return keyvals;
}

/**
 * generate code with options
 * @param {string} lang
 * @param {string} filePath
 * @param {string} originalPath
 * @param {string} label
 * @param {string} template
 * @return {string}
 */
export function embedCode({lang, filePath, originalPath, label, template, unindent}) {
    const code = fs.readFileSync(filePath, "utf-8");
    const fileName = path.basename(filePath);
    const keyValueObject = parseVariablesFromLabel(label);

    var content = code;
    // Slice content via line numbers.
    if (hasSliceRange(label)) {
        const [start, end] = getSliceRange(label);
        content = sliceCode(code, start, end);
    }
    // Slice content via markers.
    else if (hasMarker(keyValueObject)) {
        const marker = getMarker(keyValueObject);
        content = removeMarkers(markerSliceCode(code, marker));
    }
    if (unindent || keyValueObject.unindent) {
      content = strip(content);
    }
    return generateEmbedCode({
        keyValueObject,
        lang,
        fileName,
        originalPath,
        content,
        template,
    });
}

export function strip(s) {
  // inspired from https://github.com/rails/rails/blob/master/activesupport/lib/active_support/core_ext/string/strip.rb
  const indents = s.split(/\n/).map(s => s.match(/^[ \t]*(?=\S)/)).filter(m => m).map(m => m[0])
  const smallestIndent = indents.sort((a,b) => a.length-b.length)[0]
  return s.replace(new RegExp(`^${smallestIndent}`, 'gm'), '')
}

/**
 * generate code from options
 * @param {Object} keyValueObject
 * @param {string} lang
 * @param {string} fileName
 * @param {string} originalPath
 * @param {string} content
 * @param {string} template handlebars template
 * @return {string}
 */
export function generateEmbedCode({
    keyValueObject,
    lang,
    fileName,
    originalPath,
    content,
    template,
}) {
    const count = hasTitle(keyValueObject) ? codeCounter() : -1;
    // merge objects
    // if keyValueObject has `lang` key, that is overwrited by `lang` of right.
    const context = Object.assign({}, keyValueObject, {lang, fileName, originalPath, content, count});

    // compile template
    const handlebars = Handlebars.compile(template);
    // compile with data
    return handlebars(context);
}

const templatePath = {
    default: path.join(__dirname, "..", "templates", "default-template.hbs"),
    full: path.join(__dirname, "..", "templates", "full-template.hbs"),
    ace: path.join(__dirname, "..", "templates", "ace-template.hbs"),
    acefull: path.join(__dirname, "..", "templates", "acefull-template.hbs")
};

const defaultOptions = {
    template: "default",
    unindent: false,
    fixlang: false
};

/**
 * generate code with options
 * @param {string} content
 * @param {string} baseDir
 * @param {{template?: string}} options
 * @return {Array}
 */
export function parse(content, baseDir, options = {}) {
    const results = [];
    const isTemplateDefault = (options.template == undefined);
    const isTemplatePath = (templatePath[options.template] == undefined);
    let tPath;
    // No template option.
    if(isTemplateDefault) {
        tPath = templatePath[defaultOptions.template];
    }
    // Template option is a path.
    else if (isTemplatePath && fs.existsSync(options.template)) {
        tPath = options.template;
    }
    // Template option one of template/ directory.
    else {
        tPath = templatePath[options.template] || templatePath[defaultOptions.template];
    }
    const template = fs.readFileSync( tPath, "utf-8");
    const unindent = options.unindent || defaultOptions.unindent;
    const fixlang = options.fixlang || defaultOptions.fixlang;

    let res;
    while (res = markdownLinkFormatRegExp.exec(content)) {
        const [all, label, originalPath] = res;
        const commands = splitLabelToCommands(label);
        if (containIncludeCommand(commands)) {
            const lang = getLang(commands, originalPath, fixlang );
            const absolutePath = path.resolve(baseDir, originalPath);
            const replacedContent = embedCode({
                lang,
                filePath: absolutePath,
                originalPath: originalPath,
                label,
                template,
                unindent
            });
            results.push({
                target: all,
                replaced: replacedContent
            });
        }
    }
    return results;
}
