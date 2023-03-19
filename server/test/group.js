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

let id = null;
let token = null;
describe('Group', () => {
    before(async () => {
        const temp = await axios.post(`${url}/members/login`, {
            username: 'admin',
            password: 'admin',
        });

        token = temp.data.id;
    });
    describe('Authorized (token)', () => {
        describe('POST', () => {
            it(`should return 200`, async () => {
                const group = await axios.post(`${url}/groups`, {
                    'name': 'string',
                    'roles': ['configuration.view'],
                }, {
                    headers: {Authorization: token},
                });

                should(group.status).equal(200);

                id = group.data.id;
            });
        });
        describe('GET', () => {
            it(`should return 200`, async () => {
                const group = await axios.get(`${url}/groups`, {
                    headers: {Authorization: token},
                });

                should(group.status).equal(200);
            });
        });
        describe('GET/{id}', () => {
            it(`should return 200`, async () => {
                const group = await axios.get(`${url}/groups/${id}`, {
                    headers: {Authorization: token},
                });

                should.exist(group.data.name);

                should(group.status).equal(200);
            });
        });
        describe('POST/{id}/role', () => {
            it(`should return 200`, async () => {
                const group = await axios.post(`${url}/groups/${id}/role?role=configuration.modify`, undefined, {
                    headers: {Authorization: token},
                });

                should(group.status).equal(204);
            });
        });
        describe('DELETE/{id}/role', () => {
            it(`should return 200`, async () => {
                const group = await axios.delete(`${url}/groups/${id}/role?role=configuration.modify`, {
                    headers: {Authorization: token},
                });

                should(group.status).equal(204);
            });
        });
        describe('GET/count', () => {
            it(`should return 200`, async () => {
                const group = await axios.get(`${url}/groups/count`, {
                    headers: {Authorization: token},
                });

                should(group.status).equal(200);
            });
        });
        describe('GET/findOne', () => {
            it(`should return 200`, async () => {
                const group = await axios.get(`${url}/groups/findOne?filter={"where":{"name":"string"}}`, {
                    headers: {Authorization: token},
                });

                should(group.data.name).equal('string');

                should(group.status).equal(200);
            });
        });
        describe('DELETE/{id}', () => {
            it(`should return 200`, async () => {
                const group = await axios.delete(`${url}/groups/${id}`, {
                    headers: {Authorization: token},
                });

                should(group.status).equal(204);
            });
        });
    });
});
