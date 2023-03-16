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

'use strict';

const HttpErrors = require('http-errors');
const Interpreter = require('./impl/template/interpreter');
const V1 = require('./impl/v1.js');

let v1Model = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted) {
        v1Model = new V1(main.app, 'v1');
    } else {
        setTimeout(() => {
            initiate(main);
        }, 1000);
    }
};

module.exports = function(V1) {
    initiate(V1);

    V1.afterRemote('*', (context, unused, next) => {
        const audit = V1.app.get('AuditInstance');
        audit.logAudit(context, 'V1');
        next();
    });

    V1.afterRemoteError('*', (context, next) => {
        const audit = V1.app.get('AuditInstance');
        audit.logError(context, 'V1');
        next();
    });

    V1.disableRemoteMethodByName('upsert');
    V1.disableRemoteMethodByName('upsertWithWhere');
    V1.disableRemoteMethodByName('update');
    V1.disableRemoteMethodByName('find');
    V1.disableRemoteMethodByName('replaceOrCreate');
    V1.disableRemoteMethodByName('create');

    V1.disableRemoteMethodByName('prototype.updateAttributes');
    V1.disableRemoteMethodByName('findById');
    V1.disableRemoteMethodByName('exists');
    V1.disableRemoteMethodByName('replaceById');
    V1.disableRemoteMethodByName('deleteById');

    V1.disableRemoteMethodByName('createChangeStream');

    V1.disableRemoteMethodByName('count');
    V1.disableRemoteMethodByName('findOne');

    V1.getConfiguration = async (data, options) => {
        V1.app.get('winston').log('debug', 'V1.getConfiguration STARTED');

        let url = data.params[0];
        const query = data.query;

        if (url.indexOf('?') !== -1) {
            url = url.substring(0, url.indexOf('?'));
        }

        const configurations = await v1Model.matchConfigurationURL(url);
        let variables = {};
        let usedConfig = {
            templateType: 'json',
        };
        for (let i = 0; i < configurations.length; i++) {
            variables = await v1Model.getDataFromConfiguration(configurations[i], url, options);
            usedConfig = configurations[i];
            if (variables.variables !== undefined) {
                if (query.include !== undefined) {
                    const regex = new RegExp(query.include);
                    variables.variables = variables.variables.filter((el) => {
                        return regex.test(el.name);
                    });
                }
                if (query.exclude !== undefined) {
                    const regex = new RegExp(query.exclude);
                    variables.variables = variables.variables.filter((el) => {
                        return !regex.test(el.name);
                    });
                }
                i = configurations.length;
            }
        }

        let output = [];

        if (variables.variables !== undefined && variables.variables.length !== 0) {
            const returns = usedConfig.returnType === 'json';
            const inter = new Interpreter(usedConfig.template, variables, returns, []);
            output = await inter.handle();
        }

        if (output.length === 0) {
            throw new HttpErrors.NotFound();
        } else {
            // removing new line at the end of output
            output = output.replace(/\s+$/, '');
        }

        let contentType = 'application/json';
        if (usedConfig.returnType === 'plain text') {
            contentType = 'text/plain';
        } else if (usedConfig.returnType === 'xml') {
            contentType = 'text/xml';
        }

        return [output, contentType];
    };

    V1.remoteMethod('getConfiguration', {
        http: {
            errorStatus: 500,
            path: '/**',
        },
        description: 'Returns configuration',
        accepts: [{
            'arg': 'data',
            'type': 'object',
            'http': {
                source: 'req',
            },
        },
        {
            arg: 'options',
            type: 'object',
            http: 'optionsFromRequest',
        },
        ],
        returns: [{
            'arg': 'type',
            'type': 'file',
            'root': true,
        },
        {
            'arg': 'Content-Type',
            'type': 'string',
            'http': {
                target: 'header',
            },
        },
        ],
    });
};
