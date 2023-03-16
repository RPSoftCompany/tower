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

module.exports = class ConfigurationModel {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'configurationModel';
        this.logger = null;

        this.app = app;

        this.confModelCache = [];

        this.cacheEnabled = true;
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
    log(severity, method, message, obj = undefined) {
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
     * creates local cache
     *
     */
    async createCache() {
        const ConfigurationModel = this.app.models.configurationModel;

        this.confModelCache = await ConfigurationModel.find();

        const changeStream = this.app.dataSources['mongoDB'].connector.collection('configurationModel').watch();
        changeStream.on('error', (err) => {
            if (err.code === 40573) {
                this.cacheEnabled = false;
            }
        });
        changeStream.on('change', async () => {
            this.confModelCache = await ConfigurationModel.find();
        });

        this.app.set('ConfModelInstance', this);
    }

    /**
     * get model from cache or DB if not dataset
     *
     */
    async getConfigurationModelFromCache() {
        if (this.cacheEnabled) {
            return this.confModelCache;
        } else {
            return await this.app.models.configurationModel.find();
        }
    }

    /**
     * Works exectly the same as find, but filters data depanding on user permissions
     *
     * @param {object} filter regular filter
     * @param {object} options options from request
     * @param {boolean} showDeleted shows deleted models
     *
     * @return {object} configuration object
     */
    async findWithPermissions(filter, options, showDeleted) {
        this.log('debug', 'findWithPermissions', 'STARTED');

        const Role = this.app.models.Role;
        const ConfigModel = this.app.models.configurationModel;

        if (showDeleted === undefined || !showDeleted) {
            if (filter !== undefined) {
                if (filter.where !== undefined) {
                    if (filter.where.deleted === undefined) {
                        filter.where.deleted = false;
                    }
                } else {
                    filter.where = {
                        deleted: false,
                    };
                }
            } else {
                filter = {
                    where: {
                        deleted: false,
                    },
                };
            }
        }

        const userId = options.accessToken.userId;

        let ret = await ConfigModel.find(filter);

        const allRoles = await Role.find();

        const roleSet = new Set();
        allRoles.forEach((role) => {
            roleSet.add(role.name);
        });

        const member = this.app.get('MemberInstance');

        const userRoles = await member.getUserRoles(userId);

        ret = ret.filter((model) => {
            const modelPermName = `configurationModel.${model.base}.${model.name}.view`;
            if (roleSet.has(modelPermName)) {
                return userRoles.includes(modelPermName) || userRoles.includes('admin');
            }

            return true;
        });

        this.log('debug', 'findWithPermissions', 'FINISHED');
        return ret;
    };

    /**
     * Works exectly the same as findOne, but filters data depanding on user
     *
     * @param {object} filter regular filter
     * @param {object} options options from request
     *
     * @return {object} configuration object
     */
    async findOneWithPermissions(filter, options) {
        this.log('debug', 'findOneWithPermissions', 'STARTED');

        let ret = await this.findWithPermissions(filter, options);

        if (ret === undefined || ret === null || ret.length === 0) {
            ret = null;
        } else {
            ret = ret[0];
        }

        this.log('debug', 'findOneWithPermissions', 'FINISHED');
        return ret;
    };

    /**
     * Creates configuration model
     *
     * @param {configurationModel} model Model to add
     * @param {object} options options from request
     *
     * @return {configurationModel} created model
     */
    async createConfigurationModel(model, options) {
        this.log('debug', 'createConfigurationModel', 'STARTED');

        model.deleted = false;

        let wasDeleted = false;

        const confModelCache = await this.getConfigurationModelFromCache();

        const exists = confModelCache.find((el) => {
            return el.name === model.name && el.base === model.base;
        });

        const hookBase = {};
        hookBase[model.base] = model.name;

        this.app.hookSingleton.executeAdvancedHook('beforeCreate', 'ConfigurationModel', hookBase);

        if (model.id !== undefined) {
            this.log('debug', 'createConfigurationModel', 'FINISHED');
            throw new HttpErrors.BadRequest(`New model shouldn't contain id`);
        }

        if (exists !== undefined) {
            if (exists.deleted !== true) {
                this.log('debug', 'createConfigurationModel', 'FINISHED');
                throw new HttpErrors.BadRequest('Model with this name already exists');
            } else {
                wasDeleted = true;
            }
        }

        if (model.base === undefined || model.base === null || model.base === '') {
            this.log('debug', 'createConfigurationModel', 'FINISHED');
            throw new HttpErrors.BadRequest('Base needs to be set');
        }

        const baseAll = await this.app.get('BaseConfigurationInstance').getConfigurationModelFromCache();

        const baseExists = baseAll.find((el) => {
            return el.name === model.base;
        });

        if (baseExists === undefined) {
            this.log('debug', 'createConfigurationModel', 'FINISHED');
            throw new HttpErrors.BadRequest(`Base configuration for ${model.base} does not exist`);
        }

        if (!await this.validateWritePermissions(model.base, model.name, options.accessToken.userId)) {
            this.log('debug', 'createConfigurationModel', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        model.rules = [];
        if (!model.restrictions) {
            model.restrictions = [];
        }

        if (wasDeleted) {
            await exists.updateAttributes(model);
            this.app.hookSingleton.executeAdvancedHook('afterCreate', 'ConfigurationModel', hookBase);
            this.log('debug', 'createConfigurationModel', 'FINISHED');

            return exists;
        } else {
            model.options = {
                hasRestrictions: false,
            };
            await model.save();
            this.app.hookSingleton.executeAdvancedHook('afterCreate', 'ConfigurationModel', hookBase);
            this.log('debug', 'createConfigurationModel', 'FINISHED');

            return model;
        }
    }

    /**
     * Validates if given user can save using this model
     *
     * @param {string} baseName base model name
     * @param {string} configModelName model name
     * @param {string} userId user id
     *
     * @return {boolean} true, if user can write with this model
     */
    async validateWritePermissions(baseName, configModelName, userId) {
        this.log('debug', 'validateWritePermissions', 'STARTED');

        const member = this.app.get('MemberInstance');
        const roles = await member.getUserRoles(userId);

        const rolesCache = await member.getRolesFromCache();

        const hasReadWrite = rolesCache.filter((role) => {
            return role.name === `configurationModel.view` || role.name === `configurationModel.modify`;
        });

        if (hasReadWrite.length !== 2) {
            this.log('debug', 'validateWritePermissions', 'FINISHED');
            return false;
        }

        const thisBaseWritePerm = rolesCache.find((role) => {
            return role.name === `baseConfigurations.${baseName}.view`;
        });

        if (thisBaseWritePerm !== undefined) {
            const hasWritePermissions = roles.includes(`baseConfigurations.${baseName}.view`);

            if (!hasWritePermissions) {
                this.log('debug', 'validateWritePermissions', 'FINISHED');
                return false;
            }
        }

        const specificPermissions = rolesCache.find((role) => {
            return role.name === `configurationModel.${baseName}.${configModelName}.modify`;
        });

        if (specificPermissions === undefined) {
            this.log('debug', 'validateWritePermissions', 'FINISHED');
            return true;
        }

        this.log('debug', 'validateWritePermissions', 'FINISHED');

        return roles.includes(`configurationModel.${baseName}.${configModelName}.modify`) &&
            roles.includes(`configurationModel.${baseName}.${configModelName}.view`);
    }

    /**
     * Updates or creates configuration model
     *
     * @param {configurationModel} model Model to add
     * @param {object} options options from request
     * @param {boolean} replace true if you want to replace whole instance or false when only part of it
     *
     * @return {configurationModel} created model
     */
    async upsertConfigurationModel(model, options, replace) {
        this.log('debug', 'upsertConfigurationModel', 'STARTED');

        const hookBase = {};
        if (model.base !== undefined && model.base !== null) {
            hookBase[model.base] = model.name;
        }

        this.app.hookSingleton.executeAdvancedHook('beforeUpsert', 'ConfigurationModel', hookBase);

        model.deleted = false;

        const Role = this.app.models.Role;
        const userId = options.accessToken.userId;

        const exists = await this.findWithPermissions({
            where: {
                name: model.name,
            },
        }, options, true);

        if (exists.length > 0) {
            const roleName = `configurationModel.${model.name}.modify`;
            const oldModel = exists[0];

            if (!await this.validateWritePermissions(oldModel.base, oldModel.name, options.accessToken.userId)) {
                this.log('debug', 'removeVariable', 'FINISHED');
                throw new HttpErrors.Unauthorized();
            }

            if (model.base !== undefined) {
                const newModelName = model.name === undefined ? oldModel.name : model.name;
                if (!await this.validateWritePermissions(model.base, newModelName, options.accessToken.userId)) {
                    this.log('debug', 'removeVariable', 'FINISHED');
                    throw new HttpErrors.Unauthorized();
                }
            }

            const role = await Role.findOne({
                where: {
                    name: roleName,
                },
            });

            if (model.rules !== undefined) {
                oldModel.rules = model.rules;
            }
            if (model.defaultValues !== undefined) {
                oldModel.defaultValues = model.defaultValues;
            }
            if (model.options !== undefined) {
                oldModel.options = model.options;
            }
            if (model.options !== undefined) {
                oldModel.options = model.options;
            }

            if (role === null) {
                this.app.hookSingleton.executeAdvancedHook('afterUpsert', 'ConfigurationModel', hookBase);
                this.log('debug', 'upsertConfigurationModel', 'FINISHED');
                if (replace) {
                    return await oldModel.replaceAttributes(model, {
                        validate: false,
                    });
                } else {
                    return await oldModel.replaceAttributes(oldModel, {
                        validate: false,
                    });
                }
            } else {
                const member = this.app.get('MemberInstance');
                const userRoles = await member.getUserRoles(userId);

                if (userRoles.includes(roleName)) {
                    this.app.hookSingleton.executeAdvancedHook('afterUpsert', 'ConfigurationModel', hookBase);
                    this.log('debug', 'upsertConfigurationModel', 'FINISHED');
                    if (replace) {
                        return await oldModel.replaceAttributes(model, {
                            validate: false,
                        });
                    } else {
                        return await oldModel.replaceAttributes(oldModel, {
                            validate: false,
                        });
                    }
                } else {
                    this.app.hookSingleton.executeAdvancedHook('afterUpsert', 'ConfigurationModel', hookBase);
                    this.log('debug', 'upsertConfigurationModel', 'FINISHED');
                    throw new HttpErrors.Unauthorized();
                }
            }
        } else {
            this.app.hookSingleton.executeAdvancedHook('afterUpsert', 'ConfigurationModel', hookBase);
            this.log('debug', 'upsertConfigurationModel', 'FINISHED');
            return await model.save();
        }
    };

    /**
     * Deletes configuration model
     *
     * @param {string} modelId Model id to delete
     * @param {object} options options from request
     *
     * @return {configurationModel} created model
     */
    async deleteModel(modelId, options) {
        this.log('debug', 'deleteModel', 'STARTED');

        const model = await this.findOneWithPermissions({
            where: {
                id: modelId,
            },
        }, options);

        if (model !== null && model !== undefined) {
            const hookBase = {};
            hookBase[model.base] = model.name;

            this.app.hookSingleton.executeAdvancedHook('beforeDelete', 'ConfigurationModel', hookBase, {modelId});

            if (!await this.validateWritePermissions(model.base, model.name, options.accessToken.userId)) {
                this.log('debug', 'deleteModel', 'FINISHED');
                throw new HttpErrors.Unauthorized();
            }

            model.deleted = true;
            await model.replaceAttributes(model, {
                validate: false,
            });

            this.app.hookSingleton.executeAdvancedHook('afterDelete', 'ConfigurationModel', hookBase, {modelId});
        }

        this.log('debug', 'deleteModel', 'FINISHED');
    }

    /**
     * Adds new rule to model
     *
     * @param {string} modelId Model id
     * @param {Rule} rule Rule to add
     * @param {object} options options from request
     *
     * @return {Rule} returns created rule
     */
    async addRule(modelId, rule, options) {
        this.log('debug', 'addRule', 'STARTED');

        const model = await this.findOneWithPermissions({
            where: {
                id: modelId,
            },
        }, options);

        if (model === null) {
            this.log('debug', 'addRule', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid model id');
        }

        const bases = {};
        bases[model.base] = model.name;

        this.app.hookSingleton.executeAdvancedHook('beforeAddRule', 'ConfigurationModel', bases, rule);

        if (!await this.validateWritePermissions(model.base, model.name, options.accessToken.userId)) {
            this.log('debug', 'addRule', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        const Rule = this.app.models.rule;
        let isValid = true;

        Object.getOwnPropertyNames(Rule.definition.rawProperties).forEach((el) => {
            const req = Rule.definition.rawProperties[el].required === undefined
                ? false : Rule.definition.rawProperties[el].required;
            if (req) {
                if (rule[el] === undefined || rule[el] === null || rule[el] === '') {
                    isValid = false;
                }
            }
        });

        if (!isValid) {
            this.log('debug', 'addRule', 'FINISHED');
            throw new HttpErrors.BadRequest('Rule model is invalid');
        }


        rule._id = '_' + Math.random().toString(36).substr(2, 15);

        model.rules.push(rule);

        await model.save();

        this.app.hookSingleton.executeAdvancedHook('afterAddRule', 'ConfigurationModel', bases, rule);

        this.log('debug', 'addRule', 'FINISHED');

        return rule;
    }

    /**
     * Removes rule from model
     *
     * @param {string} modelId Model id
     * @param {string} ruleId Rule id
     * @param {object} options options from request
     */
    async removeRule(modelId, ruleId, options) {
        this.log('debug', 'removeRule', 'STARTED');

        const model = await this.findOneWithPermissions({
            where: {
                id: modelId,
            },
        }, options);

        const hookBase = {};
        hookBase[model.base] = model.name;

        this.app.hookSingleton.executeAdvancedHook('beforeRemoveRule', 'ConfigurationModel', hookBase, {
            modelId: modelId,
            ruleId: ruleId,
        });

        if (model === null) {
            this.log('debug', 'removeRule', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid model id');
        }

        if (!await this.validateWritePermissions(model.base, model.name, options.accessToken.userId)) {
            this.log('debug', 'removeRule', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        model.rules = model.rules.filter((rule) => {
            return rule._id.toString().trim() !== ruleId.toString().trim();
        });

        await model.save();

        this.app.hookSingleton.executeAdvancedHook('afterRemoveRule', 'ConfigurationModel', hookBase, {
            modelId: modelId,
            ruleId: ruleId,
        });

        this.log('debug', 'removeRule', 'FINISHED');
    }

    /**
     * Updates rule from model
     *
     * @param {string} modelId Model id
     * @param {Rule} rule Rule to update (with id)
     * @param {object} options options from request
     *
     * @return {Rule} returns updated rule
     */
    async modifyRule(modelId, rule, options) {
        this.log('debug', 'modifyRule', 'STARTED');

        const model = await this.findOneWithPermissions({
            where: {
                id: modelId,
            },
        }, options);

        if (model === null) {
            this.log('debug', 'modifyRule', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid model id');
        }

        const hookBase = {};
        hookBase[model.base] = model.name;

        this.app.hookSingleton.executeAdvancedHook('beforeModifyRule', 'ConfigurationModel', hookBase, rule);

        if (!await this.validateWritePermissions(model.base, model.name, options.accessToken.userId)) {
            this.log('debug', 'modifyRule', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        const Rule = this.app.models.rule;
        let isValid = true;

        Object.getOwnPropertyNames(Rule.definition.rawProperties).forEach((el) => {
            const req = Rule.definition.rawProperties[el].required === undefined
                ? false : Rule.definition.rawProperties[el].required;
            if (req) {
                if (rule[el] === undefined || rule[el] === null || rule[el] === '') {
                    isValid = false;
                }
            }
        });

        if (!isValid) {
            this.log('debug', 'addRule', 'FINISHED');
            throw new HttpErrors.BadRequest('Rule model is invalid');
        }

        let changedRule = null;

        model.rules = model.rules.map((el) => {
            if (el._id.toString().trim() === rule._id.toString().trim()) {
                el = rule;
                changedRule = el;
            }

            return el;
        });

        await model.save();

        this.app.hookSingleton.executeAdvancedHook('afterModifyRule', 'ConfigurationModel', hookBase, rule);

        this.log('debug', 'modifyRule', 'FINISHED');

        return changedRule;
    }

    /**
     * Updates model options
     *
     * @param {string} modelId Model id
     * @param {modelOptions} modelOptions model options
     * @param {object} options options from request
     *
     * @return {modelOptions} returns updated rule
     */
    async modifyModelOptions(modelId, modelOptions, options) {
        this.log('debug', 'modifyModelOptions', 'STARTED');

        const model = await this.findOneWithPermissions({
            where: {
                id: modelId,
            },
        }, options);

        if (model === null) {
            this.log('debug', 'modifyModelOptions', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid model id');
        }

        if (!await this.validateWritePermissions(model.base, model.name, options.accessToken.userId)) {
            this.log('debug', 'modifyModelOptions', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        model.options = modelOptions;

        await model.save();

        this.log('debug', 'modifyModelOptions', 'FINISHED');

        return model.options;
    }

    /**
     * Adds new restriction to model
     *
     * @param {string} modelId Model id
     * @param {object} restriction variable to add
     * @param {object} options options from request
     */
    async addRestriction(modelId, restriction, options) {
        this.log('debug', 'addRestriction', 'STARTED');

        const model = await this.findOneWithPermissions({
            where: {
                id: modelId,
            },
        }, options);

        if (model === null) {
            this.log('debug', 'addRestriction', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid model id');
        }

        if (!await this.validateWritePermissions(model.base, model.name, options.accessToken.userId)) {
            this.log('debug', 'addRestriction', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        if (model.restrictions === undefined) {
            model.restrictions = [];
        }

        model.options.hasRestrictions = true;

        if (!restriction.__id) {
            restriction.__id = Math.random().toString(36).replace(/[^a-z]+/g, '');
        }

        const isIn = model.restrictions.find((el) => {
            let same = true;
            Object.keys(restriction).forEach((key) => {
                if (key !== '__id') {
                    if (!el[key]) {
                        same = false;
                    } else if (el[key] !== restriction[key]) {
                        same = false;
                    }
                }
            });
            return same;
        });

        if (isIn === undefined) {
            model.restrictions.push(restriction);
            await model.save();
        }

        this.log('debug', 'addRestriction', 'FINISHED');
    }

    /**
     * Remove restriction from model
     *
     * @param {string} modelId Model id
     * @param {string} restrictionId variable to remove
     * @param {object} options options from request
     */
    async removeRestriction(modelId, restrictionId, options) {
        this.log('debug', 'removeRestriction', 'STARTED');

        const model = await this.findOneWithPermissions({
            where: {
                id: modelId,
            },
        }, options);

        if (model === null) {
            this.log('debug', 'removeRestriction', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid model id');
        }

        if (!await this.validateWritePermissions(model.base, model.name, options.accessToken.userId)) {
            this.log('debug', 'removeRestriction', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        if (model.restrictions === undefined) {
            model.restrictions = [];
        }

        model.restrictions = model.restrictions.filter((el) => {
            return el.__id !== restrictionId;
        });

        await model.save();

        this.log('debug', 'removeRestriction', 'FINISHED');
    }

    /**
     * Modify restriction in model
     *
     * @param {string} modelId Model id
     * @param {object} restriction variable to remove
     * @param {object} options options from request
     */
    async modifyRestriction(modelId, restriction, options) {
        this.log('debug', 'modifyRestriction', 'STARTED');

        const model = await this.findOneWithPermissions({
            where: {
                id: modelId,
            },
        }, options);

        if (model === null) {
            this.log('debug', 'modifyRestriction', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid model id');
        }

        if (!await this.validateWritePermissions(model.base, model.name, options.accessToken.userId)) {
            this.log('debug', 'modifyRestriction', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        if (model.restrictions === undefined) {
            model.restrictions = [];
        }

        model.restrictions = model.restrictions.map((el) => {
            if (el.__id === restriction.__id) {
                el = restriction;
            }

            return el;
        });

        await model.save();

        this.log('debug', 'modifyRestriction', 'FINISHED');
    }
};
