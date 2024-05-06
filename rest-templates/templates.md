---
description: On this page, you can find Tower templates for different technologies
---

# Templates

## HashiCorp Consul**®**

If you want Tower to serve the configuration in a manner similar to HashiCorp's Consul, simply create a new [endpoint](../user-interface/settings/api/endpoints-and-templates.md) with the following template:

```liquid
[
    {% raw %}
{%- for var in variables -%}
    {
	"LockIndex": 0,
{% comment %}
Please customize the following line with the Base names that are relevant to your configuration.
{% endcomment -%}
	"Key": "{{Technology}}/{{Environment}}/{{Application}}/{{var.name}}",
	"Flags": 0,
	{% case var.type -%}
	{% when "string", "password" -%}
	"Value":"{{ var.value | tower_toBase64 }}",
	{% when "number", "boolean" -%}
	"Value":"{{ var.value | tower_toBase64 }}",
	{% when "list" -%}
    	{% assign insideList = var.value | join: "\",\"" -%}
    	{% assign l = "[\"" | concat: insideList | concat: "\"]" -%}
	"Value": "{{l | tower_toBase64}}",
	{% else -%}
	"Value":"{{ var.value | tower_toBase64 }}",
	{% endcase -%}
	{% assign random = "" | tower_random -%}
	"CreateIndex": "{{random}}",
    	"ModifyIndex": "{{random}}"
    	}{%- if forloop.last != true -%},{%- endif -%}
    {%- endfor %}
{% endraw %}
]
```

## Spring Cloud Config Server

If you want Tower to serve the configuration in a manner similar to Spring Cloud Config Server, simply create a new [endpoint](../user-interface/settings/api/endpoints-and-templates.md) with the following template:

```liquid
{
{% raw %}
{% comment %}
Please customize the following line with the Base names that are relevant to your configuration.
{% endcomment -%}
    "name": "{{Application}}",
    "profiles": [
{% comment %}
Please customize the following line with the Base names that are relevant to your configuration.
{% endcomment -%}
        "{{Environment}}"
    ],
    "label": "main",
    "version": "{{version}}",
    "state": null,
    "propertySources": [
        {
{% comment %}
Please customize the following line with the Base names that are relevant to your configuration.
{% endcomment -%}        
            "name": "http://tower/{{Technology}}/{{Application}}/{{Environment}}",
            "source": {
                {%- for var in variables -%}
                {% case var.type -%}
                {% when "string", "password" -%}
                "{{ var.name }}":"{{ var.value }}"{%- if forloop.last != true -%},{%- endif -%}
                {% when "number", "boolean" -%}
                "{{ var.name }}":{{ var.value }}{%- if forloop.last != true -%},{%- endif -%}
                {% when "list" -%}
                "{{ var.name }}":[{% for listVar in var.value -%}"{{ listVar }}"{%- if forloop.last != true -%},{% else %}]{%- endif -%}{%- endfor -%}{%- if forloop.last != true -%},{%- endif -%}
                {% else %}
                "{{ var.name }}":"{{ var.value }}"{%- if forloop.last != true -%},{%- endif -%}
                {% endcase -%}
                {%- endfor -%}
{% endraw %}
            }
        }
    ]
}
```
