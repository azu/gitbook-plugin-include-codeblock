// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse, parseVariablesFromLabel, containIncludeCommand, splitLabelToCommands} from "../src/parser"
var content = `
[include,title:"test.js"](fixtures/test.js)
`;
describe("parse", function () {
    context("translate lang", function () {
        it("should return object for replace", function () {
            var results = parse(content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include,title:\"test.js\"](fixtures/test.js)");
//------------------------------------------------------------------------------
            var expected =`\
        {% if file.type=="asciidoc" %}
> .link:fixtures/test.js[Code 0: test.js]
anchor:test.js[Code 0]
        {% else %}
> <a id="test.js" href="fixtures/test.js">Code 0: test.js</a>
        {% endif %}
`
                + '\n'
                + '``` javascript\nconsole.log(\"test\");\n```';
//------------------------------------------------------------------------------
            assert.equal(result.replaced, expected);
        });
        it("should prefer use lang-<aceMode>", function () {
            var exs_content = `[include, title:"test.ts", lang-typescript](fixtures/test.ts)`;
            var results = parse(exs_content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include, title:\"test.ts\", lang-typescript](fixtures/test.ts)");
//------------------------------------------------------------------------------
            var expected =`\
        {% if file.type=="asciidoc" %}
> .link:fixtures/test.ts[Code 1: test.ts]
anchor:test.ts[Code 1]
        {% else %}
> <a id="test.ts" href="fixtures/test.ts">Code 1: test.ts</a>
        {% endif %}
`
                + '\n'
                + '``` typescript\nconsole.log(\"test\");\n```';
//------------------------------------------------------------------------------
            assert.equal(result.replaced, expected);
        });
        it("should translate elixir extensions", function () {
            var exs_content = `[include, title:"test.exs"](fixtures/test.exs)`;
            var results = parse(exs_content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include, title:\"test.exs\"](fixtures/test.exs)");
//------------------------------------------------------------------------------
            var expected =`\
        {% if file.type=="asciidoc" %}
> .link:fixtures/test.exs[Code 2: test.exs]
anchor:test.exs[Code 2]
        {% else %}
> <a id="test.exs" href="fixtures/test.exs">Code 2: test.exs</a>
        {% endif %}
`
                + '\n'
                + '``` elixir\nIO.puts \"test\"\n```';
//------------------------------------------------------------------------------
            assert.equal(result.replaced, expected);
        });
        it("should translate Rust extensions", function () {
            var exs_content = `[include, title:"test.rs"](fixtures/test.rs)`;
            var results = parse(exs_content, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include, title:\"test.rs\"](fixtures/test.rs)");
//------------------------------------------------------------------------------
            var expected =`\
        {% if file.type=="asciidoc" %}
> .link:fixtures/test.rs[Code 3: test.rs]
anchor:test.rs[Code 3]
        {% else %}
> <a id="test.rs" href="fixtures/test.rs">Code 3: test.rs</a>
        {% endif %}
`
                + '\n'
                + '``` rust\nextern crate num;\n```';
//------------------------------------------------------------------------------
            assert.equal(result.replaced, expected);
        });
    });
    context("sliced text", function () {
        it("should return sliced object for replace", function () {
            var multiLineContent = "[include:4-6, title:\"line.js\"](fixtures/line.js)";
            var results = parse(multiLineContent, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, multiLineContent);
//------------------------------------------------------------------------------
            var expected =`\
        {% if file.type=="asciidoc" %}
> .link:fixtures/line.js[Code 4: line.js]
anchor:line.js[Code 4]
        {% else %}
> <a id="line.js" href="fixtures/line.js">Code 4: line.js</a>
        {% endif %}
`
                + '\n'
                + '``` javascript\n'
                + 'console.log(\"this is line 4\");\n'
                + 'console.log(\"this is line 5\");\n'
                + 'console.log(\"this is line 6\");\n'
                + '```';
//------------------------------------------------------------------------------
            assert.equal(result.replaced, expected);
        });
        it("should return sliced `start`- text", function () {
            var multiLineContent = "[include:9-, title:\"line.js\", line.js](fixtures/line.js)";
            var results = parse(multiLineContent, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, multiLineContent);
//------------------------------------------------------------------------------
            var expected =`\
        {% if file.type=="asciidoc" %}
> .link:fixtures/line.js[Code 5: line.js]
anchor:line.js[Code 5]
        {% else %}
> <a id="line.js" href="fixtures/line.js">Code 5: line.js</a>
        {% endif %}
`
                + '\n'
                + '``` javascript\n'
                + 'console.log(\"this is line 9\");\n'
                + 'console.log(\"this is line 10\");\n'
                + '```';
//------------------------------------------------------------------------------
            assert.equal(result.replaced, expected);
        });
        it("should return sliced -`end` text", function () {
            var multiLineContent = "[include:-2, title:\"line.js\", line.js](fixtures/line.js)";
            var results = parse(multiLineContent, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, multiLineContent);
//------------------------------------------------------------------------------
            var expected =`\
        {% if file.type=="asciidoc" %}
> .link:fixtures/line.js[Code 6: line.js]
anchor:line.js[Code 6]
        {% else %}
> <a id="line.js" href="fixtures/line.js">Code 6: line.js</a>
        {% endif %}
`
                + '\n'
                + '``` javascript\n'
                + 'console.log(\"this is line 1\");\n'
                + 'console.log(\"this is line 2\");\n'
                + '```';
//------------------------------------------------------------------------------
            assert.equal(result.replaced, expected);
        });
    });
    context("marker text", function () {
        it("should return sliced object for replace", function () {
            const multiLineContent = "[include:\"marker0\", title:\"marker.cpp\", marker.cpp](fixtures/marker.cpp)";
            const expectedMarker01 = `    int a;
    int b;
    int c;`;
            const results = parse(multiLineContent, __dirname);
            assert(results.length > 0);
            const result = results[0];
            assert.equal(result.target, multiLineContent);
//------------------------------------------------------------------------------
            var expected =`\
        {% if file.type=="asciidoc" %}
> .link:fixtures/marker.cpp[Code 7: marker.cpp]
anchor:marker.cpp[Code 7]
        {% else %}
> <a id="marker.cpp" href="fixtures/marker.cpp">Code 7: marker.cpp</a>
        {% endif %}
`
                + '\n'
                + '``` c_cpp\n'
                + expectedMarker01 + "\n"
                + '```';
//------------------------------------------------------------------------------
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
                + '``` javascript\nconsole.log("test");\n```';
            assert.equal(result.replaced, expected);
        });
        it("should replace content with a title", function () {
            var results = parse(`[include, title:'This is a title'](fixtures/test.js)`, __dirname);
            assert(results.length > 0);
            var result = results[0];
            assert.equal(result.target, "[include, title:'This is a title'](fixtures/test.js)");
//------------------------------------------------------------------------------
            var expected =`\
        {% if file.type=="asciidoc" %}
> .link:fixtures/test.js[Code 8: This is a title]
anchor:This is a title[Code 8]
        {% else %}
> <a id="This is a title" href="fixtures/test.js">Code 8: This is a title</a>
        {% endif %}

\`\`\` javascript
console.log("test");
\`\`\``;
//------------------------------------------------------------------------------
            assert.equal(result.replaced, expected);
        });
    });
    context("parseVariablesFromLabel ", function () {
        it("should retrieve each attribute", function () {
            const results = parseVariablesFromLabel(`include:"marker",title:"a test",id:"code1"`);
            assert.equal(results.title, "a test");
            assert.equal(results.id, "code1");
            assert.equal(results.marker, "marker");
        });
        it("should retrieve title,id", function () {
            const results = parseVariablesFromLabel(`include,title:"a test",id:"code1"`);
            assert.equal(results.title, "a test");
            assert.equal(results.id, "code1");
            assert.equal(results.marker, undefined);
        });
        it("should retrieve title,id from full command", function () {
            const results = parseVariablesFromLabel(`[include,title:"a test",id:"code1"](/path/to/file.ext)`);
            assert.equal(results.title, "a test");
            assert.equal(results.id, "code1");
            assert.equal(results.marker, undefined);
        });
        it("should retrieve nothing", function () {
            const results = parseVariablesFromLabel(`[import](/path/to/file.ext)`);
            assert.equal(results.title, undefined);
            assert.equal(results.id, undefined);
            assert.equal(results.marker, undefined);
        });
    });
});
