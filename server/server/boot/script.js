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

module.exports = async (app) => {
    const Member = app.models.Member;
    const Role = app.models.Role;
    const RoleMapping = app.models.RoleMapping;
    const v1 = app.models.v1;
    const connection = app.models.connection;

    let admin = await Member.findOne({
        where: {
            username: 'admin',
        },
    });

    if (!admin) {
        admin = await Member.create({
            username: 'admin',
            email: 'admin@admin.com',
            password: 'admin',
            groups: [],
            newUser: true,
        } );
    }

    const rolesList = [{
        name: 'admin',
    },
    {
        name: 'configuration.view',
    },
    {
        name: 'configuration.modify',
    },
    {
        name: 'configurationModel.view',
    },
    {
        name: 'configurationModel.modify',
    },
    {
        name: 'constantVariable.modify',
    },
    ];

    const allRoles = await Role.find();

    for (const role of rolesList) {
        const found = allRoles.find( (el) => {
            return el.name === role.name;
        });

        let newRole;

        if (!found) {
            newRole = await Role.create(role);
        }

        if (newRole && newRole.name === 'admin') {
            const mapped = await RoleMapping.findOne({
                where: {
                    principalType: RoleMapping.USER,
                    principalId: admin.id,
                },
            });

            if (mapped) {
                await newRole.principals.create({
                    principalType: RoleMapping.USER,
                    principalId: admin.id,
                });
            }
        }
    }

    const ldap = await connection.findOne({
        where: {
            system: 'LDAP',
        },
    });

    if (!ldap) {
        await connection.create({
            system: 'LDAP',
            enabled: false,
        });
    }

    const vault = await connection.findOne({
        where: {
            system: 'Vault',
        },
    });

    if (!vault) {
        await connection.create({
            system: 'Vault',
            enabled: false,
        });
    }

    const wasBooted = await v1.findOne({
        where: {
            booted: true,
        },
    });

    if (!wasBooted) {
        await v1.create([{
            booted: true,
        }]);
    }

    app.booted = true;
};
