---
description: 'On this page, you can find Tower templates for different technologies'
---

# Templates

### TIBCO

**TIBCO Flogo® Enterprise**

To use Tower with Tibco Flogo you will need to create Consul like API. To do so, you will need to create new REST API url via REST Configuration page. The URL you will provide must start with **kv**, in my case it's **kv/{Environment}/{Application}**. Be aware, that you will need to change the line 6 of the following template to match your url \(without the kv string\).

```javascript
[
%%forEach var in variables%%
{
  %%def index=%%tower_random()%%%%
  "LockIndex": 0,
  "Key": "%%Environment%%/%%Application%%/%%var.name%%",
  "Flags": 0,
  "Value": "%%tower_toBase64 ( %%var.value%% )%%",
  "CreateIndex": %%index.value%%,
  "ModifyIndex": %%index.value%%
}
%%forEach END%%
]
```

The other thing is, you will need to add the **X-Consul-Token** to the **tokenHeaders** in **config.json** inside your Tower configuration file:

```javascript
{
  [...]
  "tokenHeaders": ['X-Consul-Token'],
  [...]
}
```

After that, create your configuration file for Flogo \(according to the Tibco [documentation](https://docs.tibco.com/pub/flogo/2.11.0/doc/html/GUID-F754BF12-0579-4D23-8531-96E25C2B45FF.html)\)

```javascript
{
    "server_address": "http://127.0.0.1:5000",
    "key_prefix": "Environment/Application",
    "acl_token": "<<accessToken>>"
}

```



