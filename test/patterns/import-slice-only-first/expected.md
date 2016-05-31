{% if file.type=="asciidoc" %}
> [[line.js]]link:line.js[line.js]
{% else %}
> <a id="line.js" href="line.js">line.js</a>
{% endif %}

``` javascript
console.log("this is line 9");
console.log("this is line 10");
```