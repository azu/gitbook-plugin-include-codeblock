{% if file.type=="asciidoc" %}++++{% endif %}
{%ace edit=true, check=false, theme="chrome", lang="javascript" %}
foo;
bar;
baz;

{%endace%}
{% if file.type=="asciidoc" %}++++{% endif %}
