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
const {authenticate} = require('ldap-authentication');
const ConfigurationClass = require('./configuration.js');
const random = require('random');

module.exports = class Member {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'member';
        this.logger = null;

        this.app = app;

        this.ldapClient = null;
        this.ldapServer = null;
        this.ldapInitialized = false;

        this.rolesCache = [];
        this.groupCache = [];

        this.userRolesCache = new Map();

        this.cacheEnabled = true;
    }

    /**
     * logger
     *
     * @param {string} severity Severity
     * @param {string} method current method
     * @param {string} message Message to log
     * @param {string} obj object to log
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
     * creates local cache
     *
     */
    async createCache() {
        const Role = this.app.models.Role;
        const Group = this.app.models.group;

        this.groupCache = await Group.find();
        this.rolesCache = await Role.find();

        const changeStream = this.app.dataSources['mongoDB'].connector.collection('Role').watch();
        changeStream.on('error', (err) => {
            if (err.code === 40573) {
                this.cacheEnabled = false;
            }
        });
        changeStream.on('change', async () => {
            this.userRolesCache.clear();
            this.rolesCache = await Role.find();
        });

        const groupChangeStream = this.app.dataSources['mongoDB'].connector.collection('group').watch();
        groupChangeStream.on('error', (err) => {
            if (err.code === 40573) {
                this.cacheEnabled = false;
            }
        });
        groupChangeStream.on('change', async () => {
            this.userRolesCache.clear();
            this.groupCache = await Group.find();
        });

        this.app.set('MemberInstance', this);
    }

    /**
     * get roles from cache or DB if not dataset
     *
     */
    async getRolesFromCache() {
        if (this.cacheEnabled) {
            return this.rolesCache;
        } else {
            return await this.app.models.Role.find();
        }
    }

    /**
     * get groups from cache or DB if not dataset
     *
     */
    async getGroupsFromCache() {
        if (this.cacheEnabled) {
            return this.groupCache;
        } else {
            return await this.app.models.group.find();
        }
    }

    /**
     * initializeLDAP
     *
     * @return {LdapClient} ldapClient object
     */
    async initializeLDAP() {
        this.log('debug', 'initializeLDAP', 'STARTED');

        const Connection = this.app.models.connection;
        const server = await Connection.findOne({
            where: {
                system: 'LDAP',
                enabled: true,
            },
        });

        this.ldapInitialized = true;

        if (server !== null & server !== undefined) {
            this.log('debug', 'initializeLDAP', 'FINISHED');
            this.ldapServer = server;
        } else {
            this.log('debug', 'initializeLDAP', 'FINISHED');
            return null;
        }
    }


    /**
     * Sleep function for invalid login
     *
     * @param {int} ms
     */
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * login
     *
     * @param {object} credentials Object with username and password
     * @param {string} include Optionally set it to "user" to include the user info
     * @param {number} ttl Optional token ttl
     *
     * @return {object} access token details (Optionally user data)
     */
    async login(credentials, include, ttl = 86400) {
        this.log('debug', 'login', 'STARTED');

        const User = this.app.models.member;

        await this.initializeLDAP();

        const user = await User.findOne({
            where: {
                username: credentials.username,
                type: 'local',
            },
        });

        if (this.ldapServer && credentials.username !== 'admin' && !user) {
            try {
                const configuration = new ConfigurationClass(this.app);
                await configuration.createCrypt();

                const password = configuration.decryptPassword(this.ldapServer.bindCredentials);

                const auth = await authenticate({
                    ldapOpts: {url: this.ldapServer.url},
                    adminDn: this.ldapServer.bindDN,
                    adminPassword: password,
                    username: credentials.username,
                    userPassword: credentials.password,
                    userSearchBase: this.ldapServer.searchBase,
                    usernameAttribute: this.ldapServer.usernameAttribute,
                });

                credentials.dn = auth.dn;

                if (this.ldapServer.displayAttribute !== undefined) {
                    credentials.display = auth[this.ldapServer.displayAttribute];
                }
            } catch (_e) {
                this.log('debug', 'login', 'FINISHED');
                throw new HttpErrors.Unauthorized('Invalid username or password');
            }

            let user = await User.findOne({
                where: {
                    username: `${credentials.dn}:${credentials.username}`,
                    type: 'ldap',
                    dn: credentials.dn,
                },
            });

            if (user === null) {
                user = await User.create({
                    username: `${credentials.dn}:${credentials.username}`,
                    type: 'ldap',
                    newUser: false,
                    dn: credentials.dn,
                    groups: this.ldapServer.defaultGroups ? this.ldapServer.defaultGroups : [],
                    display: credentials.display,
                    technicalUser: false,
                });
            }

            if (user.display !== credentials.display) {
                user.display = credentials.display;
                user.save();
            }

            const ldapUser = await user.createAccessToken(ttl);

            const output = {
                ttl: ldapUser.ttl,
                userId: ldapUser.userId,
                created: ldapUser.created,
                id: this.app.get('ConfigurationInstance').encryptPassword(ldapUser.id),
            };

            if (include === 'user') {
                output.user = {
                    groups: user.groups,
                    newUser: false,
                    type: user.type,
                    display: credentials.display,
                };
            }

            const AccessToken = this.app.models.AccessToken;
            const tokens = await AccessToken.find({
                where: {
                    userId: ldapUser.userId,
                },
            });

            tokens.forEach((el) => {
                el.validate((_err, isValid) => {
                    if (!isValid) {
                        el.destroy();
                    }
                });
            });

            this.log('info', 'login', `User '${credentials.username}' logged in`);
            this.log('debug', 'login', 'FINISHED');

            return output;
        } else if (user) {
            const member = await User.findOne({
                where: {
                    username: credentials.username,
                    type: 'local',
                },
            });

            if (member) {
                if (member.technicalUser) {
                    this.log('debug', 'login', 'FINISHED');
                    throw new HttpErrors.Unauthorized('User is technical only');
                }

                if (member.type === 'ldap') {
                    this.log('debug', 'login', 'FINISHED');
                    throw new HttpErrors.ServiceUnavailable('No LDAP connection');
                }
            }

            credentials.ttl = ttl;

            let user = null;

            try {
                user = await User.login(credentials, include);
            } catch (e) {
                if (e.code !== undefined && e.code === 'LOGIN_FAILED') {
                    await this.sleep(random.int(500, 1000));
                }
                throw e;
            }

            const output = {
                ttl: user.ttl,
                userId: user.userId,
                created: user.created,
                id: this.app.get('ConfigurationInstance').encryptPassword(user.id),
            };

            if (include === 'user') {
                output.user = {
                    groups: member.groups,
                    newUser: member.newUser,
                    type: member.type,
                    technicalUser: member.technicalUser,
                };
            }

            const AccessToken = this.app.models.AccessToken;
            const tokens = await AccessToken.find({
                where: {
                    userId: user.userId,
                },
            });

            tokens.forEach((el) => {
                el.validate((_err, isValid) => {
                    if (!isValid) {
                        el.destroy();
                    }
                });
            });

            this.log('info', 'login', `User ${credentials.username} logged in`);
            this.log('debug', 'login', 'FINISHED');

            return output;
        } else {
            this.log('debug', 'login', 'FINISHED');
            throw new HttpErrors.Unauthorized('Invalid username or password');
        }
    }

    /**
     * Login using basic auth
     *
     * @param {object} context request context
     *
     * @return {object} access token details (Optionally user data)
     */
    async basicAuthLogin(context) {
        this.log('debug', 'basicAuthLogin', 'STARTED');

        const headers = context.req.headers;
        if (headers.authorization !== undefined) {
            if (headers.authorization.startsWith('Basic ')) {
                const base = headers.authorization.replace('Basic ', '');
                const buff = Buffer.from(base, 'base64');
                const text = buff.toString('utf-8');

                const split = text.split(':');

                if (split.length !== 2) {
                    return false;
                } else {
                    const username = split[0];
                    const pass = split[1];

                    try {
                        const token = await this.login({
                            username: username,
                            password: pass,
                        }, undefined, 5);

                        if (token !== undefined && token !== null) {
                            if (token.id !== undefined && token.id !== null) {
                                return token;
                            }
                        }
                    } catch (e) {
                        return null;
                    }
                }
            }
        }

        this.log('debug', 'basicAuthLogin', 'FINISHED');

        return null;
    }

    /**
     * changeUserPassword
     *
     * @param {object} password New password
     * @param {string} userId User Id
     */
    async changeUserPassword(password, userId) {
        this.log('debug', 'changeUserPassword', 'STARTED');

        const Member = this.app.models.member;

        await Member.setPassword(userId, password);
        Member.updateAll({
            id: userId,
        }, {
            newUser: false,
        });

        this.log('debug', 'changeUserPassword', 'FINISHED');
    }

    /**
     * getUserDetails
     *
     * @param {string} userId User Id
     *
     * @return { object } returns user data
     */
    async getUserDetails(userId) {
        this.log('debug', 'getUserDetails', 'STARTED');

        const Member = this.app.models.member;

        const user = await Member.findOne({
            where: {
                id: userId,
            },
        });

        let data = null;

        if (user !== null) {
            data = {
                username: user.username,
                technicalUser: user.technicalUser,
                type: user.type,
                display: user.display,
            };
        }

        this.log('debug', 'getUserDetails', 'FINISHED');

        return data;
    }


    /**
     * getUserRoles
     *
     * @param {string} userId User Id
     *
     * @return { [Role] } returns all user roles
     */
    async getUserRoles(userId) {
        this.log('debug', 'getUserRoles', 'STARTED');

        const Member = this.app.models.member;

        if (!userId) {
            return [];
        }

        let user = null;

        if (this.userRolesCache.has(userId.toString()) && this.cacheEnabled) {
            this.log('debug', 'getUserRoles', 'FINISHED');
            return this.userRolesCache.get(userId.toString());
        } else {
            user = await Member.findOne({
                where: {
                    id: userId,
                },
            });
        }

        if (!user) {
            return [];
        }

        const groupCache = await this.getGroupsFromCache();

        const groups = groupCache.filter((el) => {
            if (user.groups) {
                return user.groups.includes(el.name);
            }
        });

        const roles = new Set();
        groups.forEach((group) => {
            if (group.roles !== undefined) {
                group.roles.forEach((role) => {
                    roles.add(role);
                });
            }
        });

        if (user && (user.username === 'admin' || roles.has('admin'))) {
            const rolesCache = await this.getRolesFromCache();
            rolesCache.forEach((role) => {
                roles.add(role.name);
            });
        }

        if (this.cacheEnabled) {
            this.userRolesCache.set(userId.toString(), Array.from(roles));
        }

        this.log('debug', 'getUserRoles', 'FINISHED');

        return Array.from(roles);
    }

    /**
     * getUserGroups
     *
     * @param {string} userId User Id
     *
     * @return { [string] } returns all user roles
     */
    async getUserGroups(userId) {
        this.log('debug', 'getUserGroups', 'STARTED');

        const Member = this.app.models.member;

        const user = await Member.findOne({
            where: {
                id: userId,
            },
        });

        this.log('debug', 'getUserGroups', 'FINISHED');

        return user.groups;
    }

    /**
     * addUserGroup
     *
     * @param {string} userId User Id
     * @param {string} groupName Group name
     *
     * @return { [string] } returns all user grups
     */
    async addUserGroup(userId, groupName) {
        this.log('debug', 'addUserGroup', 'STARTED');

        const Member = this.app.models.member;
        const Group = this.app.models.group;

        const user = await Member.findOne({
            where: {
                id: userId,
            },
        });

        if (user === undefined) {
            throw new HttpErrors.BadRequest('Invalid user');
        }

        if (user.groups.includes(groupName)) {
            return user.groups;
        }

        const group = await Group.findOne({
            where: {
                name: groupName,
            },
        });

        if (group === null) {
            throw new HttpErrors.BadRequest('Invalid group');
        }

        user.groups.push(groupName);

        await user.save();

        this.log('debug', 'addUserGroup', 'FINISHED');

        return user.groups;
    }

    /**
     * removeUserGroup
     *
     * @param {string} userId User Id
     * @param {string} groupName Group name
     *
     * @return { [string] } returns all user grups
     */
    async removeUserGroup(userId, groupName) {
        this.log('debug', 'removeUserGroup', 'STARTED');

        const Member = this.app.models.member;

        const user = await Member.findOne({
            where: {
                id: userId,
            },
        });

        if (!user.groups.includes(groupName)) {
            return user.groups;
        }

        user.groups = user.groups.filter((group) => {
            return group !== groupName;
        });

        await user.save();

        this.log('debug', 'removeUserGroup', 'FINISHED');

        return user.groups;
    }

    /**
     * setAsTechnicalUser
     *
     * Sets user as a technical user, which means, that it has non time limited token
     *
     * @param {string} userId User Id
     * @param {boolean} isTechUser if user is tech or not
     *
     * @return {Member} returns user
     */
    async setAsTechnicalUser(userId, isTechUser) {
        this.log('debug', 'setAsTechnicalUser', 'STARTED');

        const Member = this.app.models.member;
        const AccessToken = this.app.models.AccessToken;

        const user = await Member.findOne({
            where: {
                id: userId,
            },
        });

        if (user === undefined || user === null) {
            throw new HttpErrors.BadRequest('Invalid user');
        }

        user.technicalUser = isTechUser;

        await user.save();

        await AccessToken.destroyAll({
            userId: userId,
        });

        if (isTechUser) {
            await user.createAccessToken(-1);
        }

        this.log('debug', 'setAsTechnicalUser', 'FINISHED');

        return user;
    }

    /**
     * getTechnicalUserToken
     *
     * @param {string} userId User Id
     *
     * @return {string} returns tokenId
     */
    async getTechnicalUserToken(userId) {
        this.log('debug', 'getTechnicalUserToken', 'STARTED');

        const Member = this.app.models.member;
        const AccessToken = this.app.models.AccessToken;

        const user = await Member.findOne({
            where: {
                id: userId,
                technicalUser: true,
            },
        });

        if (user === undefined || user === null) {
            throw new HttpErrors.BadRequest('Invalid user');
        }

        const token = await AccessToken.findOne({
            where: {
                userId: userId,
            },
        });

        if (token === undefined || token === null) {
            throw new HttpErrors.NotFound('Token not found');
        }

        this.log('debug', 'getTechnicalUserToken', 'FINISHED');

        return token.id;
    }

    /**
     * getUserConstantVariablePermission
     *
     * @param {string} userId User Id
     * @param {string} base base
     * @param {string} model model
     *
     * @return {string} returns permission
     */
    async getUserConstantVariablePermission(userId, base, model) {
        this.log('debug', 'getUserConstantVariablePermission', 'STARTED');

        let permission = 'view';

        const userRoles = await this.getUserRoles(userId);
        const roles = await this.getRolesFromCache();

        let found = userRoles.find( (el) => {
            return el === 'constantVariable.modify';
        });

        if (found) {
            permission = 'modify';
        }

        found = roles.find( (el) => {
            return el.name === `constantVariable.${base}.${model}.modify`;
        });

        if (found) {
            const perm = userRoles.find( (el) => {
                return el === `constantVariable.${base}.${model}.modify`;
            });

            if (perm) {
                permission = 'modify';
            } else {
                permission = 'view';
            }
        }

        this.log('debug', 'getTechnicalUserToken', 'FINISHED');

        return permission;
    }
};
