const axios = require('axios');
const should = require('should');

const url = 'http://localhost:3000/api';

let id = null;
let updatedId = null;
let token = null;
describe('Rest Configuration', () => {
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
                const rest = await axios.post(`${url}/restConfigurations`, {
                    url: 'asdf',
                    returnType: 'json',
                    template: 'asdf',
                }, {
                    headers: {Authorization: token},
                });

                id = rest.data.id;

                should(rest.status).equal(200);
            });
        });
        describe('GET', () => {
            it(`should return 200`, async () => {
                const rest = await axios.get(`${url}/restConfigurations?filter={"where":{"url":"asdf"}}`, {
                    headers: {Authorization: token},
                });

                should(rest.data.length).equal(1);

                should(rest.status).equal(200);
            });
        });
        describe('PATCH', () => {
            it(`should return 200`, async () => {
                const rest = await axios.patch(`${url}/restConfigurations`, {
                    id: id,
                    url: 'asdf',
                    returnType: 'json',
                    template: '{}',
                }, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(200);
            });
        });
        describe('PUT', () => {
            it(`should return 200`, async () => {
                const rest = await axios.put(`${url}/restConfigurations`, {
                    id: id,
                    url: 'asdf',
                    returnType: 'json',
                    template: '{}',
                    sequenceNumber: 0,
                }, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(200);
            });
        });
        describe('PATCH /{id}', () => {
            it(`should return 200`, async () => {
                const rest = await axios.patch(`${url}/restConfigurations/${id}`, {
                    url: 'asdf',
                    returnType: 'json',
                    template: '{asdf}',
                }, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(200);
            });
        });
        describe('GET /{id}', () => {
            it(`should return 200`, async () => {
                const rest = await axios.get(`${url}/restConfigurations/${id}`, {
                    headers: {Authorization: token},
                });

                should(rest.data.url).not.equal(undefined);

                should(rest.status).equal(200);
            });
        });
        describe('HEAD /{id}', () => {
            it(`should return 200`, async () => {
                const rest = await axios.head(`${url}/restConfigurations/${id}`, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(200);
            });
        });
        describe('PUT /{id}', () => {
            it(`should return 200`, async () => {
                const rest = await axios.put(`${url}/restConfigurations/${id}`, {
                    url: 'asdf',
                    returnType: 'json',
                    template: '{1234}',
                    sequenceNumber: 0,
                }, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(200);
            });
        });
        describe('GET /{id}/exists', () => {
            it(`should return 200`, async () => {
                const rest = await axios.get(`${url}/restConfigurations/${id}/exists`, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(200);
            });
        });
        describe('POST /{id}/replace', () => {
            it(`should return 200`, async () => {
                const rest = await axios.post(`${url}/restConfigurations/${id}/replace`, {
                    url: 'asdf',
                    returnType: 'json',
                    template: '{7890}',
                    sequenceNumber: 0,
                }, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(200);
            });
        });
        describe('POST /changeSequence', () => {
            it(`should return 200`, async () => {
                const rest = await axios.post(`${url}/restConfigurations/changeSequence`, {
                    id: id,
                    url: 'asdf',
                    returnType: 'json',
                    template: '{7890}',
                    sequenceNumber: 1,
                }, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(204);
            });
        });
        describe('GET /count', () => {
            it(`should return 200`, async () => {
                const rest = await axios.get(`${url}/restConfigurations/count`, {
                    headers: {Authorization: token},
                });

                should(rest.data.count).equal(1);

                should(rest.status).equal(200);
            });
        });
        describe('GET /findOne', () => {
            it(`should return 200`, async () => {
                const rest = await axios.get(`${url}/restConfigurations/findOne?filter={"where":{"url":"asdf"}}`, {
                    headers: {Authorization: token},
                });

                should(rest.data.url).not.equal(undefined);

                should(rest.status).equal(200);
            });
        });
        describe('POST /replaceOrCreate', () => {
            it(`should return 200`, async () => {
                const rest = await axios.post(`${url}/restConfigurations/replaceOrCreate`, {
                    id: id,
                    url: 'asdf',
                    returnType: 'json',
                    template: '{7890}',
                    sequenceNumber: 1,
                }, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(200);
            });
        });
        describe('POST /update', () => {
            it(`should return 200`, async () => {
                const rest = await axios.post(`${url}/restConfigurations/replaceOrCreate?where={"url":"asdf"}`, {
                    url: 'asdfasdf',
                    returnType: 'json',
                    template: '{72222890}',
                    sequenceNumber: 0,
                }, {
                    headers: {Authorization: token},
                });

                updatedId = rest.data.id;

                should(rest.data.id).not.equal(undefined);

                should(rest.status).equal(200);
            });
        });

        describe('DELETE /{id}', () => {
            it(`should return 200`, async () => {
                const rest = await axios.delete(`${url}/restConfigurations/${id}`, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(204);
            });
        });
        describe('DELETE /{id}', () => {
            it(`should return 200`, async () => {
                const rest = await axios.delete(`${url}/restConfigurations/${updatedId}`, {
                    headers: {Authorization: token},
                });

                should(rest.status).equal(204);
            });
        });
    });
});
