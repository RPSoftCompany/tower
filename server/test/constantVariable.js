const axios = require('axios');
const should = require('should');

const url = 'http://localhost:3000/api';

let token = null;
let baseId = null;
let confModelId = null;
let id = null;

describe('Constant Varaibles', () => {
    before(async () => {
        const temp = await axios.post(`${url}/members/login`, {
            username: 'admin',
            password: 'admin',
        });

        token = temp.data.id;

        const base = await axios.post(`${url}/baseConfigurations`, {
            'name': 'string',
            'sequenceNumber': 0,
            'icon': 'string',
        }, {
            headers: {Authorization: token},
        });

        baseId = base.data.id;

        const constModel = await axios.post(`${url}/configurationModels`, {
            'name': 'string',
            'rules': [
                {
                    '_id': 'string',
                    'name': 'string',
                    'value': 'string',
                    'error': 'string',
                },
            ],
            'restrictions': [
                'string',
            ],
            'base': 'string',
            'options': {
                'hasRestrictions': false,
            },
        }, {
            headers: {Authorization: token},
        });

        confModelId = constModel.data.id;
    });
    after(async () => {
        await axios.delete(`${url}/baseConfigurations/${baseId}`, {
            headers: {Authorization: token},
        });
        await axios.delete(`${url}/configurationModels/${confModelId}`, {
            headers: {Authorization: token},
        });
    });
    describe('Authorized (token)', () => {
        describe('POST', () => {
            it(`should return 204`, async () => {
                const constantVariable = await axios.post(`${url}/constantVariables`, {
                    'string': 'string',
                    'effectiveDate': '$now',
                    'createdBy': 'string',
                    'variables': [
                        {
                            'name': 'string',
                            'value': 'string',
                            'type': 'string',
                            'forced': true,
                            'addIfAbsent': true,
                        },
                    ],
                }, {
                    headers: {Authorization: token},
                });

                should(constantVariable.status).equal(204);
            });
        });
        describe('GET', () => {
            it(`should return 200`, async () => {
                const constantVariable = await axios.get(`${url
                }/constantVariables?filter={"where":{"string":"string"}}`, {
                    headers: {Authorization: token},
                });

                should(constantVariable.status).equal(200);
                should(constantVariable.data.length > 0).equals(true);

                id = constantVariable.data[0].id;
            });
        });
        describe('HEAD/{id}', () => {
            it(`should return 200`, async () => {
                const constantVariable = await axios.head(`${url}/constantVariables/${id}`, {
                    headers: {Authorization: token},
                });

                should(constantVariable.status).equal(200);
            });
        });
        describe('GET/{id}/exists', () => {
            it(`should return 200`, async () => {
                const constantVariable = await axios.get(`${url}/constantVariables/${id}/exists`, {
                    headers: {Authorization: token},
                });

                should(constantVariable.status).equal(200);
            });
        });
        describe('GET/count', () => {
            it(`should return 200`, async () => {
                const constantVariable = await axios.get(`${url}/constantVariables/count`, {
                    headers: {Authorization: token},
                });

                should(constantVariable.status).equal(200);
                should(constantVariable.data.count > 0).equal(true);
            });
        });
        describe('GET/findLatest', () => {
            it(`should return 200`, async () => {
                const constantVariable = await axios.get(`${url
                }/constantVariables/findLatest?filter={"string":"string"}`, {
                    headers: {Authorization: token},
                });

                should(constantVariable.status).equal(200);
                should(constantVariable.data.length > 0).equal(true);
                should(constantVariable.data[0].name).equal('string');
            });
        });
    });
});
