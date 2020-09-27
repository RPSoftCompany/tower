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
//    along with Tower.  If not, see <http://www.gnu.org/licenses/>.

const HttpErrors = require('http-errors');
const axios = require('axios');
const ConfigurationClass = require('./configuration.js');
const ConstantVariableClass = require('./constantVariable');

module.exports = class V1 {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'v1';
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
     * match configuration url
     *
     * @param {string} url url to check
     *
     * @return {[restConfiguration]} matched configuration array
     */
    async matchConfigurationURL(url) {
        this.log('debug', 'matchConfigurationURL', 'STARTED');

        const restConfiguration = this.app.models.restConfiguration;
        const baseConfiguration = this.app.models.baseConfiguration;
        const all = await restConfiguration.find({
            order: 'sequenceNumber ASC',
        });

        if (!url.startsWith('/')) {
            url = '/' + url;
        }

        const toReturn = [];

        const bases = await baseConfiguration.find();
        const basesArray = [];
        bases.forEach((base) => {
            basesArray.push(`{${base.name}}`);
        });

        const split = url.split('/');
        if (split[0] === '') {
            split.shift();
        }

        all.forEach((config) => {
            const configSplit = config.url.split('/');
            if (configSplit[0] === '') {
                configSplit.shift();
            }

            let matchedUrl = config.url;
            if (!matchedUrl.startsWith('/')) {
                matchedUrl = '/' + matchedUrl;
            }

            if (configSplit.length === split.length) {
                basesArray.forEach((base) => {
                    matchedUrl = matchedUrl.replace(base, '[^\\/]*');
                });

                matchedUrl.replace('/', '\\/');

                const regex = new RegExp(matchedUrl);

                if (regex.test(url)) {
                    toReturn.push(config);
                }
            }
        });

        this.log('debug', 'matchConfigurationURL', 'FINISHED');

        return toReturn;
    }

    /**
     * Resolves variable from Vault
     *
     * @param {string} path path to variable
     * @param {Map} model model map
     *
     * @return {string} resolved string
     */
    async getDataFromVault(path, model) {
        this.log('debug', 'getDataFromVault', 'STARTED');

        const prePath = path.substring(0, path.lastIndexOf('/'));
        const variableName = path.substring(path.lastIndexOf('/') + 1, path.length);

        const BaseConfiguration = this.app.models.baseConfiguration;
        const Connection = this.app.models.connection;

        const models = await BaseConfiguration.find({
            order: 'sequenceNumber DESC',
        });

        const VaultConnection = await Connection.findOne({
            where: {
                system: 'Vault',
                enabled: true,
            },
        });

        if (VaultConnection === null || VaultConnection === undefined) {
            throw new HttpErrors.InternalServerError(`Vault connection not configured`);
        }

        if (VaultConnection.useGlobalToken) {
            token = VaultConnection.globalToken;
            const value = await axios({
                url: `${VaultConnection.url}/v1/${prePath}`,
                method: 'GET',
                headers: {
                    'X-Vault-Token': newtoken.token,
                },
            });

            let context = value.data.data;
            if (value.data.data.data !== undefined) {
                context = value.data.data.data;
            }

            if (context) {
                return context[variableName];
            }
        } else {
            let found = false;
            for (const base of models) {
                if (!found) {
                    const tempModel = model.get(base.name);
                    const newtoken = VaultConnection.tokens.find( (el) => {
                        return el.base === base.name && el.name === tempModel && el.token !== null && el.token !== '';
                    });

                    if (newtoken !== undefined) {
                        try {
                            const value = await axios({
                                url: `${VaultConnection.url}/v1/${prePath}`,
                                method: 'GET',
                                headers: {
                                    'X-Vault-Token': newtoken.token,
                                },
                            });

                            let context = value.data.data;
                            if (value.data.data.data !== undefined) {
                                context = value.data.data.data;
                            }

                            if (context) {
                                found = context[variableName];
                            }
                        } catch (e) {
                            if (e.response !== undefined) {
                                if (e.response.status !== 403) {
                                    throw new HttpErrors.InternalServerError(
                                        `Variable '${path}' does not exist in Vault or invalid token`);
                                }
                            } else {
                                e.message = 'Vault connection error';
                                throw e;
                            }
                        }
                    }
                }
            };

            if (found === false || found === undefined || found === null) {
                throw new HttpErrors.InternalServerError(`Variable '${path}' does not exist in Vault or invalid token`);
            }

            return found;
        }

        this.log('debug', 'getDataFromVault', 'FINISHED');
    }

    /**
     * updates variables with default values from models
     *
     * @param {[object]} variables variables
     * @param {object} fullModel full model
     * @param {object} configurationObject configuration object from query
     * @param {object} options request options
     *
     * @return {[object]} updated configuration
     */
    async updateVariablesWithDefaults(variables, fullModel, configurationObject, options) {
        this.log('debug', 'updateVariablesWithDefaults', 'STARTED');

        const filter = {};
        fullModel.forEach( (el) => {
            filter[el.name] = configurationObject[el.name];
        });

        const ConfigurationModel = new ConstantVariableClass(this.app);

        const latest = await ConfigurationModel.findLatest(filter, options);

        const newVariables = [...variables];

        latest.forEach( (el) => {
            let found = false;

            for (let i = 0; i < newVariables.length; i++) {
                const temp = newVariables[i];
                if (temp.name === el.name) {
                    found = true;

                    if (el.forced) {
                        temp.type = el.type;
                        temp.value = el.value;
                        i = newVariables.length;
                    }
                }
            }

            if (!found && el.addIfAbsent) {
                newVariables.push({
                    name: el.name,
                    type: el.type,
                    value: el.value,
                });
            }
        });

        this.log('debug', 'updateVariablesWithDefaults', 'FINISHED');

        return Array.from(newVariables);
    }

    /**
     * match configuration url
     *
     * @param {restConfiguration} configuration configuration to get data from
     * @param {string} url url to check
     * @param {object} options request options
     *
     * @return {Configuration} matched configuration
     */
    async getDataFromConfiguration(configuration, url, options) {
        this.log('debug', 'getDataFromConfiguration', 'STARTED');

        const values = {};

        const splittedUrl = url.split('/');
        if (splittedUrl[0] === '') {
            splittedUrl.shift();
        }

        const split = configuration.url.split('/');
        if (split[0] === '') {
            split.shift();
        }
        split.forEach((str, i) => {
            const check = str.split('{');
            if (str.indexOf('{') === 0) {
                check.shift();
            } else {
                splittedUrl[i] = splittedUrl[i].substring(str.indexOf('{'), splittedUrl[i].length);
            }

            check.forEach((part) => {
                while (part !== '') {
                    if (part.includes('}')) {
                        const key = part.substring(0, part.indexOf('}'));
                        if (part.indexOf('}') + 1 < part.length) {
                            part = part.substring(part.indexOf('}'), part.length);
                            const before = part.substring(part.indexOf('}') + 1);
                            const value = splittedUrl[i].substring(0, splittedUrl[i].lastIndexOf(before));
                            values[key] = value;

                            splittedUrl[i] = splittedUrl[i].substring(splittedUrl[i].lastIndexOf(before) +
                                before.length, splittedUrl[i].length);

                            part = part.substring(part.indexOf(before) + before.length, part.length);
                        } else {
                            values[key] = splittedUrl[i];
                            part = '';
                        }
                    } else {
                        part = '';
                    }
                }
            });
        });

        values.draft = false;
        values.deleted = false;

        const Config = new ConfigurationClass(this.app);
        const BaseConfiguration = this.app.models.baseConfiguration;

        const full = await Config.findWithPermissions({
            where: values,
            order: 'version DESC',
            limit: 1,
        }, options);

        const models = await BaseConfiguration.find({
            order: 'sequenceNumber ASC',
        });

        if (full.length > 0) {
            const current = full[0];
            const retValue = {
                variables: current.variables,
                effectiveDate: current.effectiveDate,
                version: current.version,
            };

            const modelForVault = new Map();

            models.forEach((model) => {
                const modelValue = current[model.name];
                if (modelValue !== undefined) {
                    retValue[model.name] = modelValue;
                    modelForVault.set(model.name, modelValue);
                }
            });

            retValue.variables = await this.updateVariablesWithDefaults(retValue.variables, models, current, options);

            for (let i = 0; i < retValue.variables.length; i++) {
                const item = retValue.variables[i];
                if (item.type === 'Vault') {
                    retValue.variables[i].value = await this.getDataFromVault(item.value, modelForVault);
                }
            };

            this.log('debug', 'getDataFromConfiguration', 'FINISHED');
            return retValue;
        } else {
            this.log('debug', 'getDataFromConfiguration', 'FINISHED');
            return [];
        }
    }
};
