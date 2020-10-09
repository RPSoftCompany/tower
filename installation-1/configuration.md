# Configuration

Tower has two different configuration files, config.json and database-config.json.

## Config.json

Config.json file is responsible for all the runtime stuff related to Tower. So for example if you would like to change the port Tower is exposing its API, you will need to change it in this file.  
At first, config.json looks like this:

```javascript
{
  "host": "0.0.0.0",
  "port": 5000,
  "logLevel": "error",
  "explorer": true,
  "nonSafe": false,
  "tokenHeaders": [],
  "#privateKey": "./certs/privatekey.pem",
  "#certificate": "./certs/certificate.pem"
}
```

**host** \(default: 0.0.0.0\) - This field decides on what host Tower will expost its API. You can use both ip or host in this field.

**port** \(default: 5000\) - Port, similarly to host, decides on which port the API will be exposed.

**logLevel** \(default: error\) - This field is a log level for Tower application. Available log levels are as follows:

```javascript
  emerg
  alert
  crit
  error
  warning
  notice
  info 
  debug
```

As Tower is using Winston library for logging purposes, you can read more about the logging levels [here](https://www.npmjs.com/package/winston#logging-levels).

**explorer** \(default: true\) - If this field is set to true, Tower will expose its API explorer \(Swagger\) on /explorer url.

**nonSafe** \(default: true\) - setting nonSafe flag to true allows you to create file called 'secret', where you can store your encryption key for Tower. As it is not safe to store such information in plain text file, please use this option only for testing purposes.

**tokenHeaders** \(default: \[\]\) - an array of strings, representing what HTTP headers, where Tower will look for authentication token. Regardless of this setting, Tower will always look for token in 'Authorization' header as well as in this array.

**privateKey** and **certificate** \(default: undefined\) - Are both to enable SSL in Tower.

## Database-config.json

Database-config.json in a file, where your database connection details are stored. There are two ways for providing the required information. First one is by providing full url, like that:

```javascript
{    
    "mongoDB": {
        "url": 'mongodb://<<username>>:<<password>>@<<host>>:<<port>>/<<database_name>>',
    },
}
```

Or by providing all the details in dedicated fields, like this:

```javascript
{    
    "mongoDB": {
        "host": "<<host>>",
        "port": <<port>>,
        "database": "<<database_name>>",
        "username": "<<username>>",
        "password": "<<password>>"
    },
}
```



