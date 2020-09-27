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

const ConstantVariableModel = require('./impl/constantVariable');

let constantVariable = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted
            && main.app.hookSingleton !== undefined
            && main.app.dataSources['mongoDB'] !== undefined
            && main.app.dataSources['mongoDB'].connected) {
        constantVariable = new ConstantVariableModel(main.app);

        main.app.hookSingleton.createHook('variableChanged', 'ConstantVariable', 'description');
    } else {
        setTimeout( () => {
            initiate(main);
        }, 200);
    }
};

module.exports = function(Constantvariable) {
    initiate(Constantvariable);

    Constantvariable.disableRemoteMethodByName('create'); // POST
    Constantvariable.disableRemoteMethodByName('find'); // GET
    Constantvariable.disableRemoteMethodByName('upsert'); // PATCH
    Constantvariable.disableRemoteMethodByName('replaceOrCreate'); // PUT

    Constantvariable.disableRemoteMethodByName('findById');

    Constantvariable.disableRemoteMethodByName('replaceById');
    Constantvariable.disableRemoteMethodByName('deleteById');
    Constantvariable.disableRemoteMethodByName('prototype.updateAttributes');

    Constantvariable.disableRemoteMethodByName('findOne');
    Constantvariable.disableRemoteMethodByName('update');
    Constantvariable.disableRemoteMethodByName('upsertWithWhere');

    Constantvariable.disableRemoteMethodByName('createChangeStream');

    Constantvariable.createConstantVariable = async (model, options) => {
        return await constantVariable.createConstantVariable(model, options);
    };

    Constantvariable.findWithPermissions = async (filter, options) => {
        return await constantVariable.findWithPermissions(filter, options);
    };

    Constantvariable.findLatest = async (filter, options) => {
        return await constantVariable.findLatest(filter, options);
    };

    Constantvariable.findForDate = async (filter, date, options) => {
        return await constantVariable.findForDate(filter, date, options);
    };

    // ====================================================
    // ================ Remote methods ====================
    // ====================================================

    Constantvariable.remoteMethod('createConstantVariable', {
        http: {verb: 'POST', status: 200, path: '/'},
        accepts: [
            {arg: 'model', type: 'constantVariable', http: {source: 'body'}},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Create a new instance of the model and persist it into the data source.',
        returns: {arg: 'model', type: 'constantVariable', root: true},
    });

    Constantvariable.remoteMethod('findWithPermissions', {
        http: {verb: 'GET', status: 200, path: '/'},
        accepts: [
            {arg: 'filter', type: 'object'},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Find all instances of the model matched by filter from the data source.',
        returns: {arg: 'model', type: 'constantVariable', root: true},
    });

    Constantvariable.remoteMethod('findLatest', {
        http: {verb: 'GET', status: 200, path: '/findLatest'},
        accepts: [
            {arg: 'filter', type: 'object', required: true},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Find latest variables for given filter (models).',
        returns: {arg: 'model', type: 'constantVariable', root: true},
    });

    Constantvariable.remoteMethod('findForDate', {
        http: {verb: 'GET', status: 200, path: '/findForDate'},
        accepts: [
            {arg: 'filter', type: 'object', required: true},
            {arg: 'date', type: 'Date', required: true},
            {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        description: 'Find variables for given filter (models) and date',
        returns: {arg: 'model', type: 'constantVariable', root: true},
    });
};
