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
