{% if file.type=="asciidoc" %}++++{% endif %}
{%ace edit=true, check=true, theme="monokai", lang="javascript" %}
foo;
bar;
baz;

{%endace%}
{% if file.type=="asciidoc" %}++++{% endif %}
