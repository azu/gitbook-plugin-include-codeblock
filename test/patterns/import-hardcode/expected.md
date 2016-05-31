{% if file.type=="asciidoc" %}
> [[test.ts]]link:test.ts[test.ts]
{% else %}
> <a id="test.ts" href="test.ts">test.ts</a>
{% endif %}

``` typescript
console.log("test");
```