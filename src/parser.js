// LICENSE : MIT
"use strict";
const fs = require("fs");
const path = require("path");
// https://www.npmjs.com/package/handlebars
const Handlebars = require("handlebars")
import {getLang} from "./language-detection";
import {getMarker, hasMarker, markerSliceCode, removeMarkers} from "./marker";
import {sliceCode, hasSliceRange, getSliceRange} from "./slicer";
import {parseTitle} from "./title"
const markdownLinkFormatRegExp = /\[([^\]]*?)\]\(([^\)]*?)\)/gm;
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
 */
export function parseVariablesFromLabel(label) {
    var keyvals = {
        "title":undefined,
        "id":undefined,
        "marker":undefined
    };
    for(var key in keyvals) {
        var keyReg=key;
        if(key=="marker") {
            keyReg="import|include";
        }
        const regStr = "\^.*,?\\s*("+keyReg+")\\s*:\\s*[\"']([^'\"]*)[\"'],?.*\$";
        const reg = new RegExp(regStr);
        const res = label.match(reg);
        if(res) {
            keyvals[key]=res[2];
        }
    }
    return keyvals;
}

/**
 * generate code with options
 * @param {string} lang
 * @param {bool,string} title
 * @param {string} filePath
 * @param {string} originalPath
 * @param {string} label
 */
export function embedCode({lang, filePath, originalPath, label}) {
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
    return generateEmbedCode(keyValueObject, lang, fileName, originalPath, content);
}

export function generateEmbedCode(keyValueObject, lang, fileName, originalPath, content) {
    // merge objects
    // if keyValueObject has `lang` key, that is overwrited by `lang` of right.
    const context = Object.assign({}, keyValueObject, { lang, fileName, originalPath, content });

    // if has the title, add anchor link
    const source =`\
{{#if title}}
    {{#if id}}
> <a id="{{id}}" href="{{originalPath}}">{{title}}</a>
    {{else}}
> <a id="{{title}}" href="{{originalPath}}">{{title}}</a>
    {{/if}}
{{else}}

{{/if}}

\`\`\` {{lang}}
{{{content}}}
\`\`\``;

    const template = Handlebars.compile(source);
    // compile with data
    const output = template(context);
    // => markdown strings
    return output;
};

export function parse(content, baseDir) {
    const results = [];
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
