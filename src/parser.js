// LICENSE : MIT
"use strict";
var fs = require("fs");
var path = require('path');
var re = /\[([^\]]*?)\]\(([^\)]*?)\)/gm;
export function containIncludeLabel(label) {
    var reg = /^(include|import)$/;
    var commands = label.split(/[,\s]/);
    return commands.some(command => {
        return reg.test(command.trim());
    })
}

export function getLang(filePath) {
    var suffix = path.extname(filePath);
    return suffix.substring(1);
}
export function embedCode(filePath, originalPath) {
    var code = fs.readFileSync(filePath, "utf-8");
    var fileName = path.basename(filePath);
    var lang = getLang(filePath);
    return `> <a name="${fileName}" href="${originalPath}">${fileName}</a>

\`\`\` ${lang}
${code.trim()}
\`\`\``
}
export function parse(content, baseDir) {
    var results = [];
    var res;
    while (res = re.exec(content)) {
        var [all, label, filePath] = res;
        if (containIncludeLabel(label)) {
            results.push({
                target: all,
                replaced: embedCode(path.resolve(baseDir, filePath), filePath)
            });
        }
    }
    return results;
}