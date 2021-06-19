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
