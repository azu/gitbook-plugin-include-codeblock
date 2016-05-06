// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse, containIncludeCommand, splitLabelToCommands} from "../src/parser"
var content = `
[include,title](fixtures/test.js)
`;
describe("parse", function () {
    context("translate lang", function () {
        it("should return object for replace", function () {
            var results = parse(content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include,title](fixtures/test.js)");
            var expected = '> <a name="test.js" href="fixtures/test.js">test.js</a>\n'
                + '\n'
                + '``` javascript\nconsole.log(\"test\");\n```';
            assert.equal(result.replaced, expected);
        });
        it("should prefer use lang-<aceMode>", function () {
            var exs_content = `[include, title, lang-typescript](fixtures/test.ts)`;
            var results = parse(exs_content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include, title, lang-typescript](fixtures/test.ts)");
            var expected = '> <a name="test.ts" href="fixtures/test.ts">test.ts</a>\n'
                + '\n'
                + '``` typescript\nconsole.log(\"test\");\n```';
            assert.equal(result.replaced, expected);
        });
        it("should translate elixir extensions", function () {
            var exs_content = `[include, title](fixtures/test.exs)`;
            var results = parse(exs_content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include, title](fixtures/test.exs)");
            var expected = '> <a name="test.exs" href="fixtures/test.exs">test.exs</a>\n'
                + '\n'
                + '``` elixir\nIO.puts \"test\"\n```';
            assert.equal(result.replaced, expected);
        });
        it("should translate Rust extensions", function () {
            var exs_content = `[include, title](fixtures/test.rs)`;
            var results = parse(exs_content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include, title](fixtures/test.rs)");
            var expected = '> <a name="test.rs" href="fixtures/test.rs">test.rs</a>\n'
                + '\n'
                + '``` rust\nextern crate num;\n```';
            assert.equal(result.replaced, expected);
        });
    });
    context("sliced text", function () {
        it("should return sliced object for replace", function () {
            var multiLineContent = "[include:4-6, title, line.js](fixtures/line.js)";
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
            var multiLineContent = "[include:9-, title, line.js](fixtures/line.js)";
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
            var multiLineContent = "[include:-2, title, line.js](fixtures/line.js)";
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
    context("marker text", function () {
        it("should return sliced object for replace", function () {
            const multiLineContent = "[include:marker0, title, marker.cpp](fixtures/marker.cpp)";
            const expectedMarker01 = `    int a;
    int b;
    int c;`;
            const results = parse(multiLineContent, __dirname);
            assert(results.length > 0);
            const result = results[0];
            assert.equal(result.target, multiLineContent);
            const expected = '> <a name="marker.cpp" href="fixtures/marker.cpp">marker.cpp</a>\n'
                + '\n'
                + '``` c_cpp\n'
                + expectedMarker01 + "\n"
                + '```';
            assert.equal(result.replaced, expected);
        });
    });
    describe("#splitLabelToCommands", function () {
        it("should split label to commands", function () {
            const commands = splitLabelToCommands("import");
            assert.equal(commands.length, 1);
            assert.equal(commands[0], "import");
        });
        it("should not contain space in command", function () {
            const commands = splitLabelToCommands("command1 command2, command3    ");
            // Should 3 but 4..
            assert(commands.length > 3);
            assert(commands.indexOf("command1") !== -1);
            assert(commands.indexOf("command2") !== -1);
            assert(commands.indexOf("command3") !== -1);
        });
    });
    describe("containIncludeLabel", function () {
        it("support import", function () {
            const commands = splitLabelToCommands("import");
            assert(containIncludeCommand(commands));
        });
        it("support include", function () {
            const commands = splitLabelToCommands("include");
            assert(containIncludeCommand(commands));
        });
        it("support command split by space", function () {
            const commands = splitLabelToCommands("import title");
            assert(containIncludeCommand(commands));
        });
        it("support command split by ,", function () {
            const commands = splitLabelToCommands("import title");
            assert(containIncludeCommand(commands));
        });
    })
    context("title", function () {
        it("should replace content without any title", function () {
            var results = parse(`[include](fixtures/test.js)`, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include](fixtures/test.js)");
            var expected = '\n'
                + '\n'
                + '``` javascript\nconsole.log(\"test\");\n```';
            assert.equal(result.replaced, expected);
        });
        it("should replace content without any title", function () {
            var results = parse(`[include, title](fixtures/test.js)`, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include, title](fixtures/test.js)");
            var expected = '> <a name="test.js" href="fixtures/test.js">test.js</a>\n'
                + '\n'
                + '``` javascript\nconsole.log(\"test\");\n```';
            assert.equal(result.replaced, expected);
        });
        it("should replace content without any title", function () {
            var results = parse(`[include, title:'This is a title'](fixtures/test.js)`, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include, title:'This is a title'](fixtures/test.js)");
            var expected = '> <a name="test.js" href="fixtures/test.js">This is a title</a>\n'
                + '\n'
                + '``` javascript\nconsole.log(\"test\");\n```';
            assert.equal(result.replaced, expected);
        });
    });
});
