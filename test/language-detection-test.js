// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import { defaultKeyValueMap } from "../src/options.js";
import { getLang, lookupLanguageByAceMode, lookupLanguageByExtension } from "../src/language-detection";

const kvmap = defaultKeyValueMap;

describe("language-detection", function() {
    describe("#lookupLanguageByAceMode", function() {
        it("should resolve language type by acemode", function() {
            const kvm = Object.assign({}, kvmap);
            kvm.lang = "typescript";
            const aceMode = lookupLanguageByAceMode(kvm);
            assert.equal(aceMode, "typescript");
        });
    });
    describe("#lookupLanguageByExtension", function() {
        context("lang ext or file ext", function() {
            it("should resolve acemode by lang ext", function() {
                const kvm = Object.assign({}, kvmap);
                kvm.lang = ".js";
                const aceMode = lookupLanguageByExtension(kvm, "/path/to/file.rs");
                assert.equal(aceMode, "javascript");
            });
            it("should resolve acemode by file ext", function() {
                const aceMode = lookupLanguageByExtension(kvmap, "/path/to/file.rs");
                assert.equal(aceMode, "rust");
            });
        });
    });
    describe("#getLang", function() {
        context("specified aceMode", function() {
            it("should prefer use aceMode", function() {
                const kvm = Object.assign({}, kvmap);
                kvm.lang = "typescript";
                Object.freeze(kvm);
                const kvml = getLang(kvm, "/path/to/file.js");
                const lang = kvml.lang;
                assert.equal(lang, "typescript");
            });
            it("should detect using aceMode", function() {
                const kvm = Object.assign({}, kvmap);
                kvm.lang = "typescript";
                Object.freeze(kvm);
                const kvml = getLang(kvm, "/path/to/file.ts");
                const lang = kvml.lang;
                assert.equal(lang, "typescript");
            });
            it("should detect use default, aceMode not found (+warn)", function() {
                const kvml = getLang(kvmap, "/path/to/file.fakext");
                const lang = kvml.lang;
                assert.equal(lang, "");
            });
        });
        context("other using ext", function() {
            it("should detect using ext", function() {
                const kvml = getLang(kvmap, "/path/to/file.rs");
                const lang = kvml.lang;
                assert.equal(lang, "rust");
            });
        });
    });
});
