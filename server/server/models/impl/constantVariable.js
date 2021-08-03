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

module.exports = class BaseConfiguration {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'constantVariable';
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
     * create constant variable
     *
     * @param {constantVariable} constantVariable new constant variable
     * @param {object} options options from request
     *
     * @return {constantVariable} created model
     */
    async createConstantVariable(constantVariable, options) {
        this.log('debug', 'createConstantVariable', 'STARTED');

        const baseConfiguration = this.app.models.baseConfiguration;
        const Roles = this.app.models.Role;
        const ConfModelInstance = this.app.get('ConfModelInstance');

        const member = this.app.get('MemberInstance');
        const userId = options.accessToken.userId;
        const userRoles = await member.getUserRoles(userId);

        if (!(userRoles.includes('constantVariable.modify') || userRoles.includes('admin'))) {
            this.log('debug', 'findWithPermissions', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        const roles = await Roles.find( {where: {
            name: /^constantVariable./,
        }});

        const allBases = await baseConfiguration.find();
        let baseExists = false;
        const match = {};
        const _id = {};
        const bases = new Map();

        for (const base of allBases) {
            _id[base.name] = `$${base.name}`;
            if (constantVariable[base.name] !== undefined) {
                baseExists = true;

                const where = {};
                where.name = constantVariable[base.name];
                where.base = base.name;

                bases.set(base.name, constantVariable[base.name]);

                match[base.name] = constantVariable[base.name];

                const found = await ConfModelInstance.findOneWithPermissions({
                    where: where,
                }, options);

                if (found === null) {
                    this.log('debug', 'createConstantVariable', 'FINISHED');
                    throw new HttpErrors.BadRequest('Invalid model name');
                }

                if (!await ConfModelInstance.validateWritePermissions(base.name,
                    constantVariable[base.name], options.accessToken.userId)) {
                    this.log('debug', 'createConstantVariable', 'FINISHED');
                    throw new HttpErrors.Unauthorized();
                }

                const roleFound = roles.find( (el) => {
                    return el.name === `constantVariable.${base.name}.${constantVariable[base.name]}.modify`;
                });

                if (roleFound) {
                    if (!userRoles.includes(`constantVariable.${base.name}.${constantVariable[base.name]}.modify`)
                        || userRoles.includes('admin')) {
                        this.log('debug', 'createConstantVariable', 'FINISHED');
                        throw new HttpErrors.Unauthorized();
                    }
                }
            }
        }

        if (!baseExists) {
            this.log('debug', 'createConstantVariable', 'FINISHED');
            throw new HttpErrors.BadRequest('Constant variable should have at least one model');
        }

        constantVariable.createdBy = options.accessToken.userId;
        delete constantVariable.id;
        delete constantVariable.effectiveDate;

        const ConstantVariable = this.app.models.constantVariable;

        const newVariable = new ConstantVariable({
            createdBy: options.accessToken.userId,
            variables: constantVariable.variables,
        });

        bases.forEach( (value, key) => {
            newVariable[key] = value;
        });

        await newVariable.save();

        this.log('debug', 'createConstantVariable', 'FINISHED');

        this.afterConstantVariableSave(match, _id, constantVariable, allBases);
    }

    /**
     * After constant variable save
     *
     * @param {object} match
     * @param {object} _id
     * @param {object} constantVariable
     *
     * @return {constantVariable} created model
     */
    async afterConstantVariableSave(match, _id, constantVariable, bases) {
        this.log('debug', 'findWithPermissions', 'STARTED');

        const group = {
            _id: _id,
            version: {$max: '$version'},
        };

        for (const base of bases) {
            group[base.name] = {$first: `$${base.name}`};
        }

        const cursor = await this.app.dataSources['mongoDB'].connector.collection('configuration').aggregate([
            {
                $match: match,
            },
            {
                $group: group,
            },
        ]);

        cursor.each( async (_err, item) => {
            if (item) {
                const configurationModel = this.app.models.configuration;
                const filter = {where: {
                    version: item.version,
                }};
                for (const base of bases) {
                    filter.where[base.name] = item[base.name];
                }
                const fullConfig = await configurationModel.findOne(filter);

                let execute = false;
                for (let i = 0; i < constantVariable.variables.length; i++) {
                    const variable = constantVariable.variables[i];
                    if (variable.addIfAbsent === true) {
                        execute = true;
                    } else if (variable.forced === true) {
                        for (let j = 0; j < fullConfig.variables.length; j++) {
                            if (fullConfig.variables[j].name === variable.name) {
                                execute = true;
                                j = fullConfig.variables.length;
                            }
                        }
                    }

                    if (execute === true) {
                        i = constantVariable.variables.length;
                    }
                }
                if (execute === true) {
                    await this.app.models.connection.findSCPConnectionsAndCopy(fullConfig);
                    this.app.hookSingleton.executeAdvancedHook('afterUpdate', 'Configuration', item._id);
                }
            }
        });

        const hookBase = {};

        bases.forEach((value, key) => {
            hookBase[key] = value;
        });

        this.app.hookSingleton.executeAdvancedHook('variableChanged', 'ConstantVariable', hookBase);
    }

    /**
     * Works exectly the same as find, but filters data depanding on user
     *
     * @param {object} filter filter
     * @param {object} options options from request
     *
     * @return {constantVariable} created model
     */
    async findWithPermissions(filter, options) {
        this.log('debug', 'findWithPermissions', 'STARTED');

        const ConstantVariable = this.app.models.constantVariable;
        const baseConfiguration = this.app.models.baseConfiguration;
        const ConfModelInstance = this.app.get('ConfModelInstance');

        const allBases = await baseConfiguration.find();

        const all = await ConstantVariable.find(filter);

        const allModels = await ConfModelInstance.findWithPermissions({}, options);

        const modelsMap = new Map();

        for (const model of allModels) {
            if (modelsMap.has(model.base)) {
                modelsMap.get(model.base).add(model.name);
            } else {
                const set = new Set();
                set.add(model.name);
                modelsMap.set(model.base, set);
            }
        }

        const out = [];

        for (const constVariable of all) {
            for (const base of allBases) {
                if (constVariable[base.name] !== undefined) {
                    if (modelsMap.has(base.name)) {
                        const set = modelsMap.get(base.name);
                        if (set.has(constVariable[base.name])) {
                            out.push(constVariable);
                        }
                    } else {
                        out.push(constVariable);
                    }
                }
            }
        }

        this.log('debug', 'findWithPermissions', 'FINISHED');

        return out;
    }

    /**
     * Get latest constant variables for given models
     *
     * @param {object} filter filter
     * @param {object} options options from request
     *
     * @return {constantVariable} created model
     */
    async findLatest(filter, options) {
        this.log('debug', 'findLatest', 'STARTED');

        const all = this.findForDate(filter, undefined, options);

        this.log('debug', 'findLatest', 'FINISHED');

        return all;
    }

    /**
     * Get latest constant variables for given models
     *
     * @param {object} filter filter
     * @param {Date} date date
     * @param {object} options options from request
     *
     * @return {constantVariable} created model
     */
    async findForDate(filter, date, options) {
        this.log('debug', 'findForDate', 'STARTED');

        const baseConfiguration = this.app.models.baseConfiguration;

        const allBases = await baseConfiguration.find({order: 'sequenceNumber ASC'});

        const where = {or: []};

        for (const base of allBases) {
            if (filter[base.name] !== undefined) {
                const object = {};
                object[base.name] = filter[base.name];
                where.or.push(object);
            }
        }

        if (where.or.length === 0) {
            this.log('debug', 'findLatest', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid filter');
        }

        if (date) {
            where.effectiveDate = {
                lt: new Date(date),
            };
        }

        const allVariables = await this.findWithPermissions({where, order: 'sequenceNumber ASC'}, options);

        const map = new Map();

        allVariables.forEach( (el) => {
            let temp = '';
            let noGo = false;
            let undefParent = false;
            for (const base of allBases) {
                if (el[base.name] !== undefined) {
                    if (filter[base.name] !== undefined) {
                        if (filter[base.name] === el[base.name] && !undefParent) {
                            temp += base.name + ',';
                        } else {
                            noGo = true;
                        }
                    }
                } else {
                    undefParent = true;
                }
            }

            if (temp !== '' && noGo === false) {
                if (map.has(temp)) {
                    map.get(temp).push(el);
                } else {
                    map.set(temp, [el]);
                }
            }
        });

        const variables = new Map();

        for (const base of allBases) {
            map.forEach( (value, key) => {
                if (key.includes(base.name)) {
                    const temp = value[value.length - 1].variables;
                    temp.forEach((el) => {
                        el.source = base.name;
                        variables.set(el.name, el);
                    });
                }
            });
        }

        const all = [];

        variables.forEach( (value) => {
            all.push(value);
        });

        this.log('debug', 'findForDate', 'FINISHED');

        return all;
    }
};
