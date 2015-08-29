# gitbook-plugin-include-codeblock

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

    > <a name="test.js"></a>`test.js`
    
    ```js
    console.log("test");
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