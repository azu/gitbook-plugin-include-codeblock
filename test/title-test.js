// LICENSE : MIT
"use strict";
const assert = require("power-assert");
//import {getTitle,hasTitle,hasTitleCustom} from "../src/title";
import {getTitle} from "../src/title";

describe("title", function () {
    context("#getTitle", function () {
        it("should return the title", function () {
            const obj={
                   title:"an example of title",
                   id:"test",
                   marker:undefined
            };
            const title = getTitle(obj);
            assert.equal(title, "an example of title");
        });
    });
});
