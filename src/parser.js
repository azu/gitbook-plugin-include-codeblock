// LICENSE : MIT
"use strict";
var fs = require("fs");
var path = require('path');
var re = /\[([^\]]*?)\]\(([^\)]*?)\)/gm;
function containIncludeCommand(commands) {
    var reg = /^(include|import)$/;
    return commands.some(command => {
        return reg.test(command.trim());
    })
}

function getLang(filePath) {
    var suffix = path.extname(filePath);
    return suffix.substring(1);
}
function embedCode(filePath,originalPath) {
    var code = fs.readFileSync(filePath, "utf-8");
    var fileName = path.basename(filePath);
    var lang = getLang(filePath);
    return `> [${fileName}](${originalPath})
<a name="${fileName}"></a>
\`\`\` ${lang}
${code.trim()}
\`\`\``
}
function parse(content, baseDir) {
    var results = [];
    var res;
    while (res = re.exec(content)) {
        var [all, label, filePath] = res;
        var commands = label.split(",");
        if (containIncludeCommand(commands)) {
            results.push({
                target: all,
                replaced: embedCode(path.resolve(baseDir, filePath),filePath)
            });
        }
    }
    return results;
}

module.exports = {
    parse: parse
};