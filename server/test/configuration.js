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
let token = null;

let baseConfig = null;
let configModel = null;
describe('Configuration', () => {
    before(async () => {
        let temp = await axios.post(`${url}/members/login`, {
            username: 'admin',
            password: 'admin',
        });

        token = temp.data.id;

        temp = await axios.post(`${url}/baseConfigurations`, {
            'name': 'TEST',
            'sequenceNumber': 0,
            'icon': 'string',
        }, {
            headers: {Authorization: token},
        });

        baseConfig = temp.data.id;

        temp = await axios.post(`${url}/configurationModels`, {
            'name': 'TEST',
            'rules': [],
            'restrictions': [],
            'base': 'TEST',
            'options': {
                'hasRestrictions': false,
            },
        }, {
            headers: {Authorization: token},
        });

        configModel = temp.data.id;
    });
    after( async () => {
        await axios.delete(`${url}/baseConfigurations/${baseConfig}`, {
            headers: {Authorization: token},
        });
        await axios.delete(`${url}/configurationModels/${configModel}`, {
            headers: {Authorization: token},
        });
    });
    describe('Authorized (token)', () => {
        describe('initialize', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/configurations/initialize`, {
                    secret: '12345678901234567890123456789012',
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(204);
            });
        });
        describe('POST', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/configurations`, {
                    'variables': [
                        {
                            'name': 'string',
                            'value': 'string',
                            'type': 'string',
                        },
                    ],
                    'TEST': 'TEST',
                    'description': '',
                    'version': 0,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);

                id = configuration.data.id;
            });
        });
        describe('GET', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('GET/{id}', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations/${id}`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('HEAD/{id}', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.head(`${url}/configurations/${id}`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(204);
            });
        });
        describe('GET/{id}/exists', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations/${id}/exists`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
                should(configuration.data.exists).equals(true);
            });
        });
        describe('POST/{id}/promote', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/configurations/${id}/promote`, undefined, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
                should(configuration.data.promoted).equals(true);
            });
        });
        describe('GET/count', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations/count`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('GET/findOne', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations/findOne?filter={"where":{"id":"${id}"}}`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
                should(configuration.data.id).not.equal(undefined);
            });
        });
        // describe('POST/promotionCandidates', () => {
        //     it(`should return 200`, async () => {
        //         const configuration = await axios.post(`${url}/configurations/promotionCandidates`, fullConfig, {
        //             headers: {Authorization: token},
        //         });

        //         should(configuration.status).equal(200);
        //     });
        // });
    });
    describe('Authorized (basicAuth)', () => {
        describe('POST', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/configurations`, {
                    'variables': [
                        {
                            'name': 'string',
                            'value': 'string',
                            'type': 'string',
                        },
                    ],
                    'TEST': 'TEST',
                    'description': '',
                    'version': 0,
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);

                id = configuration.data.id;
            });
        });
        describe('GET', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('GET/{id}', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations/${id}`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('HEAD/{id}', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.head(`${url}/configurations/${id}`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(204);
            });
        });
        describe('GET/{id}/exists', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations/${id}/exists`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
                should(configuration.data.exists).equals(true);
            });
        });
        describe('POST/{id}/promote', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/configurations/${id}/promote`, undefined, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
                should(configuration.data.promoted).equals(true);
            });
        });
        describe('GET/count', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations/count`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('GET/findOne', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurations/findOne?filter={"where":{"id":"${id}"}}`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
                should(configuration.data.id).not.equal(undefined);
            });
        });
        // describe('POST/promotionCandidates', () => {
        //     it(`should return 200`, async () => {
        //         const configuration = await axios.post(`${url}/configurations/promotionCandidates`, fullConfig, {
        //     auth: {
        //         username: 'admin',
        //         password: 'admin',
        //     },
        // });
        //         should(configuration.status).equal(200);
        //     });
        // });
    });
    describe('Unauthorized', () => {
        describe('POST', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/configurations`, {
                        'variables': [
                            {
                                'name': 'string',
                                'value': 'string',
                                'type': 'string',
                            },
                        ],
                        'description': '',
                        'version': 0,
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/configurations`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET/{id}', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/configurations/${id}`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('HEAD/{id}', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.head(`${url}/configurations/${id}`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET/{id}/exists', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/configurations/${id}/exists`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('POST/{id}/promote', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/configurations/${id}/promote`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET/count', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/configurations/count`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET/findOne', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/configurations/findOne?filter={"where":{"id":"${id}"}}`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('POST/promotionCandidates', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/configurations/promotionCandidates`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
    });
});
