// LICENSE : MIT
"use strict";
var path = require('path');
import {parse} from "./parser"
module.exports = {
    hooks: {
        "page:before": function (page) {
            var pageDir = path.dirname(page.rawPath);
            var results = parse(page.content, pageDir);
            results.forEach(result => {
                var {target, replaced} = result;
                page.content = page.content.replace(target, replaced);
            });
            return page;
        }
    }
};
