{% if file.type=="asciidoc" %}
> [[custom.js]]link:test.js[custom.js]
{% else %}
> <a id="custom.js" href="test.js">custom.js</a>
{% endif %}

``` javascript
console.log("test");
```