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

'use strict';

const ConfigModel = require('./impl/configurationModel.js');

let configModel = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted) {
        if (main.app.dataSources['mongoDB'] === undefined) {
            setTimeout( () => {
                initiate(main);
            }, 200);
        } else {
            if (main.app.dataSources['mongoDB'].connected) {
                configModel = new ConfigModel(main.app);
                configModel.createCache();
                hook(main);
            } else {
                setTimeout( () => {
                    initiate(main);
                }, 200);
            }
        }
    } else {
        setTimeout( () => {
            initiate(main);
        }, 200);
    }
};

const hook = (main) => {
    if (main.app.hookSingleton !== undefined) {
        main.app.hookSingleton.createHook('beforeCreate', 'ConfigurationModel', 'description');
        main.app.hookSingleton.createHook('afterCreate', 'ConfigurationModel', 'description');

        main.app.hookSingleton.createHook('beforeUpsert', 'ConfigurationModel', 'description');
        main.app.hookSingleton.createHook('afterUpsert', 'ConfigurationModel', 'description');

        main.app.hookSingleton.createHook('beforeDelete', 'ConfigurationModel', 'description');
        main.app.hookSingleton.createHook('afterDelete', 'ConfigurationModel', 'description');

        main.app.hookSingleton.createHook('beforeAddRule', 'ConfigurationModel', 'description');
        main.app.hookSingleton.createHook('afterAddRule', 'ConfigurationModel', 'description');

        main.app.hookSingleton.createHook('beforeRemoveRule', 'ConfigurationModel', 'description');
        main.app.hookSingleton.createHook('afterRemoveRule', 'ConfigurationModel', 'description');

        main.app.hookSingleton.createHook('beforeModifyRule', 'ConfigurationModel', 'description');
        main.app.hookSingleton.createHook('afterModifyRule', 'ConfigurationModel', 'description');
    } else {
        setTimeout( () => {
            hook(main);
        }, 200);
    }
};

