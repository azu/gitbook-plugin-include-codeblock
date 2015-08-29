// LICENSE : MIT
"use strict";
var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
import {parse} from "./parser"
module.exports = {
    hooks: {
        "page:before": function (page) {
            var results = parse(page.content);
            results.forEach(result => {
                var {target, replaced} = result;
                page.content = page.content.replace(target, replaced);
            });
            return page;
        }
    }
};
