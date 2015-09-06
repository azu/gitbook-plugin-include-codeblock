// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse} from "../src/parser"
var content = `
[include](fixtures/test.js)
`;
describe("parse", function () {
    it("should return object for replace", function () {
        var results = parse(content, __dirname);
        assert(results.length > 0);
        var result = results[0];
        assert.equal(result.target, "[include](fixtures/test.js)");
        var expected = '> <a name="test.js" href="fixtures/test.js">test.js</a>\n'
            + '\n'
            + '``` js\nconsole.log(\"test\");\n```';
        console.log(expected);
        assert.equal(result.replaced, expected);
    });
});

