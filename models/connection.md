# Connection

{% api-method method="patch" host="http://tower" path="/api/connections" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}
Patch an existing model instance or insert a new one into the data source.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}

{% api-method-body-parameters %}
{% api-method-parameter name="connection" type="object" required=false %}
{   
  "system": "string",   
  "url": "string",   
  "enabled": true,   
  "id": "string"   
}
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Connection successfully created or updated
{% endapi-method-response-example-description %}

```text
{
  "system": "string",
  "url": "string",
  "enabled": true,
  "id": "string"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unathorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="get" host="http://tower" path="/api/connections" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}
Find all instances of the model matched by filter from the data source.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}

{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Connections successfully obtained
{% endapi-method-response-example-description %}

```text
[
  {
    "system": "string",
    "url": "string",
    "enabled": true,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unathorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="head" host="http://tower" path="/api/connections" %}
{% api-method-summary %}
/{id}
{% endapi-method-summary %}

{% api-method-description %}
Check whether a model instance exists in the data source
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
Connection id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Connection exists \(or not\)
{% endapi-method-response-example-description %}

```text
{
  "exists": true
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unathorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="get" host="http://tower" path="/api/connections/" %}
{% api-method-summary %}
/{id}/exists
{% endapi-method-summary %}

{% api-method-description %}
Check whether a model instance exists in the data source
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
Connection id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Connection exists \(or not\)
{% endapi-method-response-example-description %}

```text
{
  "exists": true
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unathorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="get" host="http://tower" path="/api/connections" %}
{% api-method-summary %}
/testConnection
{% endapi-method-summary %}

{% api-method-description %}
Patch an existing model instance or insert a new one into the data source.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="type" type="string" required=false %}
Connection type \(LDAP/Vault\)
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Connection successful
{% endapi-method-response-example-description %}

```text

```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unathorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

