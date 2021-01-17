const axios = require('axios');
const should = require('should');

const url = 'http://localhost:3000';

let token = null;
let mietekToken = null;
let zenonToken = null;
let franekToken = null;
describe('Permissions - ConfigurationModel', () => {
    before(async () => {
        const temp = await axios.post(`${url}/members/login`, {
            username: 'admin',
            password: 'admin',
        });

        token = temp.data.id;

        const base = await axios.get(`${url}/baseConfigurations`, {
            headers: {Authorization: token},
        });

        for (const baseModel of base.data) {
            await axios.delete(`${url}/baseConfigurations/${baseModel.id}`, {
                headers: {Authorization: token},
            });
        }

        await axios.post(`${url}/baseConfigurations`, {
            name: 'Environment',
            icon: '',
        }, {
            headers: {Authorization: token},
        });

        await axios.post(`${url}/baseConfigurations`, {
            name: 'Application',
            icon: '',
        }, {
            headers: {Authorization: token},
        });

        const confModels = await axios.get(`${url}/configurationModels`, {
            headers: {Authorization: token},
        });

        for (const model of confModels.data) {
            await axios.delete(`${url}/configurationModels/${model.id}`, {
                headers: {Authorization: token},
            });
        }

        const groups = await axios.get(`${url}/groups`, {
            headers: {Authorization: token},
        });

        for (const model of groups.data) {
            await axios.delete(`${url}/groups/${model.id}`, {
                headers: {Authorization: token},
            });
        }

        await axios.post(`${url}/groups`, {
            name: 'Scenario1',
            roles: [
                'configurationModel.view',
                'configurationModel.modify',
                'baseConfigurations.Environment.view',
                'baseConfigurations.Application.view',
            ],
        }, {
            headers: {Authorization: token},
        });

        await axios.post(`${url}/groups`, {
            name: 'Scenario1_viewPerm',
            roles: [
                'configurationModel.view',
                'baseConfigurations.Environment.view',
                'baseConfigurations.Application.view',
            ],
        }, {
            headers: {Authorization: token},
        });

        await axios.post(`${url}/groups`, {
            name: 'Scenario1_noPerm',
            roles: [],
        }, {
            headers: {Authorization: token},
        });

        const users = await axios.get(`${url}/members`, {
            headers: {Authorization: token},
        });

        for (const user of users.data) {
            if (user.username !== 'admin') {
                await axios.delete(`${url}/members/${user.id}`, {
                    headers: {Authorization: token},
                });
            }
        }

        await axios.post(`${url}/members`, {
            'groups': ['Scenario1'],
            'newUser': false,
            'technicalUser': false,
            'type': 'local',
            'username': 'mietek',
            'password': 'mietek',
        }, {
            headers: {Authorization: token},
        });

        const mietek = await axios.post(`${url}/members/login`, {
            username: 'mietek',
            password: 'mietek',
        });

        mietekToken = mietek.data.id;

        await axios.post(`${url}/members`, {
            'groups': ['Scenario1_viewPerm'],
            'newUser': false,
            'technicalUser': false,
            'type': 'local',
            'username': 'zenon',
            'password': 'zenon',
        }, {
            headers: {Authorization: token},
        });

        const zenon = await axios.post(`${url}/members/login`, {
            username: 'zenon',
            password: 'zenon',
        });

        zenonToken = zenon.data.id;

        await axios.post(`${url}/members`, {
            'groups': ['Scenario1_noPerm'],
            'newUser': false,
            'technicalUser': false,
            'type': 'local',
            'username': 'franek',
            'password': 'franek',
        }, {
            headers: {Authorization: token},
        });

        const franek = await axios.post(`${url}/members/login`, {
            username: 'franek',
            password: 'franek',
        });

        franekToken = franek.data.id;
    });
    describe('Scenarios', () => {
        describe('Create configuration model without permissions', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/configurations`, {
                        Environment: 'DEV',
                        Application: 'A',
                        variables: [],
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('Create configuration model with invalid token', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/configurations`, {
                        Environment: 'DEV',
                        Application: 'A',
                        variables: [],
                    }, {
                        headers: {Authorization: 'AAAAAAAAAAAAAAAAAAAAA'},
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('Create configuration model with permissions', () => {
            it(`should return 200`, async () => {
                const config = await axios.post(`${url}/configurationModels`, {
                    name: 'string',
                    rules: [],
                    restrictions: [],
                    defaultValues: [],
                    base: 'Environment',
                    options: {
                        hasRestrictions: false,
                    },
                }, {
                    headers: {Authorization: mietekToken},
                });

                should(config.status).equal(200);
            });
        });
        describe('Get it without permissions', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/configurationModels?filter={"where":{"name": "string"}}`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('Get it with permissions', () => {
            it(`should return 200`, async () => {
                const config = await axios.get(`${url}/configurationModels?filter={"where":{"name": "string"}}`, {
                    headers: {Authorization: mietekToken},
                });

                should(config.status).equal(200);
            });
        });
        describe('Get it with view permissions', () => {
            it(`should return 200`, async () => {
                const config = await axios.get(`${url}/configurationModels?filter={"where":{"name": "string"}}`, {
                    headers: {Authorization: zenonToken},
                });

                should(config.status).equal(200);
            });
        });
        describe('Get it without permissions (roles)', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/configurationModels?filter={"where":{"name": "string"}}`, {
                        headers: {Authorization: franekToken},
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('Patch configuration model with permissions', () => {
            it(`should return 200`, async () => {
                const config = await axios.patch(`${url}/configurationModels`, {
                    name: 'string',
                    options: {
                        hasRestrictions: true,
                    },
                }, {
                    headers: {Authorization: mietekToken},
                });

                should(config.status).equal(200);
            });
        });
        describe('Patch configuration model with view permissions', () => {
            it(`should return 200`, async () => {
                try {
                    await axios.patch(`${url}/configurationModels`, {
                        name: 'string',
                        options: {
                            hasRestrictions: true,
                        },
                    }, {
                        headers: {Authorization: zenonToken},
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('Patch configuration model with no permissions', () => {
            it(`should return 200`, async () => {
                try {
                    await axios.patch(`${url}/configurationModels`, {
                        name: 'string',
                        options: {
                            hasRestrictions: true,
                        },
                    }, {
                        headers: {Authorization: franekToken},
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
    });
});
