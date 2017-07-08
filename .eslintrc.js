module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true,
        "es6": true,
        "mocha": true
    },
    "plugins": [
        "prettier"
    ],
    "extends": [
        "eslint:recommended"
    ],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "prettier/prettier": ["error", {
            "printWidth": 100,
            "tabWidth": 4
        }],
        "prefer-const": "error",
        "no-console": "warn",
        "no-extra-semi": 0,
        "no-mixed-spaces-and-tabs": 0
    }
};
