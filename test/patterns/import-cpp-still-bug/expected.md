{% if file.type=="asciidoc" %}
> [[test.cpp]]link:test.cpp[test.cpp]
{% else %}
> <a id="test.cpp" href="test.cpp">test.cpp</a>
{% endif %}

``` c_cpp
int i:
```