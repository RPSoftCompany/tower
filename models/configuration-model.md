# Configuration Model

{% api-method method="patch" host="http://tower" path="/configurationModels" %}
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
Authentication token.
{% endapi-method-parameter %}

{% api-method-parameter name="model" type="object" required=false %}
ConfigurationModel object to change/create
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configuration Model successfully created/updated
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "rules": [
    {
      "_id": "string",
      "targetValue": "string",
      "targetType": "string",
      "targetRegEx": true,
      "conditionValue": "string",
      "conditionType": "string",
      "conditionRegEx": true,
      "error": "string"
    }
  ],
  "restrictions": [
    "string"
  ],
  "defaultValues": [
    {
      "effectiveDate": "$now",
      "createdBy": "string",
      "variables": [
        {
          "name": "string",
          "value": {},
          "type": "string",
          "forced": true,
          "addIfAbsent": true
        }
      ],
      "id": "string"
    }
  ],
  "base": "string",
  "options": {
    "hasRestrictions": false
  },
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
Find all instances of the model matched by filter from the data source
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
Configuration Model successfully obtained
{% endapi-method-response-example-description %}

```text
[
  {
    "name": "string",
    "rules": [
      {
        "_id": "string",
        "targetValue": "string",
        "targetType": "string",
        "targetRegEx": true,
        "conditionValue": "string",
        "conditionType": "string",
        "conditionRegEx": true,
        "error": "string"
      }
    ],
    "restrictions": [
      "string"
    ],
    "defaultValues": [
      {
        "effectiveDate": "$now",
        "createdBy": "string",
        "variables": [
          {
            "name": "string",
            "value": {},
            "type": "string",
            "forced": true,
            "addIfAbsent": true
          }
        ],
        "id": "string"
      }
    ],
    "base": "string",
    "options": {
      "hasRestrictions": false
    },
    "id": "string"
  }
]
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
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="put" host="http://tower" path="/configurationModels" %}
{% api-method-summary %}
/
{% endapi-method-summary %}

{% api-method-description %}
Replace an existing model instance or insert a new one into the data source.
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

{% api-method-parameter name="model" type="string" required=false %}
ConfigurationModel object to replace/create 
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "rules": [
    {
      "_id": "string",
      "targetValue": "string",
      "targetType": "string",
      "targetRegEx": true,
      "conditionValue": "string",
      "conditionType": "string",
      "conditionRegEx": true,
      "error": "string"
    }
  ],
  "restrictions": [
    "string"
  ],
  "defaultValues": [
    {
      "effectiveDate": "$now",
      "createdBy": "string",
      "variables": [
        {
          "name": "string",
          "value": {},
          "type": "string",
          "forced": true,
          "addIfAbsent": true
        }
      ],
      "id": "string"
    }
  ],
  "base": "string",
  "options": {
    "hasRestrictions": false
  },
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
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="http://tower" path="/configurationModels" %}
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

{% api-method-parameter name="model" type="string" required=false %}
ConfigurationModel object to create
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```text
{
  "name": "string",
  "rules": [
    {
      "_id": "string",
      "targetValue": "string",
      "targetType": "string",
      "targetRegEx": true,
      "conditionValue": "string",
      "conditionType": "string",
      "conditionRegEx": true,
      "error": "string"
    }
  ],
  "restrictions": [
    "string"
  ],
  "defaultValues": [
    {
      "effectiveDate": "$now",
      "createdBy": "string",
      "variables": [
        {
          "name": "string",
          "value": {},
          "type": "string",
          "forced": true,
          "addIfAbsent": true
        }
      ],
      "id": "string"
    }
  ],
  "base": "string",
  "options": {
    "hasRestrictions": false
  },
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
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="delete" host="http://tower" path="/configurationModels/{id}" %}
{% api-method-summary %}
/{id}
{% endapi-method-summary %}

{% api-method-description %}
Delete a model instance by {id} from the data source
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ConfigurationModel id
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
{% api-method-response-example httpCode=204 %}
{% api-method-response-example-description %}
Configuration Model Successfully deleted
{% endapi-method-response-example-description %}

```text

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
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="patch" host="http://tower" path="/configurationModels/{id}/options" %}
{% api-method-summary %}
/{id}/options
{% endapi-method-summary %}

{% api-method-description %}
Updates given configuration model options
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ConfigurationModel id
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

{% api-method-parameter name="model" type="object" required=false %}
Options model:  
{ "hasRestrictions": false }
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configuration Model options successfully updated
{% endapi-method-response-example-description %}

```text
{
  "hasRestrictions": false
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
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="http://tower" path="/configurationModels/{id}/restriction" %}
{% api-method-summary %}
/{id}/restriction
{% endapi-method-summary %}

{% api-method-description %}
Adds resriction to given configuration model
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ConfigurationModel id
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

{% api-method-parameter name="restriction" type="string" required=false %}
Restriction to add
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Configurations successfully obtained
{% endapi-method-response-example-description %}

```text

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
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="delete" host="http://tower" path="/configurationModels/{id}/restriction" %}
{% api-method-summary %}
/{id}/restriction
{% endapi-method-summary %}

{% api-method-description %}
Removes resriction from given configuration model
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ConfigurationModel id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="restriction" type="string" required=false %}
Restriction to remove
{% endapi-method-parameter %}

{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token.
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Restriction removed successfully
{% endapi-method-response-example-description %}

```text

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
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="patch" host="http://tower" path="/configurationModels/{id}/rule" %}
{% api-method-summary %}
/{id}/rule
{% endapi-method-summary %}

{% api-method-description %}
Updates validation rule from given configuration model
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ConfigurationModel id
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
{% api-method-parameter name="rule" type="object" required=true %}
{   
  "\_id": "string",  
  "targetValue": "string",   
  "targetType": "string",   
  "targetRegEx": true,   
  "conditionValue": "string",   
  "conditionType": "string",   
  "conditionRegEx": true,   
  "error": "string"   
}
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Rule successfully updated
{% endapi-method-response-example-description %}

```text
{
  "_id": "string",
  "targetValue": "string",
  "targetType": "string",
  "targetRegEx": true,
  "conditionValue": "string",
  "conditionType": "string",
  "conditionRegEx": true,
  "error": "string"
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
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="http://tower" path="/configurationModels/{id}/rule" %}
{% api-method-summary %}
/{id}/rule
{% endapi-method-summary %}

{% api-method-description %}
Creates validation rule for given configuration model
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ConfigurationModel id
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
{% api-method-parameter name="rule" type="string" required=true %}
{   
  "targetValue": "string",   
  "targetType": "string",   
  "targetRegEx": true,   
  "conditionValue": "string",   
  "conditionType": "string",   
  "conditionRegEx": true,   
  "error": "string"   
}
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Rule successfully created
{% endapi-method-response-example-description %}

```text
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

{% api-method method="delete" host="http://tower" path="/configurationModels/{id}/rule" %}
{% api-method-summary %}
/{id}/rule
{% endapi-method-summary %}

{% api-method-description %}
Removes validation rule from given configuration model
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ConfigurationModel id
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-query-parameters %}
{% api-method-parameter name="ruleId" type="string" required=true %}
Rule id
{% endapi-method-parameter %}

{% api-method-parameter name="access\_token" type="string" required=false %}
Authentication token
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Rule successfully removed
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
    "message": "Authorization required",
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

