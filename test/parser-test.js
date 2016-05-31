// LICENSE : MIT
"use strict";
import assert from "power-assert"
import {parse, parseVariablesFromLabel, containIncludeCommand, splitLabelToCommands} from "../src/parser"
var content = `
[include,title:"test.js"](fixtures/test.js)
`;
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
