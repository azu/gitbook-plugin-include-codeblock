// LICENSE : MIT
"use strict";
const fs = require("fs");
const path = require("path");
import {getLang} from "./language-detection";
import {getMarkerName, hasMarker, markersSliceCode, removeMarkers} from "./marker";
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
    const title = parseTitle(label,fileName);
    if (hasSliceRange(label)) {
        const [start, end] = getSliceRange(label);
        const content = sliceCode(code, start, end);
        return generateEmbedCode(lang, title, fileName, originalPath, content);
    } else if (hasMarker(label)) {
        const marker = getMarkerName(label);
        const content = removeMarkers(markersSliceCode(code, marker));
        return generateEmbedCode(lang, title, fileName, originalPath, content);
    } else {
        return generateEmbedCode(lang, title, fileName, originalPath, code);
    }
}

export function generateEmbedCode(lang, title, fileName, originalPath, content) {
    const [hasTitle,theTitle] = title;
    var mdTitle ='';
    var mdContent='';
    if(hasTitle) {
        mdTitle= `> <a name="${fileName}" href="${originalPath}">${theTitle}</a>`;
        mdContent= mdContent+mdTitle;
    }

    mdContent= mdContent+`

\`\`\` ${lang}
${content}
\`\`\``

    return mdContent;
}

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
