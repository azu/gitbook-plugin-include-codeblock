{% if file.type=="asciidoc" %}
> [[test.ts]]link:test.ts[test.ts]
{% else %}
> <a id="test.ts" href="test.ts">test.ts</a>
{% endif %}

``` xml
    var a;
    var b;
    var c;
```