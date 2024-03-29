# Installation

### Prerequisites

* MongoDB (version 5.0 or above) instance with user allowed to create and modify one database

Docker installation

* Docker

Standalone installation

* node.js (version 21 or above)
* npm

### Installation

#### Docker

Tower is aimed to be released as a cloud native project, that's why the only prebuilt product can be found as a [docker image](https://hub.docker.com/r/rpsofttower/tower). In case you'd like to build it on your own, please visit the [standalone installation](installation.md#standalone) section.

#### Standalone

Download the [github repository ](https://github.com/RPSoftCompany/tower)on your local computer, then navigate to the <mark style="color:yellow;">ui</mark> folder and execute the npm install command.

```bash
cd ui
npm install
```

This will install all the dependencies for the user interface part of Tower.

Now go back to the Tower root folder and enter the <mark style="color:yellow;">backend</mark> directory. You need to install the dependencies here using npm as well.

```bash
cd ../backend
npm install
```

And now you need to build the project. Go back to the Tower root folder again, and run the ui and backend installation scripts.

```bash
npm run build:ui
npm run build:backend
```

Great, now when the application is built already, we need to copy the ui version to backend, so that they may work together as one application.

```bash
mkdir -p backend/client
cp -R ui/dist/spa/* backend/client/
```

After this is done, we need to move the configuration from template to correct file.

```bash
mv backend/.env_template backend/.env
```

And we're done. After finishing the [configuration](configuration.md) you can start Tower using following script

```bash
cd backend
npm run start:prod
```
