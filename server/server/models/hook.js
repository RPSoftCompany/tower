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

const HookModel = require('./impl/hook.js');

let hookObject = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted) {
        if (main.app.dataSources['mongoDB'] === undefined) {
            setTimeout( () => {
                initiate(main);
            }, 200);
        } else {
            if (main.app.dataSources['mongoDB'].connected) {
                hookObject = new HookModel(main.app);
                main.app.hookSingleton = hookObject;
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

module.exports = function(Hook) {
    initiate(Hook);

    Hook.disableRemoteMethodByName('create'); // POST
    Hook.disableRemoteMethodByName('upsert'); // PATCH
    Hook.disableRemoteMethodByName('replaceOrCreate'); // PUT

    Hook.disableRemoteMethodByName('replaceById');
    Hook.disableRemoteMethodByName('deleteById');
    Hook.disableRemoteMethodByName('prototype.updateAttributes');

    Hook.disableRemoteMethodByName('update');
    Hook.disableRemoteMethodByName('upsertWithWhere');

    Hook.disableRemoteMethodByName('createChangeStream');

    Hook.addHook = async (id, hook) => {
        await hookObject.addHookObject(hook, id);
    };

    Hook.removeHook = async (id, fk) => {
        await hookObject.removeHookObject(fk, id);
    };

    Hook.modifyHook = async (id, hook) => {
        await hookObject.modifyHookObject(hook, id);
    };

    // ====================================================
    // ================ Remote methods ====================
    // ====================================================
    Hook.remoteMethod('addHook', {
        http: {verb: 'POST', status: 200, path: '/:id/hookObject'},
        accepts: [
            {arg: 'id', type: 'string', http: {source: 'path'}},
            {arg: 'hook', type: 'hookObject', http: {source: 'body'}},
        ],
        description: 'Create a new instance of hookObject in given instance of Hook model',
        returns: {arg: 'model', type: 'hookObject', root: true},
    });
    Hook.remoteMethod('modifyHook', {
        http: {verb: 'PUT', status: 200, path: '/:id/hookObject'},
        accepts: [
            {arg: 'id', type: 'string', http: {source: 'path'}},
            {arg: 'hook', type: 'hookObject', http: {source: 'body'}},
        ],
        description: 'Replace a hookObject instance in hooks with id {{id}}',
    });
    Hook.remoteMethod('removeHook', {
        http: {verb: 'DELETE', status: 200, path: '/:id/hookObject/:fk'},
        accepts: [
            {arg: 'id', type: 'string', http: {source: 'path'}},
            {arg: 'fk', type: 'string', http: {source: 'path'}},
        ],
        description: 'Delete a model instance by {{fk}} from hook with id {{id}}',
    });
};
