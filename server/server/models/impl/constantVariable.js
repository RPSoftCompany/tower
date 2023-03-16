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
            this.log('debug', 'createConstantVariable', 'FINISHED');
            throw new HttpErrors.Unauthorized();
        }

        const roles = await Roles.find({
            where: {
                name: /^constantVariable./,
            },
        });

        const allBases = await baseConfiguration.find();
        let baseExists = false;
        const match = {};
        const _id = {};
        const bases = new Map();

        for (const base of allBases) {
            _id[base.name] = `$${base.name}`;
            if (constantVariable[base.name] && constantVariable[base.name] !== '__NONE__') {
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

                const roleFound = roles.find((el) => {
                    return el.name === `constantVariable.${base.name}.${constantVariable[base.name]}.modify`;
                });

                if (roleFound) {
                    if (!userRoles.includes(`constantVariable.${base.name}.${constantVariable[base.name]}.modify`)
                        && !userRoles.includes('admin')) {
                        this.log('debug', 'createConstantVariable', 'FINISHED');
                        throw new HttpErrors.Unauthorized();
                    }
                }
            }
        }

        let allNull = true;
        for (const base of allBases) {
            if (constantVariable[base.name] && constantVariable[base.name] !== '__NONE__') {
                allNull = false;
            }
        }

        if (allNull === true) {
            this.log('debug', 'createConstantVariable', 'FINISHED');
            throw new HttpErrors.BadRequest('At least one model needs to be a non-null value');
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

        bases.forEach((value, key) => {
            if (!value || value === '__NONE__') {
                newVariable[key] = null;
            } else {
                newVariable[key] = value;
            }
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
     * @param {object} bases
     *
     * @return {constantVariable} created model
     */
    async afterConstantVariableSave(match, _id, constantVariable, bases) {
        this.log('debug', 'afterConstantVariableSave', 'STARTED');

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

        cursor.each(async (_err, item) => {
            if (item) {
                const configurationModel = this.app.models.configuration;
                const filter = {
                    where: {
                        version: item.version,
                    },
                };
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
     * @param {object} constObject optional variables object to check the permissions in already existing object
     *
     * @return {[constantVariable]} created model
     */
    async findWithPermissions(filter, options, constObject) {
        this.log('debug', 'findWithPermissions', 'STARTED');

        const ConstantVariable = this.app.models.constantVariable;
        const baseConfiguration = this.app.models.baseConfiguration;
        const Role = this.app.models.Role;

        const allBases = await baseConfiguration.find();

        let all = null;
        if (constObject) {
            all = [constObject];
        } else {
            all = await ConstantVariable.find(filter);
        }

        const userId = options.accessToken.userId;

        const allRoles = await Role.find();

        const roleSet = new Set();
        allRoles.forEach((role) => {
            roleSet.add(role.name);
        });

        const member = this.app.get('MemberInstance');

        const userRoles = await member.getUserRoles(userId);

        if (!userRoles.includes('configurationModel.view')) {
            return [];
        }

        all = all.filter((constVariable) => {
            let isValid = true;
            for (const base of allBases) {
                if (constVariable[base.name]) {
                    const modelPermName = `configurationModel.${base.name}.${constVariable[base.name]}.view`;
                    if (allRoles.includes(modelPermName)) {
                        if (!userRoles.includes(modelPermName)) {
                            isValid = false;
                        }
                    }
                }
            }

            return isValid;
        });

        this.log('debug', 'findWithPermissions', 'FINISHED');

        return all;
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
     * @return {constantVariable} found data
     */
    async findForDate(filter, date, options) {
        this.log('debug', 'findForDate', 'STARTED');

        const baseConfiguration = this.app.models.baseConfiguration;

        const allBases = await baseConfiguration.find({order: 'sequenceNumber ASC'});

        const queryFilter = [];

        const match = [];

        for (let i = 0; i < allBases.length - 1; i++) {
            const __filter = {};
            if (date) {
                __filter.effectiveDate = {$lte: new Date(date)};
            }
            for (const base of allBases) {
                __filter[base.name] = null;
            }
            match.push(__filter);
            for (let j = 0; j <= i; j++) {
                match[i][allBases[j].name] = filter[allBases[j].name];
            }
        }

        const __matchFilter = [];
        for (const row of match) {
            __matchFilter.push({$and: [row]});
        }

        if (__matchFilter.length > 0) {
            queryFilter.push({
                $match: {
                    $or: __matchFilter,
                },
            });
        }

        const __partitionBy = {};
        for (const base of allBases) {
            __partitionBy[base.name] = `$${base.name}`;
        }

        queryFilter.push({
            $setWindowFields: {
                partitionBy: __partitionBy,
                output: {
                    maxDate: {
                        $max: '$effectiveDate',
                        window: {
                            documents: [
                                'unbounded', 'unbounded',
                            ],
                        },
                    },
                },
            },
        });

        const __projectFilter = {};
        Object.assign(__projectFilter, __partitionBy);
        __projectFilter.variables = 1;
        __projectFilter.show = {$eq: ['$effectiveDate', '$maxDate']};
        __projectFilter.effectiveDate = 1;

        queryFilter.push({$project: __projectFilter});
        queryFilter.push({$match: {'show': true}});

        const constCursor = await this.app.dataSources['mongoDB'].connector.collection('constantVariable').aggregate(
            queryFilter, {allowDiskUse: true},
        );

        const queryResult = [];

        for await (const doc of constCursor) {
            queryResult.push(doc);
        }

        if (queryResult.length === 0) {
            return [];
        }

        const currentTest = {};
        for (const base of allBases) {
            currentTest[base.name] = null;
        }

        let tempArray = [...queryResult];
        const hierarchyArray = [];
        for (const base of allBases) {
            currentTest[base.name] = filter[base.name];
            const foundElement = tempArray.find((el) => {
                for (const innerBase of allBases) {
                    if (el[innerBase.name]) {
                        if (currentTest[innerBase.name] !== el[innerBase.name]) {
                            return false;
                        }
                    } else {
                        if (currentTest[innerBase.name]) {
                            return false;
                        }
                    }
                }

                return true;
            });

            if (foundElement) {
                tempArray = tempArray.filter((el) => {
                    return el._id !== foundElement._id;
                });
                hierarchyArray.push(foundElement);
            }
        }

        const all = {
            variables: [],
        };
        for (let row of hierarchyArray) {
            const allRow = await this.findWithPermissions({}, options, row);
            if (allRow.length > 0) {
                row = allRow[0];

                row.variables = row.variables.map((el) => {
                    for (const base of allBases) {
                        if (row[base.name]) {
                            el[base.name] = row[base.name];
                        }
                    }
                    return el;
                });
            } else {
                row.variables = [];
            }

            if (all.variables.length === 0) {
                all.variables = [...row.variables];
            } else {
                const tempVariables = [...row.variables];

                for (const tempVar of tempVariables) {
                    let updated = false;
                    all.variables.map((el) => {
                        if (el.name === tempVar.name) {
                            updated = true;
                            el.value = tempVar.value;
                            el.type = tempVar.type;
                            el.forced = tempVar.forced;
                            el.addIfAbsent = tempVar.addIfAbsent;

                            for (const base of allBases) {
                                el[base.name] = tempVar[base.name];
                            }
                        }
                    });

                    if (updated === false) {
                        all.variables.push(tempVar);
                    }
                }
            }
        }

        this.log('debug', 'findForDate', 'FINISHED');

        return all.variables;
    }
};
