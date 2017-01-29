// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import {getMarker, hasMarker, markerSliceCode, removeMarkers} from "../src/marker";

// -------------------------------------------------------------------------------
// Test C++ Code
const cppcode = `
// test.cpp source code
int main()
{
    // Test inner markers.

    //! [marker0]
    int a;
    //! [marker1]
    int b;
    //! [marker1]
    int c;
    //! [marker0]

    // Test different comment style.

    /** [marker2] */
    int d;
    /** [marker2] */
    /// [marker3]
    int e;
    /// [marker3]
    ## [marker4]
    int f;
    ## [marker4]

    // Test different naming and spacing.

    /// [marker 5]
    int g;
    /// [marker 5]

    ///     [marker6 space]
    int h;
    ///  [marker6 space]
    /// [ marker 7 ]
    int i;
    /// [ marker 7 ]
}
`;
// -------------------------------------------------------------------------------

// Expected results.
const expectedMarker0 = `    int a;
    //! [marker1]
    int b;
    //! [marker1]
    int c;`;
const expectedMarker01 = `    int a;
    int b;
    int c;`;
const expectedMarker1 = "    int b;";
const expectedMarker2 = "    int d;";
const expectedMarker3 = "    int e;";
const expectedMarker4 = "    int f;";
const expectedMarker5 = "    int g;";
const expectedMarker6 = "    int h;";
const expectedMarker7 = "    int i;";


describe("marker", function () {
    describe("#hasMarker", function () {
        context("when have not marker", function () {
            it("should return false", function () {
                assert(!hasMarker({title: undefined, id: undefined, marker: undefined}));
            });
        });
        context("when have marker", function () {
            it("should return true", function () {
                assert(hasMarker({title: undefined, id: undefined, marker: "test"}));
            });
        });
    });
    describe("marker-label", function () {
        describe("#getMarkerName", function () {
            it("should return", function () {
                const result = getMarker({title: undefined, id: undefined, marker: "my marker"});
                assert.equal(result, "my marker");
            });
        });
    });
    describe("marker-slice", function () {
        context("#nested", function () {
            it("should slice code between [marker0] keeping inner markers", function () {
                const markerName = "marker0";
                const result = markerSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker0);
            });
        });
        context("#comment-style", function () {
            it("should slice code between [marker1] with comment //:", function () {
                const markerName = "marker1";
                const result = markerSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker1);
            });
            it("should slice code between [marker2] using comment /**", function () {
                const markerName = "marker2";
                const result = markerSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker2);
            });
            it("should slice code between [marker3] using comment ///", function () {
                const markerName = "marker3";
                const result = markerSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker3);
            });
            it("should slice code between [marker4] using comment ##", function () {
                const markerName = "marker4";
                const result = markerSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker4);
            });
        });
        context("#comment-style", function () {
            it("should slice code between [marker 5]", function () {
                const markerName = "marker 5";
                const result = markerSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker5);
            });
            it("should slice code between [marker6 space]", function () {
                const markerName = "marker6 space";
                const result = markerSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker6);
            });
            it("should slice code between [ marker 7 ]", function () {
                const markerName = " marker 7 ";
                const result = markerSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker7);
            });
        });
    });
    describe("remove-marker", function () {
        context("#getMarkerName", function () {
            it("should slice code between [marker0] and remove markers [marker1]", function () {
                const markerName = "marker0";
                const result = removeMarkers(markerSliceCode(cppcode, markerName));
                assert.equal(result, expectedMarker01);
            });
        });
    });
});

