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

const ConnectionModel = require('./impl/connection');

let connection = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted) {
        connection = new ConnectionModel(main.app);
    } else {
        setTimeout( () => {
            initiate(main);
        }, 200);
    }
};

module.exports = (Connection) => {
    initiate(Connection);

    Connection.disableRemoteMethodByName('create'); // POST
    Connection.disableRemoteMethodByName('find'); // GET
    Connection.disableRemoteMethodByName('upsert'); // PATCH
    Connection.disableRemoteMethodByName('replaceOrCreate'); // PUT

    Connection.disableRemoteMethodByName('findById');

    Connection.disableRemoteMethodByName('replaceById');
    Connection.disableRemoteMethodByName('deleteById');
    Connection.disableRemoteMethodByName('prototype.updateAttributes');

    Connection.disableRemoteMethodByName('update');
    Connection.disableRemoteMethodByName('upsertWithWhere');

    Connection.disableRemoteMethodByName('count');
    Connection.disableRemoteMethodByName('findOne');

    Connection.disableRemoteMethodByName('createChangeStream');

    Connection.validatesUniquenessOf('system', {
        message: 'System is not unique',
    });

    Connection.testConnection = async (type) => {
        return await connection.testConnection(type);
    };

    Connection.createConnection = async (conn) => {
        return await connection.saveConnection(conn);
    };

    Connection.patchConnection = async (conn) => {
        return await connection.saveConnection(conn);
    };

    Connection.findConnection = async (filter) => {
        return await connection.findConnection(filter);
    };

    // ====================================================
    // ================ Remote methods ====================
    // ====================================================

    Connection.remoteMethod('patchConnection', {
        http: {verb: 'PATCH', status: 200, path: '/'},
        accepts: [
            {arg: 'connection', type: 'connection', http: {source: 'body'}},
        ],
        description: 'Patch an existing model instance or insert a new one into the data source.',
        returns: {arg: 'model', type: 'connection', root: true},
    });

    Connection.remoteMethod('findConnection', {
        http: {verb: 'GET', status: 200, path: '/'},
        accepts: [
            {arg: 'filter', type: 'string', http: {source: 'query'}},
        ],
        description: 'Find all instances of the model matched by filter from the data source.',
        returns: {arg: 'model', type: 'connection', root: true},
    });

    Connection.remoteMethod('testConnection', {
        http: {verb: 'GET', status: 200, path: '/testConnection'},
        accepts: [
            {arg: 'type', type: 'string'},
        ],
        description: 'Tests given connection based on given type.',
        returns: {arg: 'ret', type: 'boolean', root: true},
    });
};
