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
        "marker": undefined
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
export function embedCode({lang, filePath, originalPath, label, template}) {
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
    return generateEmbedCode({
        keyValueObject,
        lang,
        fileName,
        originalPath,
        content,
        template
    });
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
    template
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


const defaultOptions = {
    template: fs.readFileSync(path.join(__dirname, "..", "template", "default-template.hbs"), "utf-8")
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
    const template = options.template || defaultOptions.template;
    let res;
    while (res = markdownLinkFormatRegExp.exec(content)) {
        const [all, label, originalPath] = res;
        const commands = splitLabelToCommands(label);
        if (containIncludeCommand(commands)) {
            const lang = getLang(commands, originalPath);
            const absolutePath = path.resolve(baseDir, originalPath);
            const replacedContent = embedCode({
                lang,
                filePath: absolutePath,
                originalPath: originalPath,
                label,
                template
            });
            results.push({
                target: all,
                replaced: replacedContent
            });
        }
    }
    return results;
}
