// LICENSE : MIT
"use strict";
const path = require("path");
const Handlebars = require("handlebars");
const logger = require("winston-color");
import {defaultKeyValueMap, initOptions, checkMapTypes, convertValue} from "./options.js";
import {getLang} from "./language-detection";
import {getMarker, hasMarker, markerSliceCode, removeMarkers} from "./marker";
import {sliceCode, hasSliceRange, getSliceRange} from "./slicer";
import {hasTitle} from "./title";
import {getTemplateContent, readFileFromPath} from "./template";
const markdownLinkFormatRegExp = /\[([^\]]*?)\]\(([^\)]*?)\)/gm;

/**
 * A counter to count how many code are imported.
 */
var codeCounter = (function() {
    var count = 0;
    return function() {
        return count++;
    };  // Return and increment
}());

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
    if ((s === undefined) || (s === "")) {
        return s;
    }
    const indents = s.split(/\n/).map(s => s.match(/^[ \t]*(?=\S)/)).filter(m => m).map(m => m[0]);
    const smallestIndent = indents.sort((a, b) => a.length - b.length)[0];
    return s.replace(new RegExp(`^${smallestIndent}`, "gm"), "");
}

/**
 * if contain "include" or "import" command, then return true
 * @param {Array} commands
 * @returns {boolean}
 */
export function containIncludeCommand(commands = []) {
    const reg = /^(include|import)$/;
    return commands.some(command => {
        return reg.test(command.trim());
    });
}

/** Parse the command label and return a new key-value object
 * @example
 *      [import,title:"<thetitle>",label:"<thelabel>"](path/to/file.ext)
 * @param {object} kvMap
 * @param {string} label
 * @return {object}
 */
export function parseVariablesFromLabel(kvMap, label) {
    const kv = Object.assign({}, kvMap);
    const beginEx = "\^.*";
    const endEx = ".*\$";
    const sepEx = ",?";
    const kvsepEx = "[:=]";
    const spacesEx = "\\s*";
    const quotesEx = "[\"']";

    Object.keys(kv).forEach(key => {
        let keyEx = "(" + key + ")";
        let valEx = "([-\\w\\s]*)";
        if (key === "marker") {
            keyEx = "(import|include)";
            valEx = "(([-\\w\\s]*,?)*)";
        }
        // Add value check here
        switch (typeof defaultKeyValueMap[key]) {
        case "string":
            valEx = quotesEx + valEx + quotesEx;
            break;
        case "boolean":
                // no quotes
            valEx = quotesEx + "?(true|false)" + quotesEx + "?";
            break;
        default:
            logger.error("include-codeblock: parseVariablesFromLabel: key type `" + typeof defaultKeyValueMap[key] + "` unknown (see options.js)");
            break;
        }
        // Val type cast to string.
        const regStr = beginEx + sepEx + spacesEx + keyEx +
            spacesEx + kvsepEx + spacesEx + valEx + spacesEx + sepEx + endEx;
        const reg = new RegExp(regStr);
        const res = label.match(reg);
        if (res) {
            kv[key] = convertValue(res[2], typeof defaultKeyValueMap[key]);
        }
    });
    return Object.freeze(kv);
}

/**
 * generate code from options
 * @param {object} kvMap
 * @param {string} fileName
 * @param {string} originalPath
 * @param {string} content
 * @return {string}
 */
export function generateEmbedCode(kvMap,
    {fileName, originalPath, content}) {
    const tContent = getTemplateContent(kvMap);
    const kv = Object.assign({}, kvMap);
    const count = hasTitle(kv) ? codeCounter() : -1;
    checkMapTypes(kvMap, "generatedEmbedCode");
    const contextMap = Object.assign({}, kvMap, {
        "content": content,
        "count": count,
        "fileName": fileName,
        "originalPath": originalPath
    });
    // compile template
    const handlebars = Handlebars.compile(tContent);
    // compile with data.
    return handlebars(contextMap);
}

/**
 * return content from file or url.
 * @param {string} filePath
 * @param {string} originalPath
 * @return {string}
 */
export function getContent(filePath, originalPath) {
    return readFileFromPath(filePath);
}

/**
 * generate code with options
 * @param {object} kvMap
 * @param {string} filePath
 * @param {string} originalPath
 * @param {string} label
 * @return {string}
 */
export function embedCode(kvMap,
    {filePath, originalPath, label}) {
    const code = getContent(filePath, originalPath);
    const fileName = path.basename(filePath);
    const kvmparsed = parseVariablesFromLabel(kvMap, label);
    const kvm = getLang(kvmparsed, originalPath);
    const unindent = kvm.unindent;

    var content = code;
    // Slice content via line numbers.
    if (hasSliceRange(label)) {
        const [start, end] = getSliceRange(label);
        content = sliceCode(code, start, end);
    } else if (hasMarker(kvm)) {
        // Slice content via markers.
        const marker = getMarker(kvm);
        content = removeMarkers(markerSliceCode(code, marker));
    }
    if (unindent === true) {
        content = strip(content);
    }
    return generateEmbedCode(
        kvm,
        {fileName, originalPath, content}
    );
}

/**
 * Parse command using options from pluginConfig.
 * @param {string} content
 * @param {string} baseDir
 * @param {{template?: string}} options
 * @return {Array}
 */
export function parse(content, baseDir, options = {}) {
    const results = [];
    const kvMap = initOptions(options);
    let res = true;
    while ((res = markdownLinkFormatRegExp.exec(content))) {
        const [all, label, originalPath] = res;
        const commands = splitLabelToCommands(label);
        if (containIncludeCommand(commands)) {
            const absolutePath = path.resolve(baseDir, originalPath);
            const replacedContent = embedCode(
                kvMap,
                {
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
