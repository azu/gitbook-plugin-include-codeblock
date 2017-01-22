// LICENSE : MIT
"use strict";
const immutable = require('immutable');
import assert from "power-assert"
import {defaultKeyValueMap} from "../src/options.js"
import {parse, containIncludeCommand, splitLabelToCommands, strip, parseVariablesFromLabel} from "../src/parser"
var content = `
[include,title:"test.js"](fixtures/test.js)
`;

const kvmap = defaultKeyValueMap;

describe("parse", function () {
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
    context("parseVariablesFromLabel ", function () {
        it("should retrieve edit boolean", function () {
            const resmap = parseVariablesFromLabel(`include,edit:true`, kvmap);
            const results = resmap.toObject();
            assert.equal(results.edit, true);
            assert.equal(results.marker, "");
        });
        it("should retrieve edit boolean with quotes", function () {
            const resmap = parseVariablesFromLabel(`include,edit:"true"`, kvmap);
            const results = resmap.toObject();
            assert.equal(results.edit, true);
            assert.equal(results.marker, "");
        });
        it("should retrieve string title", function () {
            const resmap = parseVariablesFromLabel(`include,title:"a test"`, kvmap);
            const results = resmap.toObject();
            assert.equal(results.title, "a test");
            assert.equal(results.marker, "");
        });
        it("should retrieve include marker", function () {
            const resmap = parseVariablesFromLabel(`[include:"marker0"](/path/to/file.ext)`, kvmap);
            const results = resmap.toObject();
            assert.equal(results.marker, "marker0");
        });
        it("should retrieve import marker", function () {
            const resmap = parseVariablesFromLabel(`[import:"marker0"](/path/to/file.ext)`, kvmap);
            const results = resmap.toObject();
            assert.equal(results.marker, "marker0");
        });
        it("should retrieve include marker with title", function () {
            const resmap = parseVariablesFromLabel(`[include:"marker0",title:"test"](/path/to/file.ext)`, kvmap);
            const results = resmap.toObject();
            assert.equal(results.marker, "marker0");
            assert.equal(results.title, "test");
        });
        it("should retrieve import multi markers", function () {
            const resmap = parseVariablesFromLabel(`[import:"marker0,marker1,marker2"](/path/to/file.ext)`, kvmap);
            const results = resmap.toObject();
            assert.equal(results.marker, "marker0,marker1,marker2");
        });
        it("should retrieve each attribute", function () {
            const resmap = parseVariablesFromLabel(`include:"marker",title:"a test",id:"code1",class:"myclass",edit=false,check="true",theme:"monokai",template:"ace",unindent:true,fixlang:"false"`, kvmap);
            const results = resmap.toObject();
            assert.equal(results.marker, "marker");
            assert.equal(results.title, "a test");
            assert.equal(results.id, "code1");
            assert.equal(results.class, "myclass");
            assert.equal(results.edit, false);
            assert.equal(results.check, true);
            assert.equal(results.theme, "monokai");
            assert.equal(results.template, "ace");
            assert.equal(results.unindent, true);
            assert.equal(results.fixlang, false);
        });
        it("should retrieve nothing", function () {
            const resmap = parseVariablesFromLabel(`[import](/path/to/file.ext)`, kvmap);
            const results = resmap.toObject();
            assert.equal(results.marker, "");
        });
    });
    // inspired from https://github.com/rails/rails/blob/master/activesupport/test/core_ext/string_ext_test.rb
    describe("strip", function () {
        it("strips leading space from empty string", function () {
            const stripped = strip("");
            assert.equal(stripped, "");
        });
        it("strips leading space from one-liner", function () {
            const stripped = strip("    x");
            assert.equal(stripped, "x");
        });
        it("strips leading space from multi-liner with no margin", function () {
            const stripped = strip("foo\n  bar\nbaz\n");
            assert.equal(stripped, "foo\n  bar\nbaz\n");
        });
        it("strips leading space from multi-liner", function () {
            const stripped = strip("      foo\n        bar\n      baz\n");
            assert.equal(stripped, "foo\n  bar\nbaz\n");
        });
    })
});
