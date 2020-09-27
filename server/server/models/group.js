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

const GroupModel = require('./impl/group');

let group = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted) {
        if (main.app.dataSources['mongoDB'] === undefined) {
            setTimeout( () => {
                initiate(main);
            }, 200);
        } else {
            if (main.app.dataSources['mongoDB'].connected) {
                group = new GroupModel(main.app);
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

module.exports = function(Group) {
    initiate(Group);

    Group.disableRemoteMethodByName('createChangeStream');
    Group.disableRemoteMethodByName('exists');
    Group.disableRemoteMethodByName('update');
    Group.disableRemoteMethodByName('upsertWithWhere');
    Group.disableRemoteMethodByName('deleteById');

    Group.disableRemoteMethodByName('upsert');
    Group.disableRemoteMethodByName('replaceOrCreate');
    Group.disableRemoteMethodByName('replaceById');
    Group.disableRemoteMethodByName('prototype.updateAttributes');

    Group.validatesUniquenessOf('name', {
        message: 'Group name must be unique',
    });

    Group.deleteGroup = async (id) => {
        return await group.removeGroup(id);
    };

    Group.addGroupRole = async (id, role) => {
        return await group.addGroupRole(id, role);
    };

    Group.removeGroupRole = async (id, role) => {
        return await group.removeGroupRole(id, role);
    };

    // ====================================================
    // ================ Remote methods ====================
    // ====================================================

    Group.remoteMethod('deleteGroup', {
        http: {verb: 'DELETE', status: 204, path: '/:id'},
        accepts: [
            {arg: 'id', type: 'string', http: {source: 'path'}},
        ],
        description: 'Delete a model instance by {{id}} from the data source',
    });

    Group.remoteMethod('addGroupRole', {
        http: {verb: 'POST', status: 204, path: '/:id/role'},
        accepts: [
            {arg: 'id', type: 'string', http: {source: 'path'}},
            {arg: 'role', type: 'string', required: true, http: {source: 'query'}},
        ],
        description: 'Adds role to given group.',
    });

    Group.remoteMethod('removeGroupRole', {
        http: {verb: 'DELETE', status: 204, path: '/:id/role'},
        accepts: [
            {arg: 'id', type: 'string', http: {source: 'path'}},
            {arg: 'role', type: 'string', required: true, http: {source: 'query'}},
        ],
        description: 'Removes role from given group.',
    });
};
