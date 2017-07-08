// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const fs = require("fs");
const path = require("path");
import { getSliceRange, hasSliceRange, sliceCode } from "../src/slicer";
const lineFixture = fs.readFileSync(path.join(__dirname, "fixtures/line.js"), "utf-8");
describe("slicer-test", function() {
    describe("#hasSliceRange", function() {
        context("when range is defined", function() {
            it("should return [undefined, undefined]", function() {
                assert(hasSliceRange("import:0-0 ,"));
                assert(hasSliceRange("import:1-2 ,"));
                assert(hasSliceRange("import:2-3 ,"));
                assert(hasSliceRange("import:2- ,"));
                assert(hasSliceRange("import:-3 ,"));
            });
        });
        context("when range is not defined", function() {
            it("should return [undefined, undefined]", function() {
                assert(!hasSliceRange("import:0"));
                assert(!hasSliceRange("import:test"));
                assert(!hasSliceRange("import"));
                assert(!hasSliceRange("1-5 only"));
                assert(!hasSliceRange("1-5"));
            });
        });
    });
    describe("#getSliceRange", function() {
        it("should return [start,end]", function() {
            const [start, end] = getSliceRange("import:1-5 , label");
            assert.equal(start, 1);
            assert.equal(end, 5);
        });
        context("when not defined range", function() {
            it("should return [undefined, undefined]", function() {
                const [start, end] = getSliceRange("import:test");
                assert(start === undefined);
                assert(end === undefined);
            });
        });
        context("when `import:1-2, hello-world.js`", function() {
            it("should return [1, 2]", function() {
                const [start, end] = getSliceRange("import:1-2, hello-world.js");
                assert(start === 1);
                assert(end === 2);
            });
        });
        context("when `import:2-3, hello-world.js`", function() {
            it("should return [2, 3]", function() {
                const [start, end] = getSliceRange("import:2-3, hello-world.js");
                assert(start === 2);
                assert(end === 3);
            });
        });
        context("when `import:2-, hello-world.js`", function() {
            it("should return [2, undefined]", function() {
                const [start, end] = getSliceRange("import:2-, hello-world.js");
                assert(start === 2);
                assert(end === undefined);
            });
        });
        context("when `import:-3, hello-world.js`", function() {
            it("should return [2, undefined]", function() {
                const [start, end] = getSliceRange("import:-3, hello-world.js");
                assert(start === undefined);
                assert(end === 3);
            });
        });
    });
    describe("#sliceCode", function() {
        it("should return sliced object for replace", function() {
            const [start, end] = getSliceRange("include:4-6, line.js");
            const result = sliceCode(lineFixture, start, end);
            assert(result.length > 0);
            const expected =
                'console.log("this is line 4");\n' +
                'console.log("this is line 5");\n' +
                'console.log("this is line 6");';
            assert.equal(result, expected);
        });
        it("should return sliced `start`- text", function() {
            const [start, end] = getSliceRange("include:9-, line.js");
            const result = sliceCode(lineFixture, start, end);
            assert(result.length > 0);
            const expected = 'console.log("this is line 9");\n' + 'console.log("this is line 10");';
            assert.equal(result, expected);
        });
        it("should return sliced -`end` text", function() {
            const [start, end] = getSliceRange("include:-2, line.js");
            const result = sliceCode(lineFixture, start, end);
            assert(result.length > 0);
            const expected = 'console.log("this is line 1");\n' + 'console.log("this is line 2");';
            assert.equal(result, expected);
        });
    });
});
