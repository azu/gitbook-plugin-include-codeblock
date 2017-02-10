{% if file.type=="asciidoc" %}++++{% endif %}
{%ace edit=true, check=false, theme="monokai", lang="javascript" %}
foo;
bar;
baz;

{%endace%}
{% if file.type=="asciidoc" %}++++{% endif %}
