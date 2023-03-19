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

const axios = require('axios');
const should = require('should');

const url = 'http://localhost:3000';

let token = null;
let ldapId = null;
let vaultId = null;
describe('Connection', () => {
    before(async () => {
        const temp = await axios.post(`${url}/members/login`, {
            username: 'admin',
            password: 'admin',
        });

        token = temp.data.id;
    });
    describe('Authorized (token)', () => {
        describe('GET', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/connections`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);

                configuration.data.forEach( (el) => {
                    if (el.system === 'LDAP') {
                        ldapId = el.id;
                    } else {
                        vaultId = el.id;
                    }
                });
            });
        });
        describe('PATCH LDAP', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/connections`, {
                    'system': 'LDAP',
                    'url': 'string',
                    'bindCredentials': 'bind',
                    'enabled': true,
                    'id': ldapId,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('PATCH Vault', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/connections`, {
                    'system': 'Vault',
                    'url': 'string',
                    'enabled': true,
                    'useGlobalToken': true,
                    'globalToken': 'test',
                    'tokens': [],
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('HEAD', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.head(`${url}/connections/${ldapId}`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('GET {id}/exists', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/connections/${ldapId}/exists`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('PATCH LDAP', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/connections`, {
                    'system': 'LDAP',
                    'url': 'string',
                    'bindCredentials': 'bind',
                    'enabled': false,
                    'id': ldapId,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('PATCH Vault', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/connections`, {
                    'system': 'Vault',
                    'url': 'string',
                    'enabled': false,
                    'useGlobalToken': true,
                    'globalToken': 'test',
                    'tokens': [],
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
    });
});
