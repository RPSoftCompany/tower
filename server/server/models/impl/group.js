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

module.exports = class Group {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'group';
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
     * Remove group
     *
     * @param {string} groupId id of group where to add the role
     *
     */
    async removeGroup(groupId) {
        this.log('debug', 'removeGroup', 'STARTED');

        const Group = this.app.models.group;
        const Member = this.app.models.member;

        const group = await Group.findOne({
            where: {
                id: groupId,
            },
        });

        if (group === null) {
            this.log('debug', 'removeGroup', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid group id');
        }

        const groupMembers = await Member.find({
            where: {
                groups: group.name,
            },
        });

        groupMembers.forEach(async (member) => {
            member.groups = member.groups.filter((gr) => {
                return gr !== group.name;
            });

            await member.save();
        });

        await group.destroy();

        this.log('debug', 'removeGroup', 'FINISHED');
    }

    /**
     * Adds role to group
     *
     * @param {string} groupId id of group where to add the role
     * @param {object} role role to add
     *
     */
    async addGroupRole(groupId, role) {
        this.log('debug', 'addGroupRole', 'STARTED');

        const Group = this.app.models.group;
        const Role = this.app.models.Role;

        const group = await Group.findOne({
            where: {
                id: groupId,
            },
        });

        if (group === null) {
            this.log('debug', 'addGroupRole', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid group id');
        }

        const exists = await Role.findOne({
            where: {
                name: role,
            },
        });

        if (exists === null) {
            this.log('debug', 'addGroupRole', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid role name');
        }

        if (!group.roles.includes(role)) {
            group.roles.push(role);
            await group.save();
        }

        this.log('debug', 'addGroupRole', 'FINISHED');
    }

    /**
     * Removes role from group
     *
     * @param {string} groupId id of group where to remove the role
     * @param {object} role role to remove
     *
     */
    async removeGroupRole(groupId, role) {
        this.log('debug', 'removeGroupRole', 'STARTED');

        const Group = this.app.models.group;
        const Role = this.app.models.Role;

        const group = await Group.findOne({
            where: {
                id: groupId,
            },
        });

        if (group === null) {
            this.log('debug', 'removeGroupRole', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid group id');
        }

        const exists = await Role.findOne({
            where: {
                name: role,
            },
        });

        if (exists === null) {
            this.log('debug', 'removeGroupRole', 'FINISHED');
            throw new HttpErrors.BadRequest('Invalid role name');
        }

        if (group.roles.includes(role)) {
            group.roles.splice(group.roles.indexOf(role), 1);
            await group.save();
        }

        this.log('debug', 'removeGroupRole', 'FINISHED');
    }
};
