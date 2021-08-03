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

const HttpErrors = require('http-errors');
const ConfigurationModelClass = require('./configurationModel.js');
const ConstantVariableClass = require('./constantVariable.js');
const crypto = require('crypto');

const fs = require('file-system');
const path = require('path');

module.exports = class Configuration {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'configuration';
        this.logger = null;

        // Crypto
        this.cryptr = null;

        this.app = app;

        app.set('ConfigurationInstance', this);
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
            if (this.logger !== undefined) {
                this.logger.log(severity, `${this.configurationName}.${method} ${message}`);
            }
        }
    }

    /**
     * Creates crypto
     */
    async createCrypt() {
        if (this.cryptr === null) {
            if (this.app.secret === undefined) {
                if (this.app.nonSafe) {
                    await this.autoInitialize();
                    if (this.cryptr === null) {
                        throw new HttpErrors.BadRequest(`Secret not initialized`);
                    }
                } else {
                    throw new HttpErrors.BadRequest(`Secret not initialized`);
                }
            }

            this.cryptr = this.app.secret;
        };
    }

    /**
     * Auto initialize (While using nonSafe option, secret is stored in file in Tower directory)
     *
     */
    async autoInitialize() {
        this.log('debug', 'autoInitialize', 'STARTED');
        if (this.app.nonSafe) {
            let secretPath = './secret';
            if (process.env.NODE_ENV === 'production') {
                secretPath = path.join(path.dirname(process.execPath), 'secret');
            }
            if (fs.existsSync(secretPath)) {
                const secret = fs.readFileSync(secretPath, 'utf8');
                await this.initializeSecret(secret);
            }
        }
        this.log('debug', 'autoInitialize', 'FINISHED');
    }

    /**
     * Initialize secret
     *
     * @param {string} secret text, which will be used to encrypt/decrypt passwords
     *
     */
    async initializeSecret(secret) {
        this.log('debug', 'initializeSecret', 'STARTED');

        const v1 = this.app.models.v1;
        const boot = await v1.findOne({
            where: {
                booted: true,
            },
        });

        if (secret.length !== 32) {
            this.log('debug', 'initializeSecret', 'FINISHED');
            throw new HttpErrors.BadRequest(`Encryption key must have length of 32 characters`);
        }

        this.app.secret = secret.toString('base64');
        this.createCrypt();

        if (boot.encryptionCheck === undefined) {
            const pass = this.encryptPassword('encryptionCheck');
            boot.encryptionCheck = pass;
            await boot.save();
        } else {
            try {
                this.decryptPassword(boot.encryptionCheck);
            } catch ( e ) {
                this.app.secret = undefined;
                this.cryptr = null;

                await new Promise((resolve) => setTimeout(resolve, 2000));
                this.log('debug', 'initializeSecret', 'FINISHED');
                throw new HttpErrors.BadRequest(`Invalid secret`);
            }
        }

        if (this.app.nonSafe) {
            let secretPath = './secret';
            if (process.env.NODE_ENV === 'production') {
                secretPath = path.join(path.dirname(process.execPath), 'secret');
            }
            if (!fs.existsSync(secretPath)) {
                fs.writeFile(secretPath, secret);
            }
        }

        this.log('debug', 'initializeSecret', 'FINISHED');
    }

    /**
     * Encrypt password
     *
     * @param {string} password password to encrypt
     *
     * @return {string} encrypted password
     */
    encryptPassword(password) {
        if (!password) {
            return '';
        }

        let iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.cryptr), Buffer.from(iv, 'hex'));
        let encrypted = cipher.update(`${password}`);

        encrypted = Buffer.concat([encrypted, cipher.final()]);

        iv = iv.toString('hex').split('').reverse().join('');

        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    /**
     * Decrypt password
     *
     * @param {string} password password to decrypt
     *
     * @return {string} decrypted password
     */
    decryptPassword(password) {
        if (!password) {
            return '';
        }

        try {
            const textParts = password.split(':');
            const ivText = textParts.shift().split('').reverse().join('');
            const iv = Buffer.from(ivText, 'hex');
            const encryptedText = Buffer.from(textParts.join(':'), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.cryptr), iv);
            let decrypted = decipher.update(encryptedText);

            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted.toString();
        } catch (e) {
            return '';
        }
    }

    /**
     * Find configuration
     *
     * @param {any} filter query filter
     * @param {object} options request options
     *
     * @return {[configuration]} queried models
     */
    async findWithPermissions(filter, options) {
        this.log('debug', 'findWithPermissions', 'STARTED');

        const configuration = this.app.models.configuration;
        const configModel = new ConfigurationModelClass(this.app);

        const configAll = await configuration.find(filter);
        const allBases = await this.app.get('BaseConfigurationInstance').getConfigurationModelFromCache();

        await this.createCrypt();

        const findArray = [];
        const cache = new Map();

        for (const config of configAll) {
            let hasPermissions = true;

            for (const base of allBases) {
                const modelName = config[base.name];
                if (modelName !== undefined) {
                    let modelFind = null;
                    const temp = cache.get(`base.${base.name}"name.${modelName}`);
                    if (temp !== undefined) {
                        modelFind = temp;
                    } else {
                        modelFind = await configModel.findWithPermissions({
                            where: {
                                base: base.name,
                                name: modelName,
                            },
                        }, options);

                        cache.set(`base.${base.name}"name.${modelName}`, modelFind);
                    }

                    if (modelFind.length === 0) {
                        hasPermissions = false;
                    }
                }
            }

            if (hasPermissions) {
                if (!Array.isArray(config.variables)) {
                    config.variables = this.decryptPassword(config.variables);
                    if (config.variables) {
                        config.variables = JSON.parse(config.variables);
                    } else {
                        config.variables = [];
                    }
                } else {
                    config.variables.map((variable) => {
                        if (variable.type === 'password') {
                            variable.value = this.decryptPassword(variable.value);
                        }
                    });
                }
                findArray.push(config);
            }
        }

        this.log('debug', 'findWithPermissions', 'FINISHED');

        return findArray;
    }

    /**
     * create new Configuration
     *
     * @param {configuration} config new configuration
     * @param {object} options request options
     *
     * @return {configuration} created model
     */
    async createConfiguration(config, options) {
        this.log('debug', 'createConfiguration', 'STARTED');

        const userId = options.accessToken.userId;

        const Configuration = this.app.models.configuration;
        const configModel = new ConfigurationModelClass(this.app);

        const baseCache = await this.app.get('BaseConfigurationInstance').getConfigurationModelFromCache();

        const allBases = baseCache.sort((a, b) => {
            return a.sequenceNumber > b.sequenceNumber;
        });

        await this.createCrypt();

        const basesObj = {};
        const newObject = {};

        for (const base of allBases) {
            if (config[base.name] !== undefined) {
                basesObj[base.name] = config[base.name];

                const hasPermissions = await configModel.validateWritePermissions(base.name,
                    basesObj[base.name], userId);

                if (!hasPermissions) {
                    this.log('debug', 'createConfiguration', 'FINISHED');
                    throw new HttpErrors.BadRequest(`No permissions to write to ${config[base.name]} model`);
                }

                newObject[base.name] = config[base.name];
            } else {
                this.log('debug', 'createConfiguration', 'FINISHED');
                throw new HttpErrors.BadRequest(`${config[base.name]} model can't be empty`);
            }
        }

        this.app.hookSingleton.executeAdvancedHook('beforeCreate', 'Configuration', basesObj);

        let rules = [];

        for (let i = 0; i < allBases.length; i++) {
            const parent = allBases[i];
            const model = await configModel.findOneWithPermissions({
                where: {
                    base: parent.name,
                    name: config[parent.name],
                },
            }, options);

            if (model !== null) {
                rules = [...rules, ...model.rules];
                if (model.options !== null) {
                    if (model.options.hasRestrictions) {
                        let anyMatch = false;
                        for (const restriction of model.restrictions) {
                            let match = true;
                            for (const base of allBases) {
                                if (restriction[base.name] && restriction[base.name] !== config[base.name]) {
                                    match = false;
                                }
                            }
                            if (match === true) {
                                anyMatch = true;
                            }
                        }
                        if (anyMatch === false) {
                            this.log('debug', 'createConfiguration', 'FINISHED');
                            throw new HttpErrors.BadRequest(`${model.name} model restriction forbids ` +
                                `this configuration`);
                        }
                    }
                }
            } else {
                this.log('debug', 'createConfiguration', 'FINISHED');
                throw new HttpErrors.BadRequest(`Invalid value for model ${parent.name}`);
            }
        }

        for (const rule of rules) {
            for (const variable of config.variables) {
                if (rule.targetRegEx) {
                    const regex = new RegExp(rule.targetValue);
                    if (regex.test(variable[rule.targetType])) {
                        if (rule.conditionRegEx) {
                            const conRegEx = new RegExp(rule.conditionValue);
                            if (!conRegEx.test(variable[rule.conditionType])) {
                                this.log('debug', 'createConfiguration', 'FINISHED');
                                throw new HttpErrors.BadRequest(`Invalid ${
                                    rule.conditionType} in ${variable.name}: ${rule.error}`);
                            }
                        } else {
                            if (variable[rule.conditionType] !== rule.conditionValue) {
                                this.log('debug', 'createConfiguration', 'FINISHED');
                                throw new HttpErrors.BadRequest(`Invalid ${
                                    rule.conditionType} in ${variable.name}: ${rule.error}`);
                            }
                        }
                    }
                } else {
                    if (variable[rule.targetType] === rule.targetValue) {
                        if (rule.conditionRegEx) {
                            const conRegEx = new RegExp(rule.conditionValue);
                            if (!conRegEx.test(variable[rule.conditionType])) {
                                this.log('debug', 'createConfiguration', 'FINISHED');
                                throw new HttpErrors.BadRequest(`Invalid ${
                                    rule.conditionType} in ${variable.name}: ${rule.error}`);
                            }
                        } else {
                            if (variable[rule.conditionType] !== rule.conditionValue) {
                                this.log('debug', 'createConfiguration', 'FINISHED');
                                throw new HttpErrors.BadRequest(`Invalid ${
                                    rule.conditionType} in ${variable.name}: ${rule.error}`);
                            }
                        }
                    }
                }
            }
        }

        config.variables.map( (variable, i) => {
            if (!variable.name) {
                this.log('debug', 'createConfiguration', 'FINISHED');
                throw new HttpErrors.BadRequest('Invalid variable: name not valid');
            }
            if (!variable.type) {
                this.log('debug', 'createConfiguration', 'FINISHED');
                throw new HttpErrors.BadRequest('Invalid variable: type not valid');
            }

            if (variable.type === 'password' && variable.value && !this.app.fullEncryption) {
                variable.value = this.encryptPassword(variable.value);
            }

            if (variable.type === 'number' && isNaN(variable.value)) {
                this.log('debug', 'createConfiguration', 'FINISHED');
                throw new HttpErrors.BadRequest('Invalid variable: value is not a number');
            }

            variable._id = i;
        });

        const newVariables = [];
        config.variables.forEach( (el) => {
            newVariables.push({
                name: el.name,
                value: el.value,
                type: el.type,
            });
        });

        newObject.variables = newVariables;

        if (this.app.fullEncryption) {
            const allVariables = JSON.stringify(newObject.variables);
            newObject.variables = this.encryptPassword(allVariables);
        }

        const configuration = this.app.models.configuration;
        let version = await configuration.count(basesObj);

        newObject.createdBy = userId;
        newObject.version = ++version;
        newObject.draft = config.draft === undefined ? false : config.draft;
        newObject.promoted = false;
        newObject.effectiveDate = undefined;
        newObject.deleted = false;

        const configObject = await Configuration.create(newObject);

        if (!configObject.draft) {
            const hookObject = {
                version: configObject.version,
            };

            this.afterSaveHooks(configObject, basesObj, hookObject);
        }

        this.log('debug', 'createConfiguration', 'FINISHED');

        return configObject;
    }

    /**
     * Executed after the configuration save
     *
     * @param {Object} configuration configuration
     * @param {string} bases bases for given hook
     * @param {string} data data of hook to execute
     *
     */
    async afterSaveHooks(configuration, bases, data) {
        if (configuration.draft !== true) {
            await this.app.models.connection.findSCPConnectionsAndCopy(configuration);
            await this.app.hookSingleton.executeAdvancedHook('afterCreate', 'Configuration', bases, data);
        }
    }

    /**
     * Promote configuration
     *
     * @param {string} id configuration id to promote
     * @param {object} options request options
     *
     */
    async promoteConfiguration(id, options) {
        this.log('debug', 'promoteConfiguration', 'STARTED');

        let toPromote = await this.findWithPermissions({
            where: {
                id: id,
                draft: false,
            },
        }, options);

        if (toPromote.length === 0) {
            this.log('debug', 'promoteConfiguration', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid configuration id');
        }

        const Configuration = this.app.models.configuration;

        toPromote = await Configuration.find({
            where: {
                id: id,
                draft: false,
            },
        });

        toPromote[0].promoted = true;
        await toPromote[0].save();

        this.log('debug', 'promoteConfiguration', 'FINISHED');

        return toPromote[0];
    }

    /**
     * Find all promotion candidates for given model
     *
     * @param {configuration} configuration configuration
     * @param {object} options request options
     *
     */
    async findPromotionCandidates(configuration, options) {
        this.log('debug', 'findPromotionCandidates', 'STARTED');

        const promotion = this.app.models.promotion;
        // const baseConfiguration = this.app.models.baseConfiguration;

        // const bases = await baseConfiguration.find();
        const bases = await this.app.get('BaseConfigurationInstance').getConfigurationModelFromCache();

        const modelMap = new Map();
        bases.forEach((base) => {
            if (configuration[base.name] !== undefined && configuration[base.name] !== null) {
                modelMap.set(base.name, configuration[base.name]);
            }
        });

        if (modelMap.size === 0) {
            this.log('debug', 'findPromotionCandidates', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid configuration');
        }

        let whereFilter = {or: []};
        modelMap.forEach((value, key) => {
            whereFilter.or.push({
                base: key,
                toModels: value,
            });
        });

        const candidates = await promotion.find({
            where: whereFilter,
        });

        if (candidates.length === 0) {
            this.log('debug', 'findPromotionCandidates', 'FINISHED');
            return [];
        }

        whereFilter = {or: []};

        for (const cand of candidates) {
            const base = cand.base;
            const value = cand.fromModel;
            const filter = {};
            modelMap.forEach((value, key) => {
                if (key !== base) {
                    filter[key] = value;
                }
            });

            filter[base] = value;
            filter.promoted = true;

            whereFilter.or.push(filter);
        }

        const candConfig = await this.findWithPermissions({where: whereFilter, order: 'effectiveDate DESC'}, options);

        this.log('debug', 'findPromotionCandidates', 'FINISHED');

        return candConfig;
    }

    /**
     * Find configuration for given time (version + default variables)
     *
     * @param {any} filter query filter
     * @param {string} date date string
     * @param {object} options request options
     *
     */
    async findConfigurationForGivenDate(filter, date, options) {
        this.log('debug', 'findConfigurationForGivenDate', 'STARTED');

        const givenDate = new Date(date);
        if (givenDate == 'Invalid Date') {
            this.log('debug', 'findConfigurationForGivenDate', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid date');
        }

        const constVariable = new ConstantVariableClass(this.app);

        filter.effectiveDate = {lt: givenDate};
        filter.deleted = false;
        filter.draft = false;

        let candConfig = await this.findWithPermissions({
            where: filter,
            order: 'effectiveDate DESC',
            limit: 1,
        }, options);

        candConfig = candConfig.length > 0 ? candConfig[0] : undefined;

        if (candConfig === undefined) {
            this.log('debug', 'findConfigurationForGivenDate', 'FINISHED');
            return {};
        }

        const variables = await constVariable.findForDate(filter, givenDate, options);

        candConfig.variables.map((variable) => {
            const constVariable = variables.find( (el) => {
                return el.name === variable.name;
            });

            if (constVariable !== undefined) {
                if (constVariable.forced) {
                    variable.type = constVariable.type;
                    variable.value = constVariable.value;
                }
            }
        });

        variables.forEach( (variable) => {
            if (variable.addIfAbsent) {
                const found = candConfig.variables.find( (el) => {
                    return el.name === variable.name;
                });

                if (found === undefined) {
                    candConfig.variables.push(variable);
                }
            }
        });

        this.log('debug', 'findConfigurationForGivenDate', 'FINISHED');

        return candConfig;
    }
};
