const axios = require('axios');
const should = require('should');

const url = 'http://localhost:3000/api';

let id = null;
let token = null;
describe('Promotion', () => {
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
                const promotion = await axios.post(`${url}/promotions`, {
                    base: 'TEST',
                    fromModel: 'DEV',
                    toModels: ['TEST'],
                }, {
                    headers: {Authorization: token},
                });

                id = promotion.data.id;

                should(promotion.status).equal(200);
            });
        });
        describe('GET', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.get(`${url}/promotions?filter={"where":{"base":"TEST"}}`, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('PATCH', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.patch(`${url}/promotions`, {
                    id: id,
                    base: 'TEST',
                    fromModel: 'DEV',
                    toModels: ['TEST'],
                }, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('PUT', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.put(`${url}/promotions`, {
                    id: id,
                    base: 'TEST 3',
                    fromModel: 'DEV',
                    toModels: ['TEST'],
                }, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('PATCH /{id}', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.patch(`${url}/promotions/${id}`, {
                    base: 'TEST 4',
                    fromModel: 'DEV',
                    toModels: ['TEST'],
                }, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('GET /{id}', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.get(`${url}/promotions/${id}`, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('HEAD /{id}', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.head(`${url}/promotions/${id}`, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('PUT /{id}', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.put(`${url}/promotions/${id}`, {
                    base: 'TEST 4',
                    fromModel: 'DEV',
                    toModels: ['TEST'],
                }, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('GET /{id}/exists', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.get(`${url}/promotions/${id}/exists`, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('POST /{id}/replace', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.post(`${url}/promotions/${id}/replace`, {
                    id: id,
                    base: 'TEST 5',
                    fromModel: 'DEV',
                    toModels: ['TEST'],
                }, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('GET /count', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.get(`${url}/promotions/count`, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('GET /findOne', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.get(`${url}/promotions/findOne?filter={"where":{"base":"TEST 5"}}`, {
                    headers: {Authorization: token},
                });

                should(promotion.data.base).equals('TEST 5');

                should(promotion.status).equal(200);
            });
        });
        describe('POST /replaceOrCreate', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.post(`${url}/promotions/replaceOrCreate`, {
                    id: id,
                    base: 'TEST 6',
                    fromModel: 'DEV',
                    toModels: ['TEST'],
                }, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
        describe('POST /update', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.post(`${url}/promotions/update?where={"base":"TEST 6"}`, {
                    toModels: ['TEST', 'DEV'],
                }, {
                    headers: {Authorization: token},
                });

                should(promotion.data.count).equals(1);

                should(promotion.status).equal(200);
            });
        });
        describe('POST /upsertWithWhere', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.post(`${url}/promotions/upsertWithWhere?where={"base":"TEST 6"}`, {
                    base: 'TEST 7',
                    fromModel: 'DEV',
                    toModels: ['TEST'],
                }, {
                    headers: {Authorization: token},
                });

                should(promotion.data.base).equal('TEST 7');

                should(promotion.status).equal(200);
            });
        });
        describe('DELETE /{id}', () => {
            it(`should return 200`, async () => {
                const promotion = await axios.delete(`${url}/promotions/${id}`, {
                    headers: {Authorization: token},
                });

                should(promotion.status).equal(200);
            });
        });
    });
});
