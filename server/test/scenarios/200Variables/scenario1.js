const axios = require('axios');
const should = require('should');

const url = 'http://localhost:3000/api';

let token = null;
describe('Scenario1 - Configuration with 200 elements', () => {
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

        await axios.post(`${url}/configurationModels`, {
            name: 'DEV',
            base: 'Environment',
        }, {
            headers: {Authorization: token},
        });

        await axios.post(`${url}/configurationModels`, {
            name: 'A',
            base: 'Application',
        }, {
            headers: {Authorization: token},
        });

        const rest = await axios.get(`${url}/restConfigurations`, {
            headers: {Authorization: token},
        });

        for (const config of rest.data) {
            await axios.delete(`${url}/restConfigurations/${config.id}`, {
                headers: {Authorization: token},
            });
        }

        const template = `{
%%forEach var in variables%%
"%%var.name%%":"%%var.value%%"
%%forEach END%%
}`;

        await axios.post(`${url}/restConfigurations`, {
            url: '{Environment}/{Application}',
            returnType: 'json',
            template: template,
        }, {
            headers: {Authorization: token},
        });
    });
    describe('Authorized (token)', () => {
        describe('Create configuration', () => {
            it(`should return 200`, async () => {
                const variables = [];
                for (let i = 0; i < 200; i++) {
                    variables.push({
                        name: `variable${i}`,
                        value: `${new Date().toLocaleString()}`,
                        type: 'string',
                    });
                }

                const configuration = await axios.post(`${url}/configurations`, {
                    Environment: 'DEV',
                    Application: 'A',
                    variables: variables,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('Get configuration', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/v1/DEV/A`, {
                    headers: {Authorization: token},
                });

                should(Object.keys(configuration.data).length).equal(200);

                should(configuration.status).equal(200);
            });
        });
    });
});
