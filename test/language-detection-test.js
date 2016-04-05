// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
import {getLang, lookupLanguageByAceMode, lookupLanguageByExtension} from "../src/language-detection";
describe("language-detection", function () {
    describe("#lookupLanguageByAceMode", function () {
        it("should resolve language type by acemode", function () {
            const aceMode = lookupLanguageByAceMode(["lang-typescript"]);
            assert.equal(aceMode, "typescript");
        });
    });
    describe("#lookupLanguageByExtension", function () {
        it("should resolve language type by acemode", function () {
            const aceMode = lookupLanguageByExtension(".js");
            assert.equal(aceMode, "javascript");
        });
    });
    describe("#getLang", function () {
        context("specified aceMode", function () {
            it("should prefer use aceMode", function () {
                const lang = getLang(["lang-typescript"], "/path/to/file.js");
                assert.equal(lang, "typescript");
            });
            it("should detect using aceMode", function () {
                const lang = getLang(["lang-typescript"], "/path/to/file.ts");
                assert.equal(lang, "typescript");
            });
            it("should detect using aceMode, but fail, use ext as fallback", function () {
                const lang = getLang([], "/path/to/file.ts");
                assert.equal(lang, "xml");
            });
        });
        context("other using ext", function () {
            it("should detect using ext", function () {
                const lang = getLang([], "/path/to/file.rs");
                assert.equal(lang, "rust");
            });
        });
    });
});