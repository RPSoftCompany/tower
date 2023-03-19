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
let hookId = null;
let token = null;
describe('Hooks', () => {
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
                const hook = await axios.get(`${url}/hooks`, {
                    headers: {Authorization: token},
                });

                should(hook.data.length).not.equal(0);

                id = hook.data[0].id;

                should(hook.status).equal(200);
            });
        });
        describe('HEAD /{id}', () => {
            it(`should return 200`, async () => {
                const hook = await axios.head(`${url}/hooks/${id}`, {
                    headers: {Authorization: token},
                });

                should(hook.status).equal(200);
            });
        });
        describe('POST /{id}/hookObject', () => {
            it(`should return 200`, async () => {
                const hook = await axios.post(`${url}/hooks/${id}/hookObject`, {
                    url: 'http://1234',
                    description: 'asdf',
                }, {
                    headers: {Authorization: token},
                });

                should(hook.status).equal(204);
            });
        });
        describe('GET /{id}', () => {
            it(`should return 200`, async () => {
                const hook = await axios.get(`${url}/hooks/${id}`, {
                    headers: {Authorization: token},
                });

                should.exist(hook.data.method);

                hookId = hook.data.hooks[0]._id;

                should(hook.status).equal(200);
            });
        });
        describe('PUT /{id}/hookObject', () => {
            it(`should return 200`, async () => {
                const hook = await axios.put(`${url}/hooks/${id}/hookObject`, {
                    _id: hookId,
                    url: 'http://12345',
                    description: 'asdf',
                }, {
                    headers: {Authorization: token},
                });

                should(hook.status).equal(204);
            });
        });
        describe('DELETE /{id}/hookObject/{fk}', () => {
            it(`should return 200`, async () => {
                const hook = await axios.delete(`${url}/hooks/${id}/hookObject/${hookId}`, {
                    headers: {Authorization: token},
                });

                should(hook.status).equal(204);
            });
        });
        describe('GET /count', () => {
            it(`should return 200`, async () => {
                const hook = await axios.get(`${url}/hooks/count`, {
                    headers: {Authorization: token},
                });

                should.exist(hook.data.count);

                should(hook.status).equal(200);
            });
        });
        describe('GET /findOne', () => {
            it(`should return 200`, async () => {
                const hook = await axios.get(`${url}/hooks/findOne?filter={"where":{"id":"${id}"}}`, {
                    headers: {Authorization: token},
                });

                should.exist(hook.data.method);

                should(hook.status).equal(200);
            });
        });
    });
});
