// LICENSE : MIT
"use strict";
var path = require('path');
import {parse} from "./parser"
import {aceCheck} from "./ace-check"

aceCheck();

module.exports = {
    hooks: {
        "page:before": function(page) {
            this.getPluginConfig(opts,"include-codeblock");
            var pageDir = path.dirname(page.rawPath);
            var results = parse(page.content, pageDir, opts);
            results.forEach(result => {
                var {target, replaced} = result;
                page.content = page.content.replace(target, replaced);
            });
            return page;
        }
    }
};