module.exports = function(Configurationmodel) {
    initiate(Configurationmodel);

    Configurationmodel.disableRemoteMethodByName('create'); // POST
    Configurationmodel.disableRemoteMethodByName('find'); // GET
    Configurationmodel.disableRemoteMethodByName('upsert'); // PATCH
    Configurationmodel.disableRemoteMethodByName('replaceOrCreate'); // PUT

    Configurationmodel.disableRemoteMethodByName('findById');
    Configurationmodel.disableRemoteMethodByName('exists');
    Configurationmodel.disableRemoteMethodByName('replaceById');
    Configurationmodel.disableRemoteMethodByName('deleteById');
    Configurationmodel.disableRemoteMethodByName('prototype.updateAttributes');

    Configurationmodel.disableRemoteMethodByName('findOne');
    Configurationmodel.disableRemoteMethodByName('update');
    Configurationmodel.disableRemoteMethodByName('upsertWithWhere');

    Configurationmodel.disableRemoteMethodByName('count');

    Configurationmodel.disableRemoteMethodByName('createChangeStream');

    Configurationmodel.findWithPermissions = async (filter, options) => {
        return await configModel.findWithPermissions(filter, options);
    };

    Configurationmodel.createConfigurationModel = async (model, options) => {
        return await configModel.createConfigurationModel(model, options);
    };

    Configurationmodel.pathConfigurationModel = async (model, options) => {
        return await configModel.upsertConfigurationModel(model, options, false);
    };

    Configurationmodel.upsertConfigurationModel = async (model, options) => {
        return await configModel.upsertConfigurationModel(model, options, true);
    };

    Configurationmodel.deleteModel = async (id, options) => {
        return await configModel.deleteModel(id, options);
    };

    Configurationmodel.addRule = async (modelId, rule, options) => {
        return await configModel.addRule(modelId, rule, options);
    };

    Configurationmodel.removeRule = async (modelId, ruleId, options) => {
        return await configModel.removeRule(modelId, ruleId, options);
    };

    Configurationmodel.modifyRule = async (modelId, rule, options) => {
        return await configModel.modifyRule(modelId, rule, options);
    };

    Configurationmodel.modifyModelOptions = async (modelId, modelOptions, options) => {
        return await configModel.modifyModelOptions(modelId, modelOptions, options);
    };

    Configurationmodel.addRestriction = async (modelId, restriction, options) => {
        return await configModel.addRestriction(modelId, restriction, options);
    };

    Configurationmodel.removeRestriction = async (modelId, restriction, options) => {
        return await configModel.removeRestriction(modelId, restriction, options);
    };

    // ====================================================
    // ================ Remote methods ====================
    // ====================================================

    Configurationmodel.remoteMethod('findWithPermissions', {
        http: {verb: 'GET', status: 200, path: '/'},
        accepts: [
            {arg: 'filter', type: 'object'},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Find all instances of the model matched by filter from the data source.',
        returns: {arg: 'rule', type: 'configurationModel', root: true},
    });

    Configurationmodel.remoteMethod('pathConfigurationModel', {
        http: {verb: 'PATCH', status: 200, path: '/'},
        accepts: [
            {arg: 'model', type: 'configurationModel', http: {source: 'body'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Patch an existing model instance or insert a new one into the data source.',
        returns: {arg: 'rule', type: 'configurationModel', root: true},
    });

    Configurationmodel.remoteMethod('upsertConfigurationModel', {
        http: {verb: 'PUT', status: 201, path: '/'},
        accepts: [
            {arg: 'model', type: 'configurationModel', http: {source: 'body'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Replace an existing model instance or insert a new one into the data source.',
        returns: {arg: 'rule', type: 'configurationModel', root: true},
    });

    Configurationmodel.remoteMethod('createConfigurationModel', {
        http: {verb: 'POST', status: 200, path: '/'},
        accepts: [
            {arg: 'model', type: 'configurationModel', http: {source: 'body'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Create a new instance of the model and persist it into the data source.',
        returns: {arg: 'rule', type: 'configurationModel', root: true},
    });

    Configurationmodel.remoteMethod('deleteModel', {
        http: {verb: 'DELETE', status: 204, path: '/:id'},
        accepts: [
            {arg: 'id', type: 'string', http: {source: 'path'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Delete a model instance by {{id}} from the data source',
    });

    Configurationmodel.remoteMethod('addRule', {
        http: {path: '/:id/rule', status: 201, verb: 'POST'},
        accepts: [
            {arg: 'id', type: 'string', required: true, http: {source: 'path'}},
            {arg: 'rule', type: 'rule', required: true,
                http: {source: 'body'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Creates validation rule for given configuration model',
        returns: {arg: 'rule', type: 'rule', root: true},
    });

    Configurationmodel.remoteMethod('removeRule', {
        http: {path: '/:id/rule', status: 200, verb: 'DELETE'},
        accepts: [
            {arg: 'id', type: 'string', required: true, http: {source: 'path'}},
            {arg: 'ruleId', type: 'string', required: true,
                http: {source: 'query'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Removes validation rule from given configuration model',
    });

    Configurationmodel.remoteMethod('modifyRule', {
        http: {path: '/:id/rule', status: 200, verb: 'PATCH'},
        accepts: [
            {arg: 'id', type: 'string', required: true, http: {source: 'path'}},
            {arg: 'rule', type: 'rule', required: true,
                http: {source: 'body'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Updates validation rule from given configuration model',
        returns: {arg: 'rule', type: 'rule', root: true},
    });

    Configurationmodel.remoteMethod('modifyModelOptions', {
        http: {path: '/:id/options', status: 200, verb: 'PATCH'},
        accepts: [
            {arg: 'id', type: 'string', required: true, http: {source: 'path'}},
            {arg: 'modelOptions', type: 'modelOptions', required: true,
                http: {source: 'body'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        returns: {arg: 'variable', type: 'modelOptions', root: true},
        description: 'Updates given configuration model options',
    });

    Configurationmodel.remoteMethod('addRestriction', {
        http: {path: '/:id/restriction', status: 200, verb: 'POST'},
        accepts: [
            {arg: 'id', type: 'string', required: true, http: {source: 'path'}},
            {arg: 'restriction', type: 'string', required: true,
                http: {source: 'query'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Adds resriction to given configuration model',
    });

    Configurationmodel.remoteMethod('removeRestriction', {
        http: {path: '/:id/restriction', status: 200, verb: 'DELETE'},
        accepts: [
            {arg: 'id', type: 'string', required: true, http: {source: 'path'}},
            {arg: 'restriction', type: 'string', required: true,
                http: {source: 'query'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Removes resriction from given configuration model',
    });
};
