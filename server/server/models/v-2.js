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

let v2Model = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted) {
        v2Model = new V1(main.app, 'v2');
    } else {
        setTimeout(() => {
            initiate(main);
        }, 1000);
    }
};

module.exports = function(V2) {
    initiate(V2);

    V2.afterRemote('*', (context, unused, next) => {
        const audit = V2.app.get('AuditInstance');
        audit.logAudit(context, 'V2');
        next();
    });

    V2.afterRemoteError('*', (context, next) => {
        const audit = V2.app.get('AuditInstance');
        audit.logError(context, 'V2');
        next();
    });

    V2.disableRemoteMethodByName('upsert');
    V2.disableRemoteMethodByName('upsertWithWhere');
    V2.disableRemoteMethodByName('update');
    V2.disableRemoteMethodByName('find');
    V2.disableRemoteMethodByName('replaceOrCreate');
    V2.disableRemoteMethodByName('create');

    V2.disableRemoteMethodByName('prototype.updateAttributes');
    V2.disableRemoteMethodByName('findById');
    V2.disableRemoteMethodByName('exists');
    V2.disableRemoteMethodByName('replaceById');
    V2.disableRemoteMethodByName('deleteById');

    V2.disableRemoteMethodByName('createChangeStream');

    V2.disableRemoteMethodByName('count');
    V2.disableRemoteMethodByName('findOne');

    V2.getConfiguration = async (data, options) => {
        V2.app.get('winston').log('debug', 'V2.getConfiguration STARTED');

        let url = data.params[0];
        const query = data.query;

        if (url.indexOf('?') !== -1) {
            url = url.substring(0, url.indexOf('?'));
        }

        const configurations = await v2Model.matchConfigurationURL(url);
        let variables = {};
        let usedConfig = {
            templateType: 'json',
        };
        for (let i = 0; i < configurations.length; i++) {
            variables = await v2Model.getDataFromConfiguration(configurations[i], url, options);
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
            output = inter.handle();
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

    V2.remoteMethod('getConfiguration', {
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
