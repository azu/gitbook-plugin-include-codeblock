// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse, containIncludeLabel} from "../src/parser"
var content = `
[include](fixtures/test.js)
`;
describe("parse", function () {
    context("translate lang", function () {
        it("should return object for replace", function () {
            var results = parse(content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include](fixtures/test.js)");
            var expected = '> <a name="test.js" href="fixtures/test.js">test.js</a>\n'
                + '\n'
                + '``` javascript\nconsole.log(\"test\");\n```';
            assert.equal(result.replaced, expected);
        });
        it("should translate elixir extensions", function () {
            var exs_content = `
        [include](fixtures/test.exs)
        `;
            var results = parse(exs_content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include](fixtures/test.exs)");
            var expected = '> <a name="test.exs" href="fixtures/test.exs">test.exs</a>\n'
                + '\n'
                + '``` elixir\nIO.puts \"test\"\n```';
            assert.equal(result.replaced, expected);
        });
        it("should translate Rust extensions", function () {
            var exs_content = `
        [include](fixtures/test.rs)
        `;
            var results = parse(exs_content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include](fixtures/test.rs)");
            var expected = '> <a name="test.rs" href="fixtures/test.rs">test.rs</a>\n'
                + '\n'
                + '``` rust\nextern crate num;\n```';
            assert.equal(result.replaced, expected);
        });
    });
    context("sliced text", function () {
        it("should return sliced object for replace", function () {
            var multiLineContent = "[include:4-6, line.js](fixtures/line.js)";
            var results = parse(multiLineContent, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, multiLineContent);
            var expected = '> <a name="line.js" href="fixtures/line.js">line.js</a>\n'
                + '\n'
                + '``` javascript\n'
                + 'console.log(\"this is line 4\");\n'
                + 'console.log(\"this is line 5\");\n'
                + 'console.log(\"this is line 6\");\n'
                + '```';
            assert.equal(result.replaced, expected);
        });
        it("should return sliced `start`- text", function () {
            var multiLineContent = "[include:9-, line.js](fixtures/line.js)";
            var results = parse(multiLineContent, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, multiLineContent);
            var expected = '> <a name="line.js" href="fixtures/line.js">line.js</a>\n'
                + '\n'
                + '``` javascript\n'
                + 'console.log(\"this is line 9\");\n'
                + 'console.log(\"this is line 10\");\n'
                + '```';
            assert.equal(result.replaced, expected);
        });
        it("should return sliced -`end` text", function () {
            var multiLineContent = "[include:-2, line.js](fixtures/line.js)";
            var results = parse(multiLineContent, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, multiLineContent);
            var expected = '> <a name="line.js" href="fixtures/line.js">line.js</a>\n'
                + '\n'
                + '``` javascript\n'
                + 'console.log(\"this is line 1\");\n'
                + 'console.log(\"this is line 2\");\n'
                + '```';
            assert.equal(result.replaced, expected);
        });
    });
    describe("containIncludeLabel", function () {
        it("support import", function () {
            assert(containIncludeLabel("import"));
        });
        it("support include", function () {
            assert(containIncludeLabel("include"));
        });
        it("support command split by space", function () {
            assert(containIncludeLabel("import title"));
        });
        it("support command split by ,", function () {
            assert(containIncludeLabel("import, title"));
        });
    })
});
