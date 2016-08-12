# Template

- Should remove space each line
- `{{` and `}}` is GitBook template
- `{%` and `%}` is handlebar template

## Values

- `{{lang}}`: language for highlight
- `{{{content}}}`: Code
- `{{originalPath}}`: file path
- `{{fileName}}`: file name
- `{{title}}`: if label contain `title:` like this `[import, title:<value>]`
- `{{id}}`: if label contain `id:` like this `[import, id:<value>]`
- `{{class}}`: if label contain `class:` like this `[import, class:<value>]`

## Limitation

You should write with no space(indent).
Spacing conflict GitBook behavior.

## Example

    {{#if title}}
    {{#if id}}
    {% if file.type=="asciidoc" %}
    > [[{{id}}]]link:{{originalPath}}[{{title}}]
    {% else %}
    > <a id="{{id}}" href="{{originalPath}}">{{title}}</a>
    {% endif %}
    {{else}}
    {% if file.type=="asciidoc" %}
    > [[{{title}}]]link:{{originalPath}}[{{title}}]
    {% else %}
    > <a id="{{title}}" href="{{originalPath}}">{{title}}</a>
    {% endif %}
    {{/if}}
    {{else}}
    {% if file.type=="asciidoc" %}
    > [[{{fileName}}]]link:{{originalPath}}[{{fileName}}]
    {% else %}
    > <a id="{{fileName}}" href="{{originalPath}}">{{fileName}}</a>
    {% endif %}
    {{/if}}
    
    ``` {{lang}}
    {{{content}}}
    ```