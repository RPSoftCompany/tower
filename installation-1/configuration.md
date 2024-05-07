# Configuration

Irrespective of the Tower version you employ, configuration provision occurs through two primary avenues: configuration files or environment variables. Remarkably, both methods can be concurrently utilized.

However, a crucial point to bear in mind is that environment variables take precedence over configuration files. They effectively overwrite any settings specified in the file.

## Configuration variables overview

Below, you'll discover a comprehensive table detailing all configuration variables employed by Tower. Should the need arise to revert your configuration to its default state, utilize the [configuration template file](https://github.com/RPSoftCompany/tower/blob/master/backend/.env\_template) provided as an exemplar.

| Environment Variable | Default value      | Required |
| -------------------- | ------------------ | -------- |
| HOST                 | 0.0.0.0            | no       |
| PORT                 | 3000               | no       |
| LOG\_LEVEL           | \["log","error"]   | no       |
| DATABASE\_URL        | ""                 | yes      |
| SECRET               | ""                 | no       |
| TTL                  | 86400              | no       |
| AUDIT\_TTL           | 1                  | no       |
| TOKEN\_HEADERS       | \["Authorization"] | no       |
| SSL\_KEY\_PATH       | ""                 | no       |
| SSL\_CERT\_PATH      | ""                 | no       |
| CORS                 | false              | no       |



### Configuration variables in details

#### **HOST**

Host on which you Tower instance will be exposed

#### **PORT**

TCP port on which you Tower instance will be exposed

#### **LOG\_LEVEL**

The "Log\_Level" variable constitutes an array of strings dictating the log levels displayed during Tower's operation. Available options include "<mark style="color:yellow;">log</mark>," "<mark style="color:yellow;">error</mark>," "<mark style="color:yellow;">warn</mark>," "<mark style="color:yellow;">debug</mark>," and "<mark style="color:yellow;">verbose</mark>." For comprehensive insights into log levels within Tower, refer to the [Nest.js documentation](https://docs.nestjs.com/techniques/logger).

#### **DATABASE\_URL**

Database used by your Tower instance. This variable uses standard mongodb connection string format, e.g. <mark style="color:yellow;">mongodb://127.0.0.1:27017/Tower</mark>. You can find more details about this format in [mongodb documentation](https://www.mongodb.com/docs/manual/reference/connection-string).

#### **SECRET**

The "Secret" variable is essential for encrypting configurations stored within Tower. It must precisely consist of 32 characters. Should you opt to provide it, ensure utmost security by incorporating a mix of uppercase and lowercase letters, numbers, and special characters.

#### **TTL**

"TTL" is a variable specifying the duration (in seconds) for which access tokens generated within Tower remain valid.

#### **AUDIT\_TTL**

This variable indicates how many days the audit logs will be stored

#### **TOKEN\_HEADERS**

A list of header names that Tower scans for authentication headers during API calls.

#### **SSL\_KEY\_PATH**

Path to your SSL key

#### **SSL\_CERT\_PATH**

Path to your SSL certificate

#### **CORS**

Enables or disables Cross-origin resource sharing (CORS)
