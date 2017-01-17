// LICENSE : MIT
"use strict";
const immutable = require("immutable");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const logger = require('winston-color');
import {getLang} from "./language-detection";
import {getMarker, hasMarker, markerSliceCode, removeMarkers} from "./marker";
import {sliceCode, hasSliceRange, getSliceRange} from "./slicer";
import {hasTitle, parseTitle} from "./title"
const markdownLinkFormatRegExp = /\[([^\]]*?)\]\(([^\)]*?)\)/gm;

export const defaultTemplateMap = immutable.Map({
    default: path.join(__dirname, "..", "templates", "default-template.hbs"),
    full: path.join(__dirname, "..", "templates", "full-template.hbs"),
    ace: path.join(__dirname, "..", "templates", "ace-template.hbs"),
    acefull: path.join(__dirname, "..", "templates", "acefull-template.hbs")
});

// Available options in book.json.
export const defaultBookOptionsMap = immutable.Map({
    template: "default",
    unindent: "false",
    edit: "",
    theme: "",
    check: "",
    fixlang: "false"
});

// All possible key-values (kv) in the command label.
export const defaultKeyValueMap = immutable.Map({
    // Local
    "title": undefined,
    "id": undefined,
    "class": undefined,
    "name": undefined,
    "marker": undefined,
    // Global/Local
    "template": defaultBookOptionsMap.get('template'),
    "unindent": defaultBookOptionsMap.get('unindent'),
    "edit": defaultBookOptionsMap.get('edit'),
    "theme": defaultBookOptionsMap.get('theme'),
    "check": defaultBookOptionsMap.get('check'),
    "fixlang": defaultBookOptionsMap.get('fixlang') 
});

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
 * Unindent code
 * @param {string} s
 * @return {string}
 */
export function strip(s) {
  // inspired from https://github.com/rails/rails/blob/master/activesupport/lib/active_support/core_ext/string/strip.rb
  const indents = s.split(/\n/).map(s => s.match(/^[ \t]*(?=\S)/)).filter(m => m).map(m => m[0])
  const smallestIndent = indents.sort((a,b) => a.length-b.length)[0]
  return s.replace(new RegExp(`^${smallestIndent}`, 'gm'), '')
}

/**
 * if contain "include" or "import" command, then return true
 * @param {Array} commands
 * @returns {boolean}
 */
export function containIncludeCommand(commands = []) {
    let reg = /^(include|import)$/;
    return commands.some(command => {
        return reg.test(command.trim());
    })
}

/** Parse the command label and return a new key-value object
 * @example
 *      [import,title:"<thetitle>",label:"<thelabel>"](path/to/file.ext)
 * @param {object} kvMap
 * @param {string} label
 * @param {object}
 * @return {object}
 */
export function parseVariablesFromLabel(label, kvMap) {
    const kv = kvMap.toObject();
    Object.keys(kv).forEach(key => {
        let keyReg = key;
        if (key === "marker") {
            keyReg = "import|include";
        }
        const regStr = "\^.*,?\\s*(" + keyReg + ")\\s*:\\s*[\"']([^'\"]*)[\"'],?.*\$";
        const reg = new RegExp(regStr);
        const res = label.match(reg);
        if (res) {
            kv[key] = res[2];
        }
    });
    return immutable.Map(kv);
}

/**
 * Sunc file read with path check
 * @param {string} path
 * @return {string}
 */
export function readFileFromPath(path)
{
    try {
    var content = fs.readFileSync(path, 'utf8')
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            logger.error(fs.join( 'File not found: ', path));
        } else {
            throw err;
        }
    }
    return content;
}

/**
 * Load template from template label
 * @param {object} kvMap
 * @return {string}
 */
export function getTemplateContent(kvMap)
{
    const t = kvMap.get('template');
    const dt = defaultBookOptionsMap.get('template');
    const tPath = defaultTemplateMap.get(t);
    const dtPath = defaultTemplateMap.get(dt);

    const isTemplateDefault = (t == dt);
    const isTemplatePath = (tPath == undefined);

    let p;
    // No template option.
    if(isTemplateDefault) {
        p = dtPath;
    }
    // Template option is a path.
    else if (isTemplatePath) {
        p = t;
    }
    // Template option one of template/ directory.
    else {
        p = tPath || dtPath;
    }   
    const content = readFileFromPath(p);

    return content;
}

/**
 * generate code with options
 * @param {object} kvMap
 * @param {string} lang
 * @param {string} filePath
 * @param {string} originalPath
 * @param {string} label
 * @return {string}
 */
export function embedCode( kvMap,
    {lang, filePath, originalPath, label} )
{
    const code = readFileFromPath(filePath);
    const fileName = path.basename(filePath);
    const kvm = parseVariablesFromLabel(label, kvMap);
    const kv = kvm.toObject();
    const unindent = kvm.get('unindent');

    var content = code;
    // Slice content via line numbers.
    if (hasSliceRange(label)) {
        const [start, end] = getSliceRange(label);
        content = sliceCode(code, start, end);
    }
    // Slice content via markers.
    else if (hasMarker(kv)) {
        const marker = getMarker(kv);
        content = removeMarkers(markerSliceCode(code, marker));
    }
    if (unindent == true) {
        content = strip(content);
    }
    
    return generateEmbedCode(
        kvm,
        {lang, fileName, originalPath, content}
    );
}

/**
 * generate code from options
 * @param {object} kvMap
 * @param {string} lang
 * @param {string} fileName
 * @param {string} originalPath
 * @param {string} content
 * @return {string}
 */
export function generateEmbedCode(
    kvMap,
    {lang, fileName, originalPath, content})
{   

    const tContent = getTemplateContent(kvMap);
    const kv = kvMap.toObject();
    const count = hasTitle(kv) ? codeCounter() : -1;
    // merge objects
    // if kv has `lang` key, that is overwrited by `lang` of right.
    const context = Object.assign({}, kv, {lang, fileName, originalPath, content, count});

    // compile template
    const handlebars = Handlebars.compile(tContent);
    // compile with data
    return handlebars(context);
}

/**
 * generate code with options
 * @param {string} content
 * @param {string} baseDir
 * @param {{template?: string}} options
 * @return {Array}
 */
export function parse(content, baseDir, options = {}) {
    const results = [];
    const bookOptionsMap = defaultBookOptionsMap;
    const kv = defaultKeyValueMap.toObject();

    // Overwrite default value with user book options. 
    bookOptionsMap.keySeq().forEach( key => {
        if (options[key] != undefined) {
            kv[key] = options[key];
        };
    });
    const kvMap = immutable.Map(kv);

    console.log(kvMap)

    let res;
    while (res = markdownLinkFormatRegExp.exec(content)) {
        const [all, label, originalPath] = res;
        const commands = splitLabelToCommands(label);
        if (containIncludeCommand(commands)) {
            const lang = getLang(commands, originalPath, kvMap.get('fixlang') );
            const absolutePath = path.resolve(baseDir, originalPath);
            const replacedContent = embedCode(
                kvMap,
                {
                lang,
                filePath: absolutePath,
                originalPath: originalPath,
                label
            });
            results.push({
                target: all,
                replaced: replacedContent
            });
        }
    }
    return results;
}
