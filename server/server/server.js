/*
 * Copyright RPSoft 2019,2023. All Rights Reserved.
 * This file is part of RPSoft Tower.
 *
 * Tower is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tower is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
 */

'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const app = (module.exports = loopback());
const history = require('connect-history-api-fallback');

const packageFile = require('../package.json');

// Winston
const winston = require('winston');

// HTTP/HTTPS
const https = require('https');
const http = require('http');

// Production configuration read
const fs = require('file-system');
const path = require('path');

// Configuration
let mainConfig = require('confert')('./config.json');
mainConfig = {
    config: mainConfig,
};
mainConfig.appRootDir = __dirname;

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

mainConfig.env = process.env.NODE_ENV;

if (process.env.NODE_ENV === 'production') {
    let userMainConfig = fs.readFileSync('./config.json').toString();
    userMainConfig = JSON.parse(userMainConfig);

    mainConfig.config.host = userMainConfig.host || mainConfig.config.host;
    mainConfig.config.port = userMainConfig.port || mainConfig.config.port;
    mainConfig.config.privateKey = userMainConfig.privateKey || mainConfig.config.privateKey;
    mainConfig.config.certificate = userMainConfig.certificate || mainConfig.config.certificate;
    mainConfig.config.logLevel = userMainConfig.logLevel;
    mainConfig.config.nonSafe = userMainConfig.nonSafe;
    mainConfig.config.tokenHeaders = userMainConfig.tokenHeaders;
    mainConfig.config.auditTTL = userMainConfig.auditTTL;
    mainConfig.config.fullEncryption = userMainConfig.fullEncryption;
    mainConfig.config.versionLimit = userMainConfig.versionLimit || -1;

    mainConfig.components = null;

    if (userMainConfig.explorer === true) {
        mainConfig.components = {
            'loopback-component-explorer': {
                mountPath: '/explorer',
                uiDirs: path.join(path.dirname(process.execPath), 'explorer'),
                apiInfo: {
                    title: 'Tower API',
                    description: 'Tower Configuration Server API explorer',
                },
                generateOperationScopedModels: true,
            },
        };
    }
} else {
    mainConfig.components = {
        'loopback-component-explorer': {
            mountPath: '/explorer',
            uiDirs: 'server/explorer',
            apiInfo: {
                title: 'Tower API',
                description: 'Tower Configuration Server API explorer',
            },
            generateOperationScopedModels: true,
        },
    };
}

let logLevel = mainConfig.env === 'production' ? 'error' : 'debug';
if (mainConfig.config.logLevel) {
    logLevel = mainConfig.config.logLevel;
}

const versionLimit = mainConfig.config.versionLimit !== undefined ? mainConfig.config.versionLimit : -1;
app.versionLimit = versionLimit;

let nonSafe = mainConfig.config.nonSafe === undefined ? false : mainConfig.config.nonSafe;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    nonSafe = true;
}

app.nonSafe = nonSafe;

app.fullEncryption = mainConfig.config.fullEncryption === undefined ? false : mainConfig.config.fullEncryption;

const tokenHeaders = mainConfig.config.tokenHeaders === undefined ? [] : mainConfig.config.tokenHeaders;

const auditTTL = mainConfig.config.auditTTL === undefined ? 20 : mainConfig.config.auditTTL;
app.set('auditTTL', auditTTL * 86400);

const winstonFormat = winston.format.printf(
    ({level, message, _label, timestamp}) => {
        const date = new Date(timestamp);
        let mili = `${date.getMilliseconds()}`;
        while (mili.length < 3) {
            mili = `0${mili}`;
        }
        return `${date.toLocaleString()}.${mili} ${level}: ${message}`;
    },
);

// Winston instance
const logger = (module.exports = winston.createLogger({
    level: logLevel,
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize({
            all: true,
        }),
        winstonFormat,
    ),
}));

app.set('winston', logger);

app.get(
    '/ui/**',
    history({
        verbose: process.env.NODE_ENV === 'development',
    }),
);

app.get('/', function(req, res) {
    res.redirect('/ui');
});

app.start = () => {
    let server;
    let httpOnly = true;
    if (mainConfig.config.privateKey && mainConfig.config.certificate) {
        const privateKey = fs
            .readFileSync(
                path.join(
                    path.dirname(process.execPath),
                    mainConfig.config.privateKey,
                ),
            )
            .toString();
        const certificate = fs
            .readFileSync(
                path.join(
                    path.dirname(process.execPath),
                    mainConfig.config.certificate,
                ),
            )
            .toString();
        const options = {
            key: privateKey,
            cert: certificate,
        };
        httpOnly = false;
        server = https.createServer(options, app);
    } else {
        server = http.createServer(app);
    }

    // start the web server
    return server.listen(app.get('port'), function() {
        const baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + app.get('port');
        app.emit('started');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            const explorerPath = app.get(
                'loopback-component-explorer',
            ).mountPath;
            console.log('Browse Tower REST API at %s%s', baseUrl, explorerPath);
        }

        app.use(
            loopback.token({
                headers: ['Authorization', ...tokenHeaders],
                params: ['access_token'],
            }),
        );

        app.set('AuthorizationHeaders', ['authorization', ...tokenHeaders]);

        console.log();
        console.log(
            '============================================================',
        );
        console.log(
            `Tower Configuration Server, version ${packageFile.version} started`,
        );
        console.log(
            '============================================================',
        );
        console.log();

        if (app.nonSafe) {
            console.log(
                '<!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!>',
            );
            console.log(
                '<!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!>',
            );
            console.log();
            console.log(
                '<!> WARNING!!! Non-Safe mode is on, don\'t use it on production environment <!>',
            );
            console.log();
            console.log(
                '<!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!>',
            );
            console.log(
                '<!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!>',
            );
            console.log();
        }
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, mainConfig, (err) => {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module) {
        app.start();
    }
});
