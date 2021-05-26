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

'use strict';

const ConfigModel = require('./impl/restConfiguration.js');

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

module.exports = function(Restconfiguration) {
    initiate(Restconfiguration);

    Restconfiguration.validatesUniquenessOf('url', {message: 'URL is not unique'});
    Restconfiguration.validatesInclusionOf('returnType',
        {message: 'returnType can be "json", "xml" or "plain text"', in: ['json', 'xml', 'plain text']});

    Restconfiguration.disableRemoteMethodByName('create'); // POST

    Restconfiguration.disableRemoteMethodByName('deleteById');
    Restconfiguration.disableRemoteMethodByName('createChangeStream');

    Restconfiguration.createRestconfiguration = async (model) => {
        return await configModel.createRestConfiguration(model);
    };

    Restconfiguration.changeSequence = async (model) => {
        return await configModel.changeSequence(model);
    };

    Restconfiguration.deleteRestconfiguration = async (id) => {
        return await configModel.deleteRestConfiguration(id);
    };

    // ====================================================
    // ================ Remote methods ====================
    // ====================================================

    Restconfiguration.remoteMethod('createRestconfiguration', {
        http: {verb: 'POST', status: 200, path: '/'},
        accepts: [
            {arg: 'model', type: 'restConfiguration', http: {source: 'body'}},
        ],
        description: 'Create a new instance of the model and persist it into the data source.',
        returns: {arg: 'model', type: 'restConfiguration', root: true},
    });

    Restconfiguration.remoteMethod('changeSequence', {
        http: {verb: 'POST', status: 200, path: '/changeSequence'},
        accepts: [
            {arg: 'model', type: 'restConfiguration', http: {source: 'body'}},
        ],
        description: 'Changes rest configuration sequences',
    });

    Restconfiguration.remoteMethod('deleteRestconfiguration', {
        http: {verb: 'DELETE', status: 200, path: '/:id'},
        accepts: [
            {arg: 'id', type: 'string', http: {source: 'path'}},
        ],
        description: 'Delete a model instance by {{id}} from the data source.',
    });
};
