// LICENSE : MIT
"use strict";
const fs = require("fs");
const path = require('path');
const {getLang} = require("./language-detection");
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

/*
 format: [import:<start-lineNumber>-<end-lineNumber>](path/to/file)
 lineNumber start with 1.

 Patterns:

 All: [import, hello-world.js](../src/hello-world.js)
 1-2: [import:1-2, hello-world.js](../src/hello-world.js)
 2-3: [import:2-3, hello-world.js](../src/hello-world.js)
 2>=: [import:2-, hello-world.js](../src/hello-world.js)
 <=3: [import:-3, hello-world.js](../src/hello-world.js)
 */
export function getSliceRange(label) {
    var reg = /^(?:include|import):?(\d*)-?(\d*)[,\s]?.*$/;
    var res = reg.exec(label);

    // return ['', ''] if not matched.
    return res ? res.slice(1) : [];
}

/*
 format: [import:<markername>](path/to/file)
 marker name start with alpha [a-Z] char.

 Example:

 [import:markname, hello-world.js](../src/hello-world.js)
 */
export function getMarkerName(label) {
    var reg = /^(?:include|import):?([a-zA-z]\w*)[,\s]?.*$/;
    var res = reg.exec(label);

    // return ['', ''] if not matched.
    return res ? res.slice(1) : [];
}

export function embedCode(lang, filePath, originalPath, start, end, marker) {
    const code = fs.readFileSync(filePath, "utf-8");
    const slicedCode = sliceCode(code, start, end);
    const fileName = path.basename(filePath);
    const content = slicedCode.trim();
    const content2 = markersSliceCode( code, marker );
    if(marker!='') {
        return generateEmbedCode(lang, fileName, originalPath, content2);
    }
    else {
        return generateEmbedCode(lang, fileName, originalPath, content);
    }
}

export function generateEmbedCode(lang, fileName, originalPath, content) {
    return `> <a name="${fileName}" href="${originalPath}">${fileName}</a>

\`\`\` ${lang}
${content}
\`\`\``
}

function sliceCode(code, start, end) {
    if (start === '' && end === '') {
        return code;
    }

    var splitted = code.split('\n');
    if (start === '') {
        start = 1;
    }
    if (end === '') {
        end = splitted.length;
    }
    return splitted.slice(start - 1, end).join('\n');
}

export function markersSliceCode( code, markername )
{
    if( markername === '' ) {
        return code;
    }
    else {
        // various language comment
        var commentOpen="(\/+\/+|#|%|\/\\*)";
        var commentClose="(\\*\/)?";
        var balise="\\["+markername+"\\]";
        var pattern=commentOpen + ".*\\s*" + balise + ".*\\s*" + commentClose;
        var regstr=pattern+"([\\s\\S]*)"+pattern;
        var reg = new RegExp(regstr);

        //var reg = /\[toto\]([\s\S]*)\[toto\]/;
        var res = code.match(reg);
        if(res) {
            return res[3];
        }
        else {
            console.warn('marker `'+markername+'` not found');
            return [];
        }
    }
}

export function parse(content, baseDir) {
    const results = [];
    let res;
    while (res = markdownLinkFormatRegExp.exec(content)) {
        const [all, label, filePath] = res;
        const commands = splitLabelToCommands(label);
        if (containIncludeCommand(commands)) {
            const lang = getLang(commands, filePath);
            const [start, end] = getSliceRange(label);
            const marker = getMarkerName(label);
            const absolutePath = path.resolve(baseDir, filePath);
            const replacedContent = embedCode(lang, absolutePath, filePath, start, end, marker);
            results.push({
                target: all,
                replaced: replacedContent
            });
        }
    }
    return results;
}
