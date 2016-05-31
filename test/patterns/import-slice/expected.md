{% if file.type=="asciidoc" %}
> [[test.js]]link:test.js[test.js]
{% else %}
> <a id="test.js" href="test.js">test.js</a>
{% endif %}

``` javascript
console.log(1);
console.log(2);
```