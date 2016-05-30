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

```markdown
[include](fixtures/test.js)
```

or

```markdown
[import](fixtures/test.js)
```
Result

    ``` js
    console.log("test");
    ```

### Title

A title can be added using `title` or `title:<the title>`. In the first case,
the filename will be displayed.

```
[include,title](fixtures/test.js)
```

Result

    > <a name="test.js" href="fixtures/test.js">test.js</a>

    ``` js
    console.log("test");
    ```

```
[include,title:"Example of title"](fixtures/test.js)
```

Result

    > <a name="test.js" href="fixtures/test.js">Example of title</a>

    ``` js
    console.log("test");
    ```

### Hardcoded class

When you import a TypeScript file `.ts`:
The parser correctly finds `.ts` in the [language-map](https://github.com/blakeembrey/language-map "language-map") extensions for both TypeScript and XML, then automatically chooses `XML`.

If you want to specify language type, put `lang-<lang-name>` to label.

```markdown
[import, lang-typescript](hello-world.ts)
```

- :information_source: choose `<lang-name>` of `lang-<lang-name>` from language-map's `aceMode` value.
    - [blakeembrey/language-map: JSON version of the programming language map used in Linguist](https://github.com/blakeembrey/language-map "blakeembrey/language-map: JSON version of the programming language map used in Linguist")

e.g.) typescript's aceMode value is `typescript`. 

- https://github.com/blakeembrey/language-map/blob/b72edb8c2cb1b05d098782aa85dd2f573ed96ba3/languages.json#L4140

### Sliced Code

If you want to slice imported code and show.

```markdown
[import:<start-lineNumber>-<end-lineNumber>](path/to/file)
```

- :information_source: lineNumber start with 1.

All Patterns:

```
All: [import, hello-world.js](../src/hello-world.js)
1-2: [import:1-2, hello-world.js](../src/hello-world.js)
2-3: [import:2-3, hello-world.js](../src/hello-world.js)
2>=: [import:2-, hello-world.js](../src/hello-world.js)
<=3: [import:-3, hello-world.js](../src/hello-world.js)
```

### Snippet code

You can also import snippet code similarly to [doxygen](https://www.stack.nl/~dimitri/doxygen/manual/commands.html#cmdsnippet).

```markdown
[import:<markername>](path/to/file)
```

- :information_source: **markername** begins with an alphabet character

For example, considering the following C++ source code

- :information_source: should use **triple** comment mark for **markername**.
    - `///`, `//!` or `###` etc.. 

```cpp
// test.cpp source code
int main()
{
    /// [marker0]
    int a;
    //! [marker1]
    int b;
    //! [marker1]
    int c;
    /// [marker0]
}
```

In GitBook, the following commands 

```markdown
[import:marker1](path/to/test.cpp)
```

will result to

```cpp
    int b;
```

The command `[import:marker0](path/to/test.cpp)` will result to

```cpp
    int a;
    int b;
    int c;
```

## Example

Please See [example/](example/).

[![screenshot](https://monosnap.com/file/ydUDWzqXtC2bvPPBmqtplldO8l2QJK.png)](example/)

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
