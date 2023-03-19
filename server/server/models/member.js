/*
 * Copyright RPSoft 2019,2023. All Rights Reserved.
 * This file is part of RPSoft Tower.
 *
 * Tower is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tower is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
 */

'use strict';

const HttpErrors = require('http-errors');
const MemberClass = require('./impl/member.js');

let member = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted) {
        if (main.app.dataSources['mongoDB'] === undefined) {
            setTimeout(() => {
                initiate(main);
            }, 200);
        } else {
            if (main.app.dataSources['mongoDB'].connected && main.app.nonSafe !== undefined) {
                member = new MemberClass(main.app);
                member.createCache();
            } else {
                setTimeout(() => {
                    initiate(main);
                }, 200);
            }
        }
    } else {
        setTimeout(() => {
            initiate(main);
        }, 200);
    }
};

module.exports = (Member) => {
    initiate(Member);

    Member.afterRemote('*', (context, unused, next) => {
        const audit = Member.app.get('AuditInstance');
        audit.logAudit(context, 'Member');
        next();
    });

    Member.afterRemoteError('*', (context, next) => {
        const audit = Member.app.get('AuditInstance');
        audit.logError(context, 'Member');
        next();
    });

    Member.disableRemoteMethodByName('replaceOrCreate');
    Member.disableRemoteMethodByName('update');
    Member.disableRemoteMethodByName('upsertWithWhere');
    Member.disableRemoteMethodByName('confirm');
    Member.disableRemoteMethodByName('prototype.verify');
    Member.disableRemoteMethodByName('createChangeStream');
    Member.disableRemoteMethodByName('changePassword');
    Member.disableRemoteMethodByName('count');

    Member.disableRemoteMethodByName('login');

    Member.loginUser = async (credentials, include) => {
        return await member.login(credentials, include);
    };

    Member.changeUserPassword = async (options, body) => {
        const userId = options.accessToken.userId;
        const newPass = body.newPassword;

        return await member.changeUserPassword(newPass, userId);
    };

    Member.getUserRoles = async (options) => {
        if (!options.accessToken) {
            throw new HttpErrors.Unauthorized('Unauthorized');
        }

        const userId = options.accessToken.userId;

        return await member.getUserRoles(userId);
    };

    Member.getUserDetails = async (userId) => {
        return await member.getUserDetails(userId);
    };

    Member.getUserGroups = async (userId) => {
        if (userId === undefined || userId === null || userId === '') {
            throw new HttpErrors.BadRequest('Invalid user id');
        }

        return await member.getUserGroups(userId);
    };

    Member.addUserGroup = async (userId, group) => {
        if (userId === undefined || userId === null || userId === '') {
            throw new HttpErrors.BadRequest('Invalid user id');
        }

        return await member.addUserGroup(userId, group);
    };

    Member.removeUserGroup = async (userId, group) => {
        if (userId === undefined || userId === null || userId === '') {
            throw new HttpErrors.BadRequest('Invalid user');
        }

        return await member.removeUserGroup(userId, group);
    };

    Member.setAsTechnicalUser = async (isTechUser, userId) => {
        return await member.setAsTechnicalUser(userId, isTechUser);
    };

    Member.getTechnicalUserToken = async (userId) => {
        return await member.getTechnicalUserToken(userId);
    };

    Member.getUserConstantVariablePermission = async (options, base, model) => {
        if (!options.accessToken) {
            throw new HttpErrors.Unauthorized('Unauthorized');
        }

        const userId = options.accessToken.userId;

        return await member.getUserConstantVariablePermission(userId, base, model);
    };

    // ====================================================
    // ================ Remote methods ====================
    // ====================================================

    Member.remoteMethod('loginUser', {
        http: {verb: 'POST', path: '/login'},
        accepts: [{
            arg: 'credentials',
            type: 'object',
            http: {source: 'body'},
            required: true,
        },
        {
            arg: 'include',
            type: 'string',
            http: {source: 'query'},
        },
        ],
        returns: {
            arg: 'obj',
            type: 'object',
            root: true,
        },
        description: 'Login a user with username/email and password.',
    });

    Member.remoteMethod('changeUserPassword', {
        accepts: [{
            arg: 'options',
            type: 'object',
            http: 'optionsFromRequest',
        },
        {
            arg: 'body',
            type: 'object',
            http: {
                source: 'body',
            },
        },
        ],
        description: 'Changes user password',
    });

    Member.remoteMethod('getUserRoles', {
        http: {verb: 'GET', status: 200, path: '/getUserRoles'},
        accepts: {
            arg: 'options',
            type: 'object',
            http: 'optionsFromRequest',
        },
        returns: {
            arg: 'roles',
            type: 'Array',
            root: true,
        },
        description: 'Returns all user roles',
    });

    Member.remoteMethod('getUserDetails', {
        accepts: {
            arg: 'userId',
            type: 'string',
            http: {source: 'query'},
        },
        http: {
            verb: 'get',
        },
        description: 'Returns all user details',
        returns: {
            arg: 'user',
            type: 'object',
            root: true,
        },
    });

    Member.remoteMethod('getUserGroups', {
        accepts: {
            arg: 'userId',
            type: 'string',
            required: 'true',
            http: {source: 'query'},
        },
        description: 'Returns all groups assigned to user',
        returns: {
            arg: 'groups',
            type: 'Array',
        },
    });

    Member.remoteMethod('addUserGroup', {
        accepts: [
            {
                arg: 'userId',
                type: 'string',
                required: true,
                http: {source: 'query'},
            },
            {
                arg: 'group',
                type: 'string',
                required: true,
                http: {source: 'query'},
            },
        ],
        returns: {
            arg: 'groups',
            type: 'Array',
            root: true,
        },
        description: 'Adds group to user',
    });

    Member.remoteMethod('removeUserGroup', {
        accepts: [
            {
                arg: 'userId',
                type: 'string',
                required: true,
                http: {source: 'query'},
            },
            {
                arg: 'group',
                type: 'string',
                required: true,
                http: {source: 'query'},
            },
        ],
        returns: {
            arg: 'groups',
            type: 'Array',
            root: true,
        },
        description: 'Removes group from user',
    });

    Member.remoteMethod('setAsTechnicalUser', {
        accepts: [{
            arg: 'isTechUser',
            type: 'boolean',
            required: true,
            http: {source: 'query'},
        },
        {
            arg: 'userId',
            type: 'string',
            required: true,
            http: {source: 'query'},
        },
        ],
        description: 'Sets user technical user value',
        returns: {
            arg: 'accessToken',
            type: 'string',
            root: true,
        },
    });

    Member.remoteMethod('getTechnicalUserToken', {
        http: {verb: 'GET', status: 200, path: '/getTechnicalUserToken'},
        accepts:
            {
                arg: 'userId',
                type: 'string',
                required: true,
                http: {source: 'query'},
            },
        description: 'Get technical user token',
        returns: {
            arg: 'accessToken',
            type: 'string',
            root: true,
        },
    });

    Member.remoteMethod('getUserConstantVariablePermission', {
        http: {verb: 'GET', status: 200, path: '/getUserConstantVariablePermission'},
        accepts: [{
            arg: 'options',
            type: 'object',
            http: 'optionsFromRequest',
        }, {
            arg: 'base',
            type: 'string',
            required: true,
            http: {source: 'query'},
        }, {
            arg: 'model',
            type: 'string',
            required: true,
            http: {source: 'query'},
        }],
        description: 'Get user constant variable permission',
        returns: {
            arg: 'permission',
            type: 'string',
            root: true,
        },
    });
};
