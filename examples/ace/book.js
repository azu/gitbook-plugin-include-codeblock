const fs = require("fs");
module.exports = {
    gitbook: "3.x.x",
    title: "gitbook-plugin-include-codeblock example-ace",
    plugins: ["include-codeblock", "ace"],
    pluginsConfig: {
        "include-codeblock": {
            template: "ace"
        }
    }
};
