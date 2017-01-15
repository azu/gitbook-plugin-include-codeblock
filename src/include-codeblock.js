// LICENSE : MIT
"use strict";
var logger = require('winston-color');
var path = require('path');
import {parse} from "./parser"

module.exports = {
    hooks: {
        "page:before": function(page) {
            var options = this.options.pluginsConfig["include-codeblock"];
            var pageDir = path.dirname(page.rawPath);
            var results = parse(page.content, pageDir, options);
            results.forEach(result => {
                var {target, replaced} = result;
                page.content = page.content.replace(target, replaced);
            });
            return page;
        }
    }
};

try {
    require.resolve("gitbook-plugin-ace");
    const aceLoaded = !! require('module')._cache[require.resolve('gitbook-plugin-ace')];
    if(aceLoaded) {
        console.log(""); // flush
        logger.error("`gitbook-plugin-include-codeblock` plugin must be loaded before `gitbook-plugin-ace`!");
        process.exit(1);
    }
} catch(e) {
    console.log(""); // flush
    logger.warn("ace features disabled (`gitbook-plugin-ace` required)");

}
