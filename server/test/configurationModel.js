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
let baseId = null;
let ruleId = null;
let token = null;
describe('Configuration Model', () => {
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
    });
    after(async () => {
        await axios.delete(`${url}/baseConfigurations/${baseId}`, {
            headers: {Authorization: token},
        });
    });
    describe('Authorized (token)', () => {
        describe('POST', () => {
            it(`should return 201`, async () => {
                const configuration = await axios.post(`${url}/configurationModels`, {
                    'name': 'string',
                    'rules': [
                        {
                            '_id': 'string',
                            'targetValue': 'string',
                            'targetType': 'string',
                            'targetRegEx': true,
                            'conditionValue': 'string',
                            'conditionType': 'string',
                            'conditionRegEx': true,
                            'error': 'string',
                        },
                    ],
                    'restrictions': [
                        {'__id': '123', 'string': 'string'},
                    ],
                    'base': 'string',
                    'options': {
                        'hasRestrictions': false,
                    },
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);

                id = configuration.data.id;
            });
        });

        describe('GET', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.get(`${url}/configurationModels`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('PATCH', () => {
            it(`should return 201`, async () => {
                const configuration = await axios.patch(`${url}/configurationModels`, {
                    'name': 'string',
                    'rules': [
                        {
                            '_id': 'string',
                            'targetValue': 'string',
                            'targetType': 'string',
                            'targetRegEx': true,
                            'conditionValue': 'string',
                            'conditionType': 'string',
                            'conditionRegEx': true,
                            'error': 'string',
                        },
                    ],
                    'restrictions': [
                        {'__id': '123', 'string': 'string'},
                    ],
                    'base': 'string',
                    'options': {
                        'hasRestrictions': true,
                    },
                    'id': id,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('PUT', () => {
            it(`should return 201`, async () => {
                const configuration = await axios.patch(`${url}/configurationModels`, {
                    'name': 'string',
                    'rules': [
                        {
                            '_id': 'string',
                            'targetValue': 'string',
                            'targetType': 'string',
                            'targetRegEx': true,
                            'conditionValue': 'string',
                            'conditionType': 'string',
                            'conditionRegEx': true,
                            'error': 'string',
                        },
                    ],
                    'restrictions': [
                        {'__id': '123', 'string': 'string'},,
                    ],
                    'base': 'string',
                    'options': {
                        'hasRestrictions': true,
                    },
                    'id': id,
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('PATCH/{id}/options', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/configurationModels/${id}/options`, {
                    'name': 'name',
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('POST/{id}/restriction', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.post(`${url}/configurationModels/${id}/restriction`,
                    {'__id': '123', 'string': 'string'},
                    {
                        headers: {Authorization: token},
                    });

                should(configuration.status).equal(204);
            });
        });

        describe('PATCH/{id}/restriction', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.patch(`${url}/configurationModels/${id}/restriction`,
                    {'__id': '123', 'string': 'string2'},
                    {
                        headers: {Authorization: token},
                    });

                should(configuration.status).equal(204);
            });
        });

        describe('DELETE/{id}/restriction', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.delete(`${url}/configurationModels/${
                    id}/restriction?restrictionId=123`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(204);
            });
        });

        describe('POST/{id}/rule', () => {
            it(`should return 201`, async () => {
                const configuration = await axios.post(`${url}/configurationModels/${id}/rule`, {
                    '_id': 'string',
                    'targetValue': 'string',
                    'targetType': 'string',
                    'targetRegEx': true,
                    'conditionValue': 'string',
                    'conditionType': 'string',
                    'conditionRegEx': true,
                    'error': 'string',
                }, {
                    headers: {Authorization: token},
                });

                ruleId = configuration.data.id;

                should(configuration.status).equal(201);
            });
        });

        describe('PATCH/{id}/rule', () => {
            it(`should return 200`, async () => {
                const configuration = await axios.patch(`${url}/configurationModels/${id}/rule`, {
                    '_id': 'string',
                    'targetValue': 'string2',
                    'targetType': 'string',
                    'targetRegEx': true,
                    'conditionValue': 'string',
                    'conditionType': 'string',
                    'conditionRegEx': true,
                    'error': 'string',
                }, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(200);
            });
        });

        describe('DELETE/{id}/rule', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.delete(`${url}/configurationModels/${id}/rule?ruleId=${ruleId}`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(204);
            });
        });

        describe('DELETE/{id}', () => {
            it(`should return 204`, async () => {
                const configuration = await axios.delete(`${url}/configurationModels/${id}`, {
                    headers: {Authorization: token},
                });

                should(configuration.status).equal(204);
            });
        });
    });
    describe('Unauthorized', () => {
        describe('POST', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/configurationModels`, {
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
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('GET', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.get(`${url}/configurationModels`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('PATCH', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.patch(`${url}/configurationModels`, {
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
                        'id': id,
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('PUT', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.patch(`${url}/configurationModels`, {
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
                        'id': id,
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('PATCH/{id}/options', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.patch(`${url}/configurationModels/${id}/options`, {
                        'name': 'name',
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('POST/{id}/restriction', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/configurationModels/${id}/restriction?restriction=asdf`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('DELETE/{id}/restriction', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.delete(`${url}/configurationModels/${id}/restriction?restriction=asdf`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('POST/{id}/rule', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.post(`${url}/configurationModels/${id}/rule`, {
                        'name': 'string',
                        'value': 'string',
                        'error': 'string',
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('PATCH/{id}/rule', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.patch(`${url}/configurationModels/${id}/rule`, {
                        '_id': 'string',
                        'name': 'string1',
                        'value': 'string',
                        'error': 'string',
                    });
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('DELETE/{id}/rule', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.delete(`${url}/configurationModels/${id}/rule?ruleId=ASDF`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });

        describe('DELETE/{id}', () => {
            it(`should return 401`, async () => {
                try {
                    await axios.delete(`${url}/configurationModels/${id}`);
                } catch (e) {
                    should(e.response.status).equal(401);
                }
            });
        });
    });
});
