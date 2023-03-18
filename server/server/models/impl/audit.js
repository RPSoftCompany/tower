//    Copyright RPSoft 2019,2020. All Rights Reserved.
//    This file is part of RPSoft Tower.
//
//    Tower is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 3 of the License, or
//    (at your option) any later version.
//
//    Tower is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Tower.  If not, see http://www.gnu.org/licenses/gpl-3.0.html.

const escapeStringRegex = require('regex-escape');

module.exports = class BaseConfiguration {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'audit';
        this.logger = null;

        this.app = app;

        app.set('AuditInstance', this);

        this.createTTLIndex();
    }

    /**
     * logAudit
     *
     * @param {Context} context
     * @param {string} entity
     * @param {string} status
     */
    logAudit(context, entity, status = 'SUCCESS') {
        const url = context.req.originalUrl;
        const userId = context.req.accessToken ? context.req.accessToken.userId : undefined;
        const method = context.req.method;
        const query = context.req.query ? JSON.stringify(context.req.query) : undefined;

        let statusCode = context.res ? context.res.statusCode : undefined;
        let errorDescription = undefined;
        if (status === 'ERROR') {
            if (context.error) {
                errorDescription = context.error;
                statusCode = context.error.statusCode;
            }
        }

        const audit = this.app.models.audit;
        audit.create({
            entity: entity,
            url,
            method,
            userId,
            query,
            status,
            statusCode,
            errorDescription,
        });
    }

    /**
     * createTTLIndex
     *
     * @return {Promise<void>}
     */
    async createTTLIndex() {
        const allIndexes = await this.app.dataSources['mongoDB'].connector.collection('audit').indexes();
        for (const index of allIndexes) {
            if (index.name === 'date_1') {
                await this.app.dataSources['mongoDB'].connector.collection('audit').dropIndex(index.name);
            }
        }

        await this.app.dataSources['mongoDB'].connector.collection('audit').createIndex( {'date': 1 }, { expireAfterSeconds: this.app.get('auditTTL') });
    }

    /**
     * logError
     *
     * @param {Context} context
     * @param {string} entity
     */
    logError(context, entity) {
        this.logAudit(context, entity, 'ERROR');
    }

    /**
     * find
     *
     * @param {Object} filter
     *
     * @return {Promise<*[]>}
     */
    async find(filter) {
        const aggregation = [
            {
                '$lookup': {
                    from: 'member',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'members',
                },
            }, {
                '$project': {
                    _id: 1,
                    entity: 1,
                    url: 1,
                    method: 1,
                    query: 1,
                    status: 1,
                    statusCode: 1,
                    errorDescription: 1,
                    date: 1,
                    member: {$arrayElemAt: ['$members', 0]},
                },
            }, {
                '$match': {},
            },
            {
                '$project': {
                    _id: 1,
                    entity: 1,
                    url: 1,
                    method: 1,
                    query: 1,
                    status: 1,
                    statusCode: 1,
                    errorDescription: 1,
                    date: 1,
                    member: {
                        username: 1,
                    },
                },
            },
        ];

        if (filter.where) {
            const whereFilter = {};
            Object.keys(filter.where).forEach((el) => {
                whereFilter[el] = {'$regex': new RegExp(escapeStringRegex(`${filter.where[el]}`), 'i')};
            });

            aggregation[2] = {
                '$match': whereFilter,
            };
        }

        if (filter.order) {
            aggregation.push({
                '$sort': filter.order,
            });
        }

        if (filter.skip) {
            aggregation.push({
                '$skip': filter.skip,
            });
        }

        if (filter.limit) {
            aggregation.push({
                '$limit': filter.limit,
            });
        }

        const cursor = await this.app.dataSources['mongoDB'].connector.collection('audit').aggregate(
            aggregation,
        );

        const queryResult = [];

        for await (const doc of cursor) {
            queryResult.push(doc);
        }

        return queryResult;
    }

    /**
     * count
     *
     * @param {Object} filter
     *
     * @return {number}
     */
    async count(filter) {
        const aggregation = [
            {
                '$lookup': {
                    from: 'member',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'members',
                },
            }, {
                '$project': {
                    _id: 1,
                    entity: 1,
                    url: 1,
                    method: 1,
                    query: 1,
                    status: 1,
                    statusCode: 1,
                    errorDescription: 1,
                    date: 1,
                    member: {$arrayElemAt: ['$members', 0]},
                },
            }, {
                '$match': {},
            },
            {
                '$project': {
                    _id: 1,
                    entity: 1,
                    url: 1,
                    method: 1,
                    query: 1,
                    status: 1,
                    statusCode: 1,
                    errorDescription: 1,
                    date: 1,
                    member: {
                        username: 1,
                    },
                },
            },
        ];

        if (filter.where) {
            const whereFilter = {};
            Object.keys(filter.where).forEach((el) => {
                whereFilter[el] = {'$regex': new RegExp(escapeStringRegex(`${filter.where[el]}`), 'i')};
            });

            aggregation[2] = {
                '$match': whereFilter,
            };
        }

        aggregation.push({
            '$count': 'count',
        });

        const cursor = await this.app.dataSources['mongoDB'].connector.collection('audit').aggregate(
            aggregation,
        );

        let queryResult = null;

        for await (const doc of cursor) {
            queryResult = doc;
        }

        return queryResult;
    }
};
