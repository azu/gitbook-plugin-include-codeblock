{% if file.type=="asciidoc" %}
> [[test.unknownLang]]link:test.unknownLang[test.unknownLang]
{% else %}
> <a id="test.unknownLang" href="test.unknownLang">test.unknownLang</a>
{% endif %}

``` unknownLang
console.log("test");
```