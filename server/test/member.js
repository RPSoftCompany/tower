const axios = require('axios');
const should = require('should');

const url = 'http://localhost:3000/api';

let id = null;
let token = null;
let zenonToken = null;
let groupId = null;
describe('Member', () => {
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
                const member = await axios.post(`${url}/members`, {
                    newUser: true,
                    username: 'ZENEK',
                    password: 'changeme',
                }, {
                    headers: {Authorization: token},
                });

                id = member.data.id;

                should(member.status).equal(200);
            });
        });
        describe('GET', () => {
            it(`should return 200`, async () => {
                const member = await axios.get(`${url}/members?filter={"where":{"username":"ZENEK"}}`, {
                    headers: {Authorization: token},
                });

                should(member.data.length).equal(1);

                should(member.status).equal(200);
            });
        });
        describe('PATCH', () => {
            it(`should return 200`, async () => {
                const member = await axios.patch(`${url}/members`, {
                    id: id,
                    newUser: false,
                }, {
                    headers: {Authorization: token},
                });

                should(member.status).equal(200);
            });
        });
        describe('PATCH /{id}', () => {
            it(`should return 200`, async () => {
                const member = await axios.patch(`${url}/members/${id}`, {
                    id: id,
                    newUser: true,
                }, {
                    headers: {Authorization: token},
                });

                should(member.status).equal(200);
            });
        });
        describe('GET /{id}', () => {
            it(`should return 200`, async () => {
                const member = await axios.get(`${url}/members/${id}`, {
                    headers: {Authorization: token},
                });

                should(member.data.username).equal('ZENEK');

                should(member.status).equal(200);
            });
        });
        describe('HEAD /{id}', () => {
            it(`should return 200`, async () => {
                const member = await axios.head(`${url}/members/${id}`, {
                    headers: {Authorization: token},
                });

                should(member.status).equal(200);
            });
        });
        describe('PUT /{id}', () => {
            it(`should return 200`, async () => {
                const member = await axios.put(`${url}/members/${id}`, {
                    newUser: false,
                    username: 'ZENON',
                    password: 'changeme',
                }, {
                    headers: {Authorization: token},
                });

                should(member.status).equal(200);
            });
        });
        describe('GET /{id}/exists', () => {
            it(`should return 200`, async () => {
                const member = await axios.get(`${url}/members/${id}/exists`, {
                    headers: {Authorization: token},
                });

                should(member.status).equal(200);
            });
        });
        describe('PUT /{id}/replace', () => {
            it(`should return 200`, async () => {
                const member = await axios.put(`${url}/members/${id}`, {
                    newUser: false,
                    username: 'ZENON',
                    password: 'changeme',
                }, {
                    headers: {Authorization: token},
                });

                should(member.status).equal(200);
            });
        });
        describe('POST /login', () => {
            it(`should return 200`, async () => {
                const member = await axios.post(`${url}/members/login`, {
                    username: 'ZENON',
                    password: 'changeme',
                });

                zenonToken = member.data.id;

                should(member.status).equal(200);
            });
        });
        describe('POST /changeUserPassword', () => {
            it(`should return 204`, async () => {
                const member = await axios.post(`${url}/members/changeUserPassword`, {
                    newPassword: 'zenon',
                }, {
                    headers: {Authorization: zenonToken},
                });

                should(member.status).equal(204);
            });
        });
        describe('POST /setAsTechnicalUser', () => {
            it(`should return 200`, async () => {
                const member = await axios.post(`${url}/members/setAsTechnicalUser?isTechUser=true&userId=${id}`,
                    undefined, {
                        headers: {Authorization: token},
                    });

                should(member.status).equal(200);
            });
        });
        describe('GET /getTechnicalUserToken', () => {
            it(`should return 200`, async () => {
                const member = await axios.get(`${url}/members/getTechnicalUserToken?userId=${id}`, {
                    headers: {Authorization: token},
                });

                should(member.data).not.equal(undefined);

                should(member.status).equal(200);
            });
        });
        describe('POST /setAsTechnicalUser', () => {
            it(`should return 200`, async () => {
                const member = await axios.post(`${url}/members/setAsTechnicalUser?isTechUser=false&userId=${id}`,
                    undefined, {
                        headers: {Authorization: token},
                    });

                should(member.status).equal(200);
            });
        });
        describe('GET /getUserDetails', () => {
            it(`should return 200`, async () => {
                const member = await axios.get(`${url}/members/getUserDetails?userId=${id}`, {
                    headers: {Authorization: token},
                });

                should(member.status).equal(200);
            });
        });
        describe('POST /addUserGroup', () => {
            it(`should return 200`, async () => {
                const group = await axios.post(`${url}/groups`, {
                    name: 'TEST',
                    roles: [
                        'configuration.view',
                    ],
                }, {
                    headers: {Authorization: token},
                });

                groupId = group.data.id;

                const member = await axios.post(`${url}/members/addUserGroup?userId=${id}&group=TEST`,
                    undefined, {
                        headers: {Authorization: token},
                    });

                should(member.status).equal(200);
            });
        });
        describe('GET /getUserRoles', () => {
            it(`should return 200`, async () => {
                const login = await axios.post(`${url}/members/login`, {
                    username: 'ZENON',
                    password: 'zenon',
                });

                zenonToken = login.data.id;

                const member = await axios.get(`${url}/members/getUserRoles`, {
                    headers: {Authorization: zenonToken},
                });

                should(member.data[0]).equal('configuration.view');

                should(member.status).equal(200);

                await axios.delete(`${url}/groups/${groupId}`, {
                    headers: {Authorization: token},
                });
            });
        });
        describe('DELETE', () => {
            it(`should return 204`, async () => {
                const member = await axios.delete(`${url}/members/${id}`, {
                    headers: {Authorization: token},
                });

                should(member.status).equal(200);
            });
        });
    });
});
