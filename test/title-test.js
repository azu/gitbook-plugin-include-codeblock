// LICENSE : MIT
"use strict";
const assert = require("power-assert");
//import {getTitle,hasTitle,hasTitleCustom} from "../src/title";
import {parseTitle} from "../src/title";

describe("title", function () {

    describe("title-label", function () {
        describe("#getTitle", function () {
            context("no title defined", function () {
                it("should return false, empty", function () {
                    const [exist,title] = parseTitle("test", "toto.js");
                    assert.equal(exist, false);
                    assert.equal(title, undefined);
                });
                it("should return true, empty", function () {
                    const [exist,title] = parseTitle("title", "toto.js");
                    assert.equal(exist, true);
                    assert.equal(title, "toto.js");
                });
                it("should return true, the title contain title word", function () {
                    const [exist,title] = parseTitle("title:'an example of title'", "toto.js");
                    assert.equal(exist, true);
                    assert.equal(title, "an example of title");
                });
                it("should return true, the title, contain import word", function () {
                    const [exist,title] = parseTitle("title:'an example of import'", "toto.js");
                    assert.equal(exist, true);
                    assert.equal(title, "an example of import");
                });
                it("should return true, the title with punctuation", function () {
                    const [exist,title] = parseTitle("title:'punctuation ?;:!'", "toto.js");
                    assert.equal(exist, true);
                    assert.equal(title, "punctuation ?;:!");
                });
                it("should return true, empty", function () {
                    const [exist,title] = parseTitle("title, lang-typescript", "toto.js");
                    assert.equal(exist, true);
                    assert.equal(title, "toto.js");
                });
            });
        });
    });
});
