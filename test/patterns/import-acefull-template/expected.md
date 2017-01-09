{% if file.type=="asciidoc" %}
> [[test.js]]link:test.js[test.js]
{% else %}
> <a id="test.js" href="test.js">test.js</a>
{% endif %}

{% if file.type=="asciidoc" %}
+++
{% endif %}
{%ace edit="", check="", theme="", lang="javascript" %}
foo;
bar;
baz;

{%endace%}
{% if file.type=="asciidoc" %}
+++
{% endif %}
