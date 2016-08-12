const fs = require("fs");
module.exports = {
    "gitbook": "3.x.x",
    "title": "gitbook-plugin-include-codeblock example",
    "plugins": [
        "include-codeblock"
    ],
    "pluginsConfig": {
        "include-codeblock": {
            "template": fs.readFileSync(__dirname + "/user-template.hbs", "utf-8")
        }
    }
};