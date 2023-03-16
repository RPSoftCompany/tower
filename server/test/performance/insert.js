import http from 'k6/http';

const Environments = ['DEV', 'INT', 'UAT', 'PRD'];
const Apps = ['App1', 'App2', 'App3', 'App4'];
export default () => {
    http.get('https://test.k6.io');

    const url = 'http://localhost:3000';

    const temp = http.post(`${url}/members/login`, JSON.stringify({
        username: 'admin',
        password: 'admin',
    }), {headers: {'Content-Type': 'application/json'}});

    const token = temp.json().id;

    const variables = [];
    for (let i = 0; i < 200; i++) {
        variables.push({
            name: `variable${i}`,
            value: `${new Date().toLocaleString()}`,
            type: 'string',
        });
    }

    // const randomEnv = 'oyfr0';
    // const randomApp = 'jwsw7';

    // const randomApp = Math.random().toString(36).substring(2, 7);
    // const randomEnv = Math.random().toString(36).substring(2, 7);

    const randomApp = Apps[Math.floor(Math.random() * 4)];
    const randomEnv = Environments[Math.floor(Math.random() * 4)];

    http.post(`${url}/configurationModels`, JSON.stringify({
        name: randomEnv,
        base: 'Environment',
    }), {
        headers: {'Authorization': token, 'Content-Type': 'application/json'},
    });

    http.post(`${url}/configurationModels`, JSON.stringify({
        name: randomApp,
        base: 'Application',
    }), {
        headers: {'Authorization': token, 'Content-Type': 'application/json'},
    });

    http.post(`${url}/configurations`, JSON.stringify({
        Project: 'ISHIFT',
        Environment: randomEnv,
        Application: randomApp,
        variables: variables,
    }), {
        headers: {'Authorization': token, 'Content-Type': 'application/json'},
    });
};
