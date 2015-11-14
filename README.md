# gitbook-plugin-include-codeblock [![Build Status](https://travis-ci.org/azu/gitbook-plugin-include-codeblock.svg?branch=master)](https://travis-ci.org/azu/gitbook-plugin-include-codeblock)

GitBook Plugin for including file.

## Installation

book.json

```json
{
  "plugins": [
    "include-codeblock"
  ]
}
```

and

```sh
gitbook install
```

## Usage

**fixtures/test.js**
```js
console.log("test");
```

Write following the link with `include` or `import` label.

```
[include](fixtures/test.js)
```

or

```
[import](fixtures/test.js)
```

Result

    > <a name="test.js" href="fixtures/test.js">test.js</a>
    
    ``` js
    console.log("test");
    ```

### Sliced Code

If you want to slice imported code and show.

`[import:<start-lineNumber>-<end-lineNumber>](path/to/file)`

- lineNumber start with 1.

All Patterns:

```
All: [import, hello-world.js](../src/hello-world.js)
1-2: [import:1-2, hello-world.js](../src/hello-world.js)
2-3: [import:2-3, hello-world.js](../src/hello-world.js)
2>=: [import:2-, hello-world.js](../src/hello-world.js)
<=3: [import:-3, hello-world.js](../src/hello-world.js)
```


## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
