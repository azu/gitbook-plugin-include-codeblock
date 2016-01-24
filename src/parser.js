// LICENSE : MIT
"use strict";
var fs = require("fs");
var path = require('path');
var language_map = require('language-map');
var re = /\[([^\]]*?)\]\(([^\)]*?)\)/gm;
export function containIncludeLabel(label) {
    var reg = /^(include|import)$/;
    var commands = label.split(/(:|[,\s])/);
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

export function lookupLanguageByExtension(ext) {
    let aceMode;
    Object.keys(language_map).some(langKey => {
        const extensions = language_map[langKey]["extensions"];
        /* TODO: These lang has not extensions
        Ant Build System
        Isabelle ROOT
        Maven POMAnt Build System
         */
        if (!extensions) {
            return false;
        }
        return extensions.some(extension => {
            if (ext === extension) {
                aceMode = language_map[langKey]["aceMode"];
            }
        });
    });
    return aceMode;
}

export function getLang(filePath) {
    var ext = path.extname(filePath);

    return lookupLanguageByExtension(ext) || ext;
}
export function embedCode(filePath, originalPath, start, end) {
    var code = fs.readFileSync(filePath, "utf-8");
    var slicedCode = sliceCode(code, start, end);
    var fileName = path.basename(filePath);
    var lang = getLang(filePath);
    return `> <a name="${fileName}" href="${originalPath}">${fileName}</a>

\`\`\` ${lang}
${slicedCode.trim()}
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

export function parse(content, baseDir) {
    var results = [];
    var res;
    while (res = re.exec(content)) {
        var [all, label, filePath] = res;
        if (containIncludeLabel(label)) {
            var [start, end] = getSliceRange(label)
            results.push({
                target: all,
                replaced: embedCode(path.resolve(baseDir, filePath), filePath, start, end)
            });
        }
    }
    return results;
}
