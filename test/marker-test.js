// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import {getMarkerName, hasMarker, markersSliceCode, removeMarkers} from "../src/marker";

//-------------------------------------------------------------------------------
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

    // Test different naming and spacing.

    /// [marker 4]
    int f;
    /// [marker 4]

    ///     [marker5 space]
    int g;
    ///  [marker5 space]
    /// [ marker 6 ]
    int h;
    /// [ marker 6 ]
}
`;
//-------------------------------------------------------------------------------

// Expected results.
const expectedMarker0 = `    int a;
    //! [marker1]
    int b;
    //! [marker1]
    int c;`;
const expectedMarker01 = `    int a;
    int b;
    int c;`;
const expectedMarker1 = `    int b;`;
const expectedMarker2 = `    int d;`;
const expectedMarker3 = `    int e;`;
const expectedMarker4 = `    int f;`;
const expectedMarker5 = `    int g;`;
const expectedMarker6 = `    int h;`;


describe("marker", function () {
    describe("marker-label", function() {
        context("#getMarkerName", function() {
            it("should return", function(){
                const command = "import:my marker , test.cpp";
                const result = getMarkerName(command);
                assert.equal(result, "my marker ");
            });
            context("when use the slice code", function () {
                it("should marker is empty", function(){
                    const command = "import:1-10, test.cpp";
                    const result = getMarkerName(command);
                    assert.equal(result, "");
                });
            });
            context("when : is luck", function () {
                it("should return empty", function(){
                    const command = "import my marker , test.cpp";
                    const result = getMarkerName(command);
                    assert.equal(result, "");
                });
            });
        });
    });
    describe("marker-slice", function () {
        context("#nested", function() {
            it("should slice code between [marker0] keeping inner markers", function(){
                const markerName = "marker0";
                const result = markersSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker0);
            });
        });
        context("#comment-style", function() {
            it("should slice code between [marker1] with comment //:", function(){
                const markerName = "marker1";
                const result = markersSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker1);
            });
            it("should slice code between [marker2] using comment /**", function(){
                const markerName = "marker2";
                const result = markersSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker2);
            });
            it("should slice code between [marker3] using comment ///", function(){
                const markerName = "marker3";
                const result = markersSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker3);
            });
        });
        context("#comment-style", function() {
            it("should slice code between [marker 4]", function(){
                const markerName = "marker 4";
                const result = markersSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker4);
            });
            it("should slice code between [marker5 space]", function(){
                const markerName = "marker5 space";
                const result = markersSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker5);
            });
            it("should slice code between [ marker 6 ]", function(){
                const markerName = " marker 6 ";
                const result = markersSliceCode(cppcode, markerName);
                assert.equal(result, expectedMarker6);
            });
        });
    });
    describe("remove-marker", function() {
        context("#getMarkerName", function() {
            it("should slice code between [marker0] and remove markers [marker1]", function(){
                const markerName = "marker0";
                const result = removeMarkers( markersSliceCode(cppcode, markerName) );
                assert.equal(result, expectedMarker01);
            });
        });
    });
});

