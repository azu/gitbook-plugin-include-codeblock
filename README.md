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

## Options

You can put your template into `book.js`(`book.json`) by `template` option.

```js
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
```

See [template/](template/) and [example/](example/) for details.

You can also unindent the included text by specifying the `unindent` option:

```js
"pluginsConfig": {
    "include-codeblock": {
        "unindent": true
    }
}
```

Alternatively, unindent can be specified on a per-tag basis (see below)

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

<!--
### Title(from v)

A title can be added using `title:<the title>`.
In the first case, the filename will be displayed.

```
[include, title:"test.js"](fixtures/test.js)
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
-->

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

### Unindented code

Consider the following source code:

```java
class Hello {
    /// [some-marker]
    void world() {
        // nice
    }
    /// [some-marker]
}
```

And the following command:

```
[import:"some-marker",unindent:"true"](path/to/test.java)
```

This will result in unindented code:

```java
void world() {
    // nice
}
```

Unindent behaviour can also be specified globally in the plugin configuration.

## Example

Please See [example/](example/).

[![screenshot](https://monosnap.com/file/ydUDWzqXtC2bvPPBmqtplldO8l2QJK.png)](example/)

## FAQ

### How to migrate Version 1.x to 2.x

Version 2.0 contain a breaking change.

- [Breaking Change: change default template by azu · Pull Request #31 · azu/gitbook-plugin-include-codeblock](https://github.com/azu/gitbook-plugin-include-codeblock/pull/31 "Breaking Change: change default template by azu · Pull Request #31 · azu/gitbook-plugin-include-codeblock")

It change default template for displaying embed code.

Version 1.x template.

    {{#if title}}
    {{#if id}}
    {% if file.type=="asciidoc" %}
    > [[{{id}}]]link:{{originalPath}}[{{title}}]
    {% else %}
    > <a id="{{id}}" href="{{originalPath}}">{{title}}</a>
    {% endif %}
    {{else}}
    {% if file.type=="asciidoc" %}
    > [[{{title}}]]link:{{originalPath}}[{{title}}]
    {% else %}
    > <a id="{{title}}" href="{{originalPath}}">{{title}}</a>
    {% endif %}
    {{/if}}
    {{else}}
    {% if file.type=="asciidoc" %}
    > [[{{fileName}}]]link:{{originalPath}}[{{fileName}}]
    {% else %}
    > <a id="{{fileName}}" href="{{originalPath}}">{{fileName}}</a>
    {% endif %}
    {{/if}}

    ``` {{lang}}
    {{{content}}}
    ```

Version 2.x template.

    ``` {{lang}}
    {{{content}}}
    ```

If you want to use Version 1.x template, please set `template` option to `book.json` or `book.js`

```js
const fs = require("fs");
module.exports = {
    "gitbook": "3.x.x",
    "title": "gitbook-plugin-include-codeblock example",
    "plugins": [
        "include-codeblock"
    ],
    "pluginsConfig": {
        "include-codeblock": {
            // Before, create user-template.hbs
            "template": fs.readFileSync(__dirname + "/user-template.hbs", "utf-8")
        }
    }
};
```

If you want to know more details, please see [template/](template/).

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
