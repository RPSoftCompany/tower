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
const name = Math.random().toString(36).replace(/[^a-z]+/g, '');
describe('BaseConfiguration', () => {
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
                const configuration = await axios.post(`${url}/baseConfigurations`, {
                    'name': name,
                    'sequenceNumber': 0,
                    'icon': 'string',
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);

                id = configuration.data.id;
            });
        });
        describe('PATCH', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/baseConfigurations`, {
                    'name': name,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('PUT', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.put(`${url}/baseConfigurations`, {
                    'name': name,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('PATCH/{id}', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/baseConfigurations/${id}`, {
                    'name': name,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('PUT/{id}', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.put(`${url}/baseConfigurations/${id}`, {
                    'name': name,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('GET/{id}', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/baseConfigurations/${id}`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
                should(configuration.data.id).not.equal(undefined);
            });
        });
        describe('GET/{id}/exists', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/baseConfigurations/${id}/exists`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('POST/{id}/replace', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/${id}/replace`, {
                    'name': `${name}1`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('POST/changeSequence', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/changeSequence`, {
                    'name': `${name}1`,
                    'sequenceNumber': 2,
                    'icon': 'string',
                    'id': id,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(204);
            });
        });
        describe('HEAD/{id}', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.head(`${url}/baseConfigurations/${id}`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('GET/count', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/baseConfigurations/count`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('GET/findOne', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/baseConfigurations/findOne`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
                should(configuration.data.id).not.equal(undefined);
            });
        });
        describe('POST/replaceOrCreate', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/replaceOrCreate`, {
                    'name': `${name}10`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('POST/update', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/update?where={"id":"${id}"}`, {
                    'name': `${name}101`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('POST/upsertWithWhere', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/upsertWithWhere?where={"id":"${
                    id}"}`, {
                    'name': `${name}1010`,
                    'sequenceNumber': 7,
                    'icon': 'string',
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });
        describe('DELETE/{id}', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.delete(`${url}/baseConfigurations/${id}`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(204);
            });
        });
    });
    describe('Authorized (basicAuth)', () => {
        describe('POST', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations`, {
                    'name': `${name}`,
                    'sequenceNumber': 0,
                    'icon': 'string',
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
        describe('PATCH', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/baseConfigurations`, {
                    'name': `${name}`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('PUT', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.put(`${url}/baseConfigurations`, {
                    'name': `${name}`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('PATCH/{id}', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/baseConfigurations/${id}`, {
                    'name': `${name}`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('PUT/{id}', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.put(`${url}/baseConfigurations/${id}`, {
                    'name': `${name}`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
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
                const configuration = await axios.get(`${url}/baseConfigurations/${id}`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
                should(configuration.data.id).not.equal(undefined);
            });
        });
        describe('GET/{id}/exists', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/baseConfigurations/${id}/exists`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('POST/{id}/replace', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/${id}/replace`, {
                    'name': `${name}1`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('POST/changeSequence', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/changeSequence`, {
                    'name': `${name}1`,
                    'sequenceNumber': 2,
                    'icon': 'string',
                    'id': id,
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(204);
            });
        });
        describe('HEAD/{id}', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.head(`${url}/baseConfigurations/${id}`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('GET/count', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/baseConfigurations/count`, {
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
                const configuration = await axios.get(`${url}/baseConfigurations/findOne`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
                should(configuration.data.id).not.equal(undefined);
            });
        });
        describe('POST/replaceOrCreate', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/replaceOrCreate`, {
                    'name': `${name}10`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                    'id': id,
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('POST/update', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/update?where={"id":"${id}"}`, {
                    'name': `${name}101`,
                    'sequenceNumber': 0,
                    'icon': 'string',
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
        describe('POST/upsertWithWhere', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.post(`${url}/baseConfigurations/upsertWithWhere?where={"id":"${
                    id}"}`, {
                    'name': `${name}1010`,
                    'sequenceNumber': 7,
                    'icon': 'string',
                }, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(200);
            });
        });
    });

    describe('Unauthorized', () => {
        describe('PATCH', () => {
            it(`/ should return 401`, async () => {
                try {
                    await axios.patch(`${url}/baseConfigurations`, {
                        'name': `${name}`,
                        'sequenceNumber': 0,
                        'icon': 'string',
                        'id': 'string',
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET', () => {
            it(`/ should return 401`, async () => {
                try {
                    await axios.get(`${url}/baseConfigurations`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('PUT', () => {
            it(`/ should return 401`, async () => {
                try {
                    await axios.put(`${url}/baseConfigurations`, {
                        'name': `${name}`,
                        'sequenceNumber': 0,
                        'icon': 'string',
                        'id': 'string',
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('POST', () => {
            it(`/ should return 401`, async () => {
                try {
                    await axios.post(`${url}/baseConfigurations`, {
                        'name': `${name}`,
                        'sequenceNumber': 0,
                        'icon': 'string',
                        'id': 'string',
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('PATCH/{id}', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.patch(`${url}/baseConfigurations/${id}`, {
                        'name': `${name}`,
                        'sequenceNumber': 0,
                        'icon': 'string',
                        'id': id,
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('PUT/{id}', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.put(`${url}/baseConfigurations/${id}`, {
                        'name': `${name}`,
                        'sequenceNumber': 0,
                        'icon': 'string',
                        'id': id,
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET/{id}', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/baseConfigurations/${id}`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET/{id}/exists', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/baseConfigurations/${id}/exists`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('POST/{id}/replace', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/baseConfigurations/${id}/replace`, {
                        'name': `${name}1`,
                        'sequenceNumber': 0,
                        'icon': 'string',
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('POST/changeSequence', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/baseConfigurations/changeSequence`, {
                        'name': `${name}1`,
                        'sequenceNumber': 2,
                        'icon': 'string',
                        'id': id,
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('HEAD/{id}', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.head(`${url}/baseConfigurations/${id}`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET/count', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/baseConfigurations/count`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('GET/findOne', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/baseConfigurations/findOne`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('POST/replaceOrCreate', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/baseConfigurations/replaceOrCreate`, {
                        'name': `${name}10`,
                        'sequenceNumber': 0,
                        'icon': 'string',
                        'id': id,
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('POST/update', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/baseConfigurations/update?where={"id":"${id}"}`, {
                        'name': `${name}101`,
                        'sequenceNumber': 0,
                        'icon': 'string',
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('POST/upsertWithWhere', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/baseConfigurations/upsertWithWhere?where={"id":"${id}"}`, {
                        'name': `${name}1010`,
                        'sequenceNumber': 7,
                        'icon': 'string',
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
        describe('DELETE/{id}', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.delete(`${url}/baseConfigurations/${id}`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
    });

    describe('Cleanup', () => {
        describe('DELETE/{id}', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.delete(`${url}/baseConfigurations/${id}`, {
                    auth: {
                        username: 'admin',
                        password: 'admin',
                    },
                });

                should(configuration.status).equal(204);
            });
        });
    });
});
