const path = require("path");
module.exports = {
    pluginsConfig: {
        "include-codeblock": {
            template: path.join(__dirname, "dump.hbs")
        }
    }
};
