{% if file.type=="asciidoc" %}
> [[test.exs]]link:test.exs[test.exs]
{% else %}
> <a id="test.exs" href="test.exs">test.exs</a>
{% endif %}

``` elixir
IO.puts "test"
```