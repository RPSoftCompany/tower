---
description: BaseConfiguration REST API documentation
---

# Base Configuration

{% api-method method="patch" host="http://tower" path="/api/baseConfigurations" %}
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
{% endapi-method-query-parameters %}

{% api-method-body-parameters %}
{% api-method-parameter name="icon" type="string" required=false %}
Icon name or svc to show it on user interface.
{% endapi-method-parameter %}

{% api-method-parameter name="sequenceNumber" type="integer" required=false %}
Sequence number - will be updated automaticaly
{% endapi-method-parameter %}

{% api-method-parameter name="name" type="string" required=false %}
Base Configuration name
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations saved successfully.
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "sequenceNumber": 0,
  "icon": "string",
  "id": "string"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIR
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="get" host="http://tower" path="/api/baseConfigurations" %}
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
{% api-method-parameter name="filter" type="string" required=false %}
Where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base configurations successfully obtained.
{% endapi-method-response-example-description %}

```text
[
  {
    "name": "string",
    "sequenceNumber": 0,
    "icon": "string",
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
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="put" host="http://tower" path="/api/baseConfigurations" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows you replace an existing model instance or insert a new one into the database.
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
{% endapi-method-query-parameters %}

{% api-method-body-parameters %}
{% api-method-parameter name="icon" type="string" required=false %}
Icon name or svc to show it on user interface.
{% endapi-method-parameter %}

{% api-method-parameter name="sequenceNumber" type="integer" required=false %}
Sequence number - will be updated automaticaly
{% endapi-method-parameter %}

{% api-method-parameter name="name" type="string" required=false %}
Base Configuration name
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations saved successfully.
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "sequenceNumber": 0,
  "icon": "string",
  "id": "string"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="http://tower" path="/api/baseConfigurations" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows you insert a new model instance into the database.
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
{% endapi-method-query-parameters %}

{% api-method-body-parameters %}
{% api-method-parameter name="icon" type="string" required=false %}
Icon name or svc to show it on user interface.
{% endapi-method-parameter %}

{% api-method-parameter name="sequenceNumber" type="integer" required=false %}
Sequence number - will be updated automaticaly
{% endapi-method-parameter %}

{% api-method-parameter name="name" type="string" required=false %}
Base Configuration name
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations saved successfully.
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "sequenceNumber": 0,
  "icon": "string",
  "id": "string"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="patch" host="http://tower" path="/api/baseConfigurations/{id}" %}
{% api-method-summary %}
/{id}
{% endapi-method-summary %}

{% api-method-description %}
This endpoint allows you path attributes for a model instance and persist it into the database.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
Base Configuration id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}

{% api-method-body-parameters %}
{% api-method-parameter name="icon" type="string" required=false %}
Icon name or svc to show it on user interface.
{% endapi-method-parameter %}

{% api-method-parameter name="sequenceNumber" type="integer" required=false %}
Sequence number - will be updated automaticaly
{% endapi-method-parameter %}

{% api-method-parameter name="name" type="string" required=false %}
Base Configuration name
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations saved successfully.
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "sequenceNumber": 0,
  "icon": "string",
  "id": "string"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="get" host="http://tower" path="/api/baseConfigurations/{id}" %}
{% api-method-summary %}
/{id}
{% endapi-method-summary %}

{% api-method-description %}
Find a model instance by {id} from the data source
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
Base Configuration id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}

{% api-method-body-parameters %}
{% api-method-parameter name="icon" type="string" required=false %}
Icon name or svc to show it on user interface.
{% endapi-method-parameter %}

{% api-method-parameter name="sequenceNumber" type="integer" required=false %}
Sequence number - will be updated automaticaly
{% endapi-method-parameter %}

{% api-method-parameter name="name" type="string" required=false %}
Base Configuration name
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations successfully obtained.
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "sequenceNumber": 0,
  "icon": "string",
  "id": "string"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="head" host="http://tower" path="/api/baseConfigurations/{id}" %}
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
Base Configuration id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations exists \(or not\).
{% endapi-method-response-example-description %}

```text
{
  "exists": true
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="put" host="http://tower" path="/api/baseConfigurations/{id}" %}
{% api-method-summary %}
/{id}
{% endapi-method-summary %}

{% api-method-description %}
Replace attributes for a model instance and persist it into the data source.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
Base Configuration id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}

{% api-method-body-parameters %}
{% api-method-parameter name="icon" type="string" required=false %}
Icon name or svc to show it on user interface.
{% endapi-method-parameter %}

{% api-method-parameter name="sequenceNumber" type="integer" required=false %}
Sequence number - will be updated automaticaly
{% endapi-method-parameter %}

{% api-method-parameter name="name" type="string" required=false %}
Base Configuration name
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations saved successfully.
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "sequenceNumber": 0,
  "icon": "string",
  "id": "string"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="delete" host="http://tower" path="/api/baseConfigurations/{id}" %}
{% api-method-summary %}
/{id}
{% endapi-method-summary %}

{% api-method-description %}
Delete a model instance by from the data source.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
Base Configuration id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations removed successfully.
{% endapi-method-response-example-description %}

```text
OK
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="get" host="http://tower" path="/api/baseConfigurations/{id}/exists" %}
{% api-method-summary %}
/{id}/exists
{% endapi-method-summary %}

{% api-method-description %}
Check whether a model instance exists in the data source.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
Base Configuration id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations exists \(or not\).
{% endapi-method-response-example-description %}

```text
{
  "exists": true
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="http://tower" path="/api/baseConfigurations/{id}/replace" %}
{% api-method-summary %}
/{id}/replace
{% endapi-method-summary %}

{% api-method-description %}
Replace attributes for a model instance and persist it into the data source.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
Base Configuration id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}

{% api-method-body-parameters %}
{% api-method-parameter name="icon" type="string" required=false %}
Icon name or svc to show it on user interface.
{% endapi-method-parameter %}

{% api-method-parameter name="sequenceNumber" type="integer" required=false %}
Sequence number - will be updated automaticaly
{% endapi-method-parameter %}

{% api-method-parameter name="name" type="string" required=false %}
Base Configuration name
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configurations saved successfully.
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "sequenceNumber": 0,
  "icon": "string",
  "id": "string"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Unauthorized
{% endapi-method-response-example-description %}

```text
{
  "error": {
    "statusCode": 401,
    "name": "Error",
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="http://tower" path="/api/baseConfigurations/changeSequence" %}
{% api-method-summary %}
/changeSequence
{% endapi-method-summary %}

{% api-method-description %}
Changes base model sequences
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}

{% api-method-body-parameters %}
{% api-method-parameter name="squenceNumber" type="string" required=true %}
Value, where you what this model to be in sequence
{% endapi-method-parameter %}

{% api-method-parameter name="name" type="string" required=true %}
Base Configuration name
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Base Configuration successfully updated.
{% endapi-method-response-example-description %}

```

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
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="get" host="http://tower" path="/api/baseConfigurations/count" %}
{% api-method-summary %}
/count
{% endapi-method-summary %}

{% api-method-description %}
Count instances of the model matched by where from the data source
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="where" type="string" required=false %}
where filter. You can read more about it on this page https://loopback.io/doc/en/lb3/Where-filter.html
{% endapi-method-parameter %}

{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```
{
  "count": 0
}
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
    "message": "Authorization Required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="get" host="http://tower" path="/api/baseConfigurations/count" %}
{% api-method-summary %}
/findOne
{% endapi-method-summary %}

{% api-method-description %}

{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="" type="string" required=false %}

{% endapi-method-parameter %}
{% endapi-method-path-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}

{% endapi-method-response-example-description %}

```

```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

