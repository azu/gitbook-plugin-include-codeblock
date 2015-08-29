// LICENSE : MIT
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var fs = require("fs");
var path = require('path');
var Promise = require('bluebird');
var re = /\[([^\]]*?)\]\(([^\)]*?)\)/gm;
function containIncludeCommand(commands) {
    var reg = /^(include|import)$/;
    return commands.some(function (command) {
        return reg.test(command.trim());
    });
}

function getLang(filePath) {
    var suffix = path.extname(filePath);
    return suffix.substring(1);
}
function embedCode(filePath) {
    var code = fs.readFileSync(filePath, "utf-8");
    var lang = getLang(filePath);
    return "``` " + lang + "\n" + code.trim() + "\n```";
}
function parse(content, baseDir) {
    var results = [];
    var res;
    while (res = re.exec(content)) {
        var _res = res;

        var _res2 = _slicedToArray(_res, 3);

        var all = _res2[0];
        var label = _res2[1];
        var filePath = _res2[2];

        var commands = label.split(",");
        if (containIncludeCommand(commands)) {
            results.push({
                target: all,
                replaced: embedCode(path.resolve(baseDir, filePath))
            });
        }
    }
    return results;
}

module.exports = {
    parse: parse
};
//# sourceMappingURL=parser.js.map