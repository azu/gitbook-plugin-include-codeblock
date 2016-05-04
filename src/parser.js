// LICENSE : MIT
"use strict";
const fs = require("fs");
const path = require("path");
import {getLang} from "./language-detection";
import {getMarkerName, hasMarker, markersSliceCode, removeMarkers} from "./marker";
import {sliceCode, getSliceRange} from "./slicer";
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
 * @param {string} filePath
 * @param {string} originalPath
 * @param {number|undefined} start
 * @param {number|undefined} end
 * @param {string|undefined} marker
 */
export function embedCode({lang, filePath, originalPath, start, end, marker}) {
    const code = fs.readFileSync(filePath, "utf-8");
    const slicedCode = sliceCode(code, start, end);
    const fileName = path.basename(filePath);
    const content = slicedCode.trim();
    const markerContent = removeMarkers(markersSliceCode(code, marker));
    if (hasMarker(marker)) {
        return generateEmbedCode(lang, fileName, originalPath, markerContent);
    } else {
        return generateEmbedCode(lang, fileName, originalPath, content);
    }
}

export function generateEmbedCode(lang, fileName, originalPath, content) {
    return `> <a name="${fileName}" href="${originalPath}">${fileName}</a>

\`\`\` ${lang}
${content}
\`\`\``
}

export function parse(content, baseDir) {
    const results = [];
    let res;
    while (res = markdownLinkFormatRegExp.exec(content)) {
        const [all, label, originalPath] = res;
        const commands = splitLabelToCommands(label);
        if (containIncludeCommand(commands)) {
            const lang = getLang(commands, originalPath);
            const [start, end] = getSliceRange(label);
            const marker = getMarkerName(label);
            const absolutePath = path.resolve(baseDir, originalPath);
            const replacedContent = embedCode({
                lang,
                filePath: absolutePath,
                originalPath: originalPath,
                start,
                end,
                marker
            });
            results.push({
                target: all,
                replaced: replacedContent
            });
        }
    }
    return results;
}
