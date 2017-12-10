const path = require("path");
const fs = require("fs");
module.exports = {
    gitbook: "3.x.x",
    title: "gitbook-plugin-include-codeblock example-custom",
    plugins: ["include-codeblock"],
    pluginsConfig: {
        "include-codeblock": {
            template: path.join(__dirname, "user-template.hbs")
        }
    }
};
