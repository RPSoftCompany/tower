# Configuration Model

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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

{% api-method method="get" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}

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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```
[
  {
    "effectiveDate": "$now",
    "variables": [
      {
        "name": "string",
        "value": {},
        "type": "string",
        "forced": true,
        "addIfAbsent": true
      }
    ],
    "createdBy": "string",
    "promoted": false,
    "description": "",
    "version": 0,
    "draft": false,
    "id": "string"
  }
]
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```
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
