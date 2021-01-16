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
