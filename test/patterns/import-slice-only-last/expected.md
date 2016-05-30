{% if file.type=="asciidoc" %}
> [[line.js]]link:line.js[line.js]
{% else %}
> <a id="line.js" href="line.js">line.js</a>
{% endif %}

``` javascript
console.log("this is line 1");
console.log("this is line 2");
```