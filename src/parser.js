// LICENSE : MIT
"use strict";
const immutable = require("immutable");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const logger = require('winston-color');
import {defaultBookOptionsMap, defaultKeyValueMap, defaultTemplateMap, initOptions, checkMapTypes, convertValue} from "./options.js";
import {getLang} from "./language-detection";
import {getMarker, hasMarker, markerSliceCode, removeMarkers} from "./marker";
import {sliceCode, hasSliceRange, getSliceRange} from "./slicer";
import {hasTitle, parseTitle} from "./title";
import {getTemplateContent, readFileFromPath} from "./template";
const markdownLinkFormatRegExp = /\[([^\]]*?)\]\(([^\)]*?)\)/gm;
const srequest = require("sync-request");
const validurl = require("valid-url");

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
  if((s === undefined) || (s === "") )
        return s;
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
 * @return {object}
 */
export function parseVariablesFromLabel(kvMap,label) {
    const kv = kvMap.toObject();
    const begin_ex = "\^.*";
    const end_ex = ".*\$";
    const sep_ex = ",?";
    const kvsep_ex = "[:=]";
    const spaces_ex = "\\s*";
    const quotes_ex = "[\"']";

    Object.keys(kv).forEach(key => {
        let key_ex = "(" + key + ")";
        let val_ex = "([-\\w\\s]*)";
        if (key === "marker") {
            key_ex = "(import|include)";
            val_ex = "(([-\\w\\s]*,?)*)";
        }
        // Add value check here
        switch( typeof defaultKeyValueMap.get(key) ) {
            case "string":
                val_ex = quotes_ex + val_ex + quotes_ex;
                break;
            case "boolean":
                // no quotes
                val_ex = quotes_ex + "?" + "(true|false)" + quotes_ex + "?";
                break;
            default:
                logger.error("include-codeblock: parseVariablesFromLabel: key type `"
                    + typeof defaultKeyValueMap.get(key) + "` unknown (see options.js)");
        }
        // Val type cast to string.
        const regStr = begin_ex + sep_ex +  spaces_ex + key_ex +
            spaces_ex + kvsep_ex + spaces_ex + val_ex + spaces_ex + sep_ex + end_ex;
        const reg = new RegExp(regStr);
        const res = label.match(reg);
        if (res) {
            kv[key] = convertValue(res[2], typeof defaultKeyValueMap.get(key));
        }
    });
    return immutable.Map(kv);
}

/**
 * return content from file or url.
 * @param {string} filePath
 * @param {string} originalPath
 * @return {string}
 */
export function getContent( filePath, originalPath )
{
    const isUri = validurl.isUri(originalPath);
    if(isUri) {
        const res = srequest('GET',originalPath,{
            cache:'file',
            followRedirect:false
        });
        if(res.statusCode === 200) {
            return res.getBody('utf8');
        }
        else {
            logger.warn("include-codeblock: http request failed GET: " + originalPath);
            return "Error 404: url not found : " + originalPath;
        }
    }
    // urlPath is a path to file
    else {
        return readFileFromPath(filePath);
    }
}

/**
 * generate code with options
 * @param {object} kvMap
 * @param {string} filePath
 * @param {string} originalPath
 * @param {string} label
 * @return {string}
 */
export function embedCode( kvMap,
    {filePath, originalPath, label} )
{
    //const code = readFileFromPath(filePath);
    const code = getContent(filePath,originalPath);
    const fileName = path.basename(filePath);
    const kvmparsed = parseVariablesFromLabel(kvMap, label);
    const kvm = getLang(kvmparsed, originalPath);
    const unindent = kvm.get('unindent');
    const kv = kvm.toObject();

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
        {fileName, originalPath, content}
    );
}

/**
 * generate code from options
 * @param {object} kvMap
 * @param {string} fileName
 * @param {string} originalPath
 * @param {string} content
 * @return {string}
 */
export function generateEmbedCode(
    kvMap,
    {fileName, originalPath, content})
{   
    const tContent = getTemplateContent(kvMap);
    const kv = kvMap.toObject();
    const count = hasTitle(kv) ? codeCounter() : -1;
    checkMapTypes( kvMap, "generatedEmbedCode" );
    const contextMap = kvMap.concat( immutable.Map({
        "content":content,
        "count":count,
        "fileName":fileName,
        "originalPath":originalPath
    }) );
    // compile template
    const handlebars = Handlebars.compile(tContent);
    // compile with data.
    return handlebars(contextMap.toObject());
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
    const kvMap = initOptions( options );
    let res;
    while (res = markdownLinkFormatRegExp.exec(content)) {
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
