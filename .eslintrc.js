module.exports = {
    env: {
        browser: true,
        commonjs: true,
        node: true,
        es6: true,
        mocha: true
    },
    plugins: ["prettier"],
    extends: ["eslint:recommended"],
    parserOptions: {
        sourceType: "module"
    },
    rules: {
        "prettier/prettier": [
            "error",
            {
                singleQuote: false,
                printWidth: 120,
                tabWidth: 4,
                trailingComma: "none"
            }
        ],
        "prefer-const": "error",
        "no-console": 0,
        "no-extra-semi": 0,
        "no-mixed-spaces-and-tabs": 0
    }
};
