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

const axios = require('axios');
const HttpErrors = require('http-errors');

module.exports = class Hook {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'Hook';
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
        if (this.logger === null || this.logger === undefined) {
            if (this.app.get('winston') === undefined) {
                return;
            }
            this.logger = this.app.get('winston');
        }

        this.logger.log(severity, `${this.configurationName}.${method} ${message}`, obj);
    }

    /**
     * create hook
     *
     * @param {string} method new hooks method
     * @param {string} model new hooks model
     * @param {string} description new hooks description
     *
     * @return {Hook} created hook
     */
    async createHook(method, model, description) {
        this.log('debug', 'createHook', 'STARTED');

        const Hook = this.app.models.hook;
        const count = await Hook.count({
            model: model,
            method: method,
        });

        if (count > 0) {
            this.log('debug', 'createHook', 'FINISHED');
            return null;
        }

        const newHook = await Hook.create({
            method: method,
            model: model,
            description: description,
            hooks: [],
        });

        this.log('debug', 'createHook', 'FINISHED');

        return newHook;
    }

    /**
     * add hook object
     *
     * @param {HookObject} hookObject new hook object
     * @param {string} id hook objects model
     *
     * @return {Hook} created hook
     */
    async addHookObject(hookObject, id) {
        this.log('debug', 'addHookObject', 'STARTED');

        hookObject.url = hookObject.url.trim();
        hookObject.description = hookObject.description.trim();
        hookObject._id = Math.random().toString(36).substr(2, 15);

        if (!hookObject.url.startsWith('http')) {
            this.log('debug', 'addHookObject', 'FINISHED');
            throw new HttpErrors.BadRequest('Hook URL must start with \'http\'');
        }

        const hook = this.app.models.hook;
        const parent = await hook.findOne({
            where: {
                id: id,
            },
        });

        if (parent === null || parent == undefined) {
            this.log('debug', 'addHookObject', 'FINISHED');
            throw new HttpErrors.BadRequest('Hook with given id doesn\'t exist');
        }

        if (parent.hooks === undefined) {
            parent.hooks = [];
        }

        const some = parent.hooks.some( (obj) => {
            return obj.url === hookObject.url;
        });

        if (some) {
            this.log('debug', 'addHookObject', 'FINISHED');
            throw new HttpErrors.BadRequest('Given URL already exists in this hook');
        }

        parent.hooks.push(hookObject);

        parent.save();

        this.log('debug', 'addHookObject', 'FINISHED');

        return hookObject;
    };

    /**
     * modify hook object
     *
     * @param {HookObject} hookObject hook object
     * @param {string} id hook objects model
     *
     * @return {Hook} modified hook
     */
    async modifyHookObject(hookObject, id) {
        this.log('debug', 'addHookObject', 'STARTED');

        hookObject.url = hookObject.url.trim();
        hookObject.description = hookObject.description.trim();

        if (!hookObject.url.startsWith('http')) {
            this.log('debug', 'addHookObject', 'FINISHED');
            throw new HttpErrors.BadRequest('Hook URL must start with \'http\'');
        }

        if (hookObject._id === null || hookObject._id === undefined || hookObject._id === '') {
            this.log('debug', 'addHookObject', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid hook object id');
        }

        const hook = this.app.models.hook;
        const parent = await hook.findOne({
            where: {
                id: id,
            },
        });

        if (parent === null || parent == undefined) {
            this.log('debug', 'addHookObject', 'FINISHED');
            throw new HttpErrors.BadRequest('Hook with given id doesn\'t exist');
        }

        if (parent.hooks === undefined) {
            parent.hooks = [];
        }

        parent.hooks = parent.hooks.map( (obj) => {
            if (obj._id === hookObject._id) {
                obj = hookObject;
            };

            return obj;
        });

        parent.save();

        this.log('debug', 'addHookObject', 'FINISHED');

        return hookObject;
    };

    /**
     * remove hook object
     *
     * @param {string} hookObjectId hook id to remove
     * @param {string} id hook objects id
     *
     * @return {Hook} created hook
     */
    async removeHookObject(hookObjectId, id) {
        this.log('debug', 'removeHookObject', 'STARTED');

        const hook = this.app.models.hook;
        const parent = await hook.findOne({
            where: {
                id: id,
            },
        });

        if (parent === null || parent == undefined) {
            this.log('debug', 'removeHookObject', 'FINISHED');
            throw new HttpErrors.BadRequest('Hook with given id doesn\'t exist');
        }

        if (parent.hooks === undefined) {
            parent.hooks = [];
        }

        const all = parent.hooks.filter( (obj) => {
            return obj._id !== hookObjectId;
        });

        parent.hooks = all;

        parent.save();

        this.log('debug', 'removeHookObject', 'FINISHED');

        return parent;
    };

    /**
     * Execute hook
     *
     * @param {string} method method of hook to execute
     * @param {string} model model of hook to execute
     * @param {string} data data of hook to execute
     *
     */
    async executeHook(method, model, data) {
        this.log('debug', `executeHook ${method} ${model}`, 'STARTED');

        const Hook = this.app.models.hook;
        const one = await Hook.findOne({
            where: {
                model: model,
                method: method,
            },
        });

        if (one !== null && one !== undefined) {
            for (const hookObj of one.hooks) {
                axios.post(hookObj.url, data);
            }
        }

        this.log('debug', `executeHook ${method} ${model}`, 'FINISHED');
    }

    /**
     * Execute hook
     *
     * @param {string} method method of hook to execute
     * @param {string} model model of hook to execute
     * @param {string} bases bases for given hook
     * @param {string} data data of hook to execute
     *
     */
    async executeAdvancedHook(method, model, bases, data) {
        this.log('debug', `executeHook ${method} ${model}`, 'STARTED');

        const Hook = this.app.models.hook;
        const one = await Hook.findOne({
            where: {
                model: model,
                method: method,
            },
        });

        if (one !== null && one !== undefined) {
            for (const hookObj of one.hooks) {
                let template = hookObj.template;
                for ( const base of Object.getOwnPropertyNames(bases)) {
                    template = template.replace(new RegExp(`%%${base}%%`), bases[base]);
                }

                if ( data !== undefined) {
                    for ( const dat of Object.getOwnPropertyNames(data)) {
                        template = template.replace(new RegExp(`%%${dat}%%`), data[dat]);
                    }
                }

                const headers = {};

                if (hookObj.headers !== undefined) {
                    hookObj.headers.forEach( (el) => {
                        headers[el.name] = el.value;
                    });
                }

                axios({
                    method: hookObj.method,
                    headers: headers,
                    data: template,
                    url: hookObj.url,
                });
            }
        }

        this.log('debug', `executeHook ${method} ${model}`, 'FINISHED');
    }
};
