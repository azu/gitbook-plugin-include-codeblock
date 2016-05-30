{% if file.type=="asciidoc" %}
> [[test.rs]]link:test.rs[test.rs]
{% else %}
> <a id="test.rs" href="test.rs">test.rs</a>
{% endif %}

``` rust
extern crate num;
```