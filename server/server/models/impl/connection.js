//    Copyright RPSoft 2019,2020. All Rights Reserved.
//    This file is part of RPSoft Tower.
//
//    Tower is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 3 of the License, or
//    (at your option) any later version.
//
//    Tower is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Tower.  If not, see http://www.gnu.org/licenses/gpl-3.0.html.

const ConfigurationClass = require('./configuration.js');
const Interpreter = require('./template/interpreter');

const axios = require('axios');
const {authenticate} = require('ldap-authentication');
const HttpErrors = require('http-errors');
const SCPClient = require('ssh2-sftp-client');
const os = require('os');
const path = require('path');
const fs = require('fs').promises;

module.exports = class Connection {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'Connection';
        this.logger = null;

        this.app = app;
    }

    /**
     * logger
     *
     * @param {string} severity Severity
     * @param {string} method current method
     * @param {string} message Message to log
     * @param {string} obj object to log
     *
     */
    log(severity, method, message, obj) {
        if (this.logger === null) {
            this.logger = this.app.get('winston');
        }

        if (obj !== undefined) {
            this.logger.log(severity, `${this.configurationName}.${method} ${message}`, obj);
        } else {
            this.logger.log(severity, `${this.configurationName}.${method} ${message}`);
        }
    }

    /**
     * Tests connection
     *
     * @param {string} type connection type ("LDAP", "Vault")
     */
    async testConnection(type) {
        this.log('debug', 'testConnection', 'STARTED');
        if (type === 'LDAP') {
            const Connection = this.app.models.connection;
            const ldapServer = await Connection.findOne({
                where: {
                    system: 'LDAP',
                    enabled: true,
                },
            });

            if (ldapServer === undefined || ldapServer === null) {
                this.log('debug', 'testConnection', 'FINISHED');
                throw new HttpErrors.BadRequest('LDAP system not configured');
            }

            const configuration = this.app.get('ConfigurationInstance');

            const password = configuration.decryptPassword(ldapServer.bindCredentials);

            const conn = await authenticate({
                ldapOpts: {url: ldapServer.url},
                userDn: ldapServer.bindDN,
                userPassword: password,
            });

            this.log('debug', 'testConnection', 'FINISHED');
            return conn;
        } else if (type === 'Vault') {
            const Connection = this.app.models.connection;
            const system = await Connection.findOne({
                where: {
                    system: 'Vault',
                    enabled: true,
                },
            });

            if (system === undefined || system === null) {
                this.log('debug', 'testConnection', 'FINISHED');
                throw new HttpErrors.BadRequest('Vault system not configured');
            }

            try {
                const resp = await axios.get(system.url);
                if (resp.status === 200) {
                    this.log('debug', 'testConnection', 'FINISHED');
                    return true;
                }
            } catch ( e ) {
                this.log('debug', 'testConnection', 'FINISHED');
                throw new HttpErrors.BadRequest(e.message);
            }
        } else {
            this.log('debug', 'testConnection', 'FINISHED');
            callback('Invalid connection type');
        }
    }

    /**
     * Save connection
     *
     * @param {connection} connection connection object to save
     */
    async saveConnection(connection) {
        this.log('debug', 'saveConnection', 'STARTED');

        if (connection.id) {
            const Connection = this.app.models.connection;
            const tempConn = await Connection.findOne({
                where: {
                    id: connection.id,
                },
            });

            if (tempConn.system === 'LDAP') {
                tempConn.url = connection.url !== undefined ? connection.url : tempConn.url;
                tempConn.bindDN = connection.bindDN ? connection.bindDN : tempConn.bindDN;
                tempConn.bindCredentials = connection.bindCredentials ?
                    connection.bindCredentials : tempConn.bindCredentials;
                tempConn.searchBase = connection.searchBase ?
                    connection.searchBase : tempConn.searchBase;
                tempConn.enabled = connection.enabled ?
                    connection.enabled : tempConn.enabled;
                tempConn.usernameAttribute = connection.usernameAttribute ?
                    connection.usernameAttribute : tempConn.usernameAttribute;
                tempConn.displayAttribute = connection.displayAttribute ?
                    connection.displayAttribute : tempConn.displayAttribute;
            } else if (tempConn.system === 'Vault') {
                tempConn.url = connection.url ? connection.url : tempConn.url;
                tempConn.globalToken = connection.globalToken ?
                    connection.globalToken : tempConn.globalToken;
                tempConn.enabled = connection.enabled ? connection.enabled : tempConn.enabled;
                tempConn.useGlobalToken = connection.useGlobalToken ?
                    connection.useGlobalToken : tempConn.useGlobalToken;
                tempConn.tokens = connection.tokens ? connection.tokens : tempConn.tokens;
            } else if (tempConn.system === 'SCP') {
                tempConn.name = connection.name ? connection.name : tempConn.name;
                tempConn.username = connection.username ? connection.username : tempConn.username;
                tempConn.authType = connection.authType ? connection.authType : tempConn.authType;
                tempConn.items = connection.items ? connection.items : tempConn.items;

                if (connection.authType === 'key') {
                    tempConn.password = null;
                    tempConn.key = connection.key ? connection.key : tempConn.key;
                } else {
                    tempConn.key = null;
                    tempConn.password = connection.password ? connection.password : tempConn.password;
                }

                if (connection.authType === 'key' && !connection.key) {
                    this.log('debug', 'saveConnection', 'FINISHED');
                    throw new HttpErrors.BadRequest('Invalid request');
                } else if (connection.authType === 'userpass' && !connection.password) {
                    this.log('debug', 'saveConnection', 'FINISHED');
                    throw new HttpErrors.BadRequest('Invalid request');
                }
            }

            connection = tempConn;
        } else if (connection.system && connection.system !== 'SCP') {
            const Connection = this.app.models.connection;
            const tempConn = await Connection.findOne({
                where: {
                    system: connection.system,
                },
            });

            if (tempConn === null) {
                this.log('debug', 'saveConnection', 'FINISHED');
                throw new HttpErrors.BadRequest('Invalid connection system');
            }

            if (tempConn.system === 'LDAP') {
                tempConn.url = connection.url !== undefined ? connection.url : tempConn.url;
                tempConn.bindDN = connection.bindDN !== undefined ? connection.bindDN : tempConn.bindDN;
                tempConn.bindCredentials = connection.bindCredentials !== undefined ?
                    connection.bindCredentials : tempConn.bindCredentials;
                tempConn.searchBase = connection.searchBase !== undefined ?
                    connection.searchBase : tempConn.searchBase;
                tempConn.searchFilter = connection.searchFilter !== undefined ?
                    connection.searchFilter : tempConn.searchFilter;
                tempConn.enabled = connection.enabled !== undefined ?
                    connection.enabled : tempConn.enabled;
                tempConn.usernameAttribute = connection.usernameAttribute !== undefined ?
                    connection.usernameAttribute : tempConn.usernameAttribute;
                tempConn.displayAttribute = connection.displayAttribute !== undefined ?
                    connection.displayAttribute : tempConn.displayAttribute;
            } else if (tempConn.system === 'Vault') {
                tempConn.url = connection.url !== undefined ? connection.url : tempConn.url;
                tempConn.globalToken = connection.globalToken !== undefined ?
                    connection.globalToken : tempConn.globalToken;
                tempConn.enabled = connection.enabled !== undefined ? connection.enabled : tempConn.enabled;
                tempConn.useGlobalToken = connection.useGlobalToken !== undefined ?
                    connection.useGlobalToken : tempConn.useGlobalToken;
                tempConn.tokens = connection.tokens !== undefined ? connection.tokens : tempConn.tokens;
            }

            connection = tempConn;
        } else if (connection.system !== 'SCP') {
            this.log('debug', 'saveConnection', 'FINISHED');
            throw new HttpErrors.BadRequest('Correct instance should contain id or system name');
        }

        if (connection.system !== 'LDAP' && connection.system !== 'Vault' && connection.system !== 'SCP') {
            this.log('debug', 'saveConnection', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid connection type');
        }

        const configuration = new ConfigurationClass(this.app);
        await configuration.createCrypt();

        if (connection.system === 'LDAP') {
            if (!connection.bindCredentials) {
                this.log('debug', 'saveConnection', 'FINISHED');
                throw new HttpErrors.BadRequest('LDAP connection must contain bindCredentials field');
            }
            connection.bindCredentials = configuration.encryptPassword(connection.bindCredentials);
        } else if (connection.system === 'Vault') {
            if (connection.globalToken) {
                connection.globalToken = configuration.encryptPassword(connection.globalToken);
            }

            if (connection.tokens) {
                if (!Array.isArray(connection.tokens)) {
                    this.log('debug', 'saveConnection', 'FINISHED');
                    throw new HttpErrors.BadRequest('Vault connections tokens must be an array');
                } else {
                    connection.tokens.map((token) => {
                        if (token.token !== '' && token.token !== null && token.token !== undefined) {
                            token.token = configuration.encryptPassword(token.token);
                        }
                    });
                }
            } else {
                this.log('debug', 'saveConnection', 'FINISHED');
                throw new HttpErrors.BadRequest('Vault connection must contain tokens field');
            }
        } else if (connection.system === 'SCP') {
            return await this.addScpConnection(connection);
        } else {
            this.log('debug', 'saveConnection', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid system type');
        }

        this.log('debug', 'saveConnection', 'FINISHED');

        return await connection.save();
    }

    /**
     * Add SCP connection
     *
     * @param {connection} connection connection object to save
     */
    async addScpConnection(connection) {
        this.log('debug', 'addScpConnection', 'STARTED');

        if (connection.system !== 'SCP') {
            this.log('debug', 'addScpConnection', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid system type');
        }

        if (!connection.host || !connection.username || !connection.authType) {
            this.log('debug', 'addScpConnection', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid request');
        }

        if (connection.authType === 'key' && !connection.key) {
            this.log('debug', 'addScpConnection', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid request');
        }

        if (connection.authType === 'userpass' && !connection.password ) {
            this.log('debug', 'addScpConnection', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid request');
        }

        if (!connection.items) {
            connection.items = [];
        }

        const configInstance = this.app.get('ConfigurationInstance');

        if (connection.authType === 'userpass') {
            connection.password = configInstance.encryptPassword(connection.password);
        } else {
            connection.key = configInstance.encryptPassword(connection.key);
        }

        this.log('debug', 'addScpConnection', 'FINISHED');

        return await connection.save();
    }

    /**
     * Find connection
     *
     * @param {object} filter find filter
     */
    async findConnection(filter) {
        this.log('debug', 'findConnection', 'STARTED');

        const Connection = this.app.models.connection;

        const connection = await Connection.find(filter);

        const configuration = this.app.get('ConfigurationInstance');

        connection.map( (conn) => {
            if (conn.system === 'LDAP') {
                if (conn.bindCredentials !== undefined && conn.bindCredentials !== null) {
                    conn.bindCredentials = configuration.decryptPassword(conn.bindCredentials);
                }
            } else if (conn.system === 'Vault') {
                if (conn.globalToken !== undefined && conn.globalToken !== null && conn.globalToken !== '') {
                    conn.globalToken = configuration.decryptPassword(conn.globalToken);
                }

                if (conn.tokens !== undefined) {
                    if (Array.isArray(conn.tokens)) {
                        conn.tokens.map((token) => {
                            if (token.token !== null && token.token !== undefined && token.token !== '' ) {
                                token.token = configuration.decryptPassword(token.token);
                            }
                        });
                    }
                }
            } else if (conn.system === 'SCP') {
                if (conn.authType === 'userpass') {
                    conn.password = configuration.decryptPassword(conn.password);
                } else {
                    conn.key = configuration.decryptPassword(conn.key);
                }
            }
        });

        this.log('debug', 'findConnection', 'FINISHED');
        return connection;
    }

    /**
     * SCP on configuration save
     *
     * @param {object} configuration configuration to save
     */
    async findSCPConnectionsAndCopy(configuration) {
        this.log('debug', 'findSCPConnectionsForSCP', 'STARTED');

        const Connection = this.app.models.connection;
        const RestConfiguration = this.app.models.restConfiguration;

        const BaseConfiguration = this.app.get('BaseConfigurationInstance');
        const Configuration = this.app.get('ConfigurationInstance');
        const bases = await BaseConfiguration.getConfigurationModelFromCache();

        const where = {};

        bases.forEach( (base) => {
            if (configuration[base.name]) {
                where[base.name] = configuration[base.name];
            } else {
                where[base.name] = '';
            }
        });

        const connections = await Connection.find({
            where: {
                system: 'SCP',
            },
        });

        for (const connection of connections) {
            for (const conf of connection.items) {
                let match = true;
                bases.forEach( (base) => {
                    if (conf[base.name] !== where[base.name]) {
                        match = false;
                    }
                });

                if (match === true) {
                    const template = await RestConfiguration.findById(conf.template.id);

                    const sftp = new SCPClient();

                    try {
                        if (connection.authType === 'userpass') {
                            await sftp.connect({
                                port: 22,
                                host: connection.host,
                                username: connection.username,
                                password: Configuration.decryptPassword(connection.password),
                                readyTimeout: 3000,
                            });
                        } else {
                            await sftp.connect({
                                port: 22,
                                host: connection.host,
                                username: connection.username,
                                privateKey: Configuration.decryptPassword(connection.key),
                                readyTimeout: 3000,
                            });
                        }

                        const inter = new Interpreter(template.template, configuration, template.returnType,
                            []);

                        const filename = path.join(os.tmpdir(), Math.random().toString(36).substring(2, 15));

                        await fs.writeFile(filename, inter.handle() );
                        await sftp.fastPut(filename, conf.path);

                        await fs.unlink(filename);
                    } catch (err) {
                        this.log('error', 'findSCPConnectionsForSCP',
                            'Error connecting to server via SFTP\n', err);
                    }
                }
            }
        }

        this.log('debug', 'findSCPConnectionsForSCP', 'FINISHED');
    }
};
