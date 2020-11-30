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

const ConfigModel = require('./impl/baseConfiguration.js');

let configModel = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted) {
        configModel = new ConfigModel(main.app);
    } else {
        setTimeout( () => {
            initiate(main);
        }, 200);
    }
};

module.exports = function(Baseconfiguration) {
    initiate(Baseconfiguration);

    Baseconfiguration.validatesUniquenessOf('name', {message: 'Name is not unique'});

    Baseconfiguration.disableRemoteMethodByName('create'); // POST

    Baseconfiguration.disableRemoteMethodByName('deleteById');
    Baseconfiguration.disableRemoteMethodByName('createChangeStream');

    Baseconfiguration.createBaseConfiguration = async (model) => {
        return await configModel.createBaseConfiguration(model);
    };

    Baseconfiguration.changeSequence = async (model) => {
        return await configModel.changeSequence(model);
    };

    Baseconfiguration.deleteBaseConfiguration = async (id) => {
        return await configModel.deleteBaseConfiguration(id);
    };

    // ====================================================
    // ================ Remote methods ====================
    // ====================================================

    Baseconfiguration.remoteMethod('createBaseConfiguration', {
        http: {verb: 'POST', status: 200, path: '/'},
        accepts: [
            {arg: 'model', type: 'baseConfiguration', http: {source: 'body'}},
        ],
        description: 'Create a new instance of the model and persist it into the data source.',
        returns: {arg: 'model', type: 'baseConfiguration', root: true},
    });

    Baseconfiguration.remoteMethod('changeSequence', {
        http: {verb: 'POST', status: 204, path: '/changeSequence'},
        accepts: [
            {arg: 'model', type: 'baseConfiguration', http: {source: 'body'}},
        ],
        description: 'Changes base model sequences',
    });

    Baseconfiguration.remoteMethod('deleteBaseConfiguration', {
        http: {verb: 'DELETE', status: 200, path: '/:id'},
        accepts: [
            {arg: 'id', type: 'string', http: {source: 'path'}},
        ],
        description: 'Delete a model instance by {{id}} from the data source.',
    });
};
