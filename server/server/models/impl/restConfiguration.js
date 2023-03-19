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

module.exports = class RestConfiguration {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'restConfiguration';
        this.logger = null;

        this.app = app;
    }

    /**
     * logger
     *
     * @param {string} severity Severity
     * @param {string} method current method
     * @param {string} message Message to log
     * @param {string} obj object to log
     *
     */
    log(severity, method, message, obj) {
        if (this.logger === null) {
            this.logger = this.app.get('winston');
        }

        if (obj !== undefined) {
            this.logger.log(severity, `${this.configurationName}.${method} ${message}`, obj);
        } else {
            this.logger.log(severity, `${this.configurationName}.${method} ${message}`);
        }
    }

    /**
     * create rest Configuration
     *
     * @param {restConfiguration} restConfig new rest configuration
     *
     * @return {restConfiguration} created model
     */
    async createRestConfiguration(restConfig) {
        this.log('debug', 'createRestConfiguration', 'STARTED');

        const restConfiguration = this.app.models.restConfiguration;
        const all = await restConfiguration.count();

        restConfig.sequenceNumber = all;

        await restConfig.save();

        this.log('debug', 'createRestConfiguration', 'FINISHED');

        return restConfig;
    }

    /**
     * change sequence of rest configurations
     *
     * @param {restConfiguration} restConfig changed rest config
     */
    async changeSequence(restConfig) {
        this.log('debug', 'changeSequence', 'STARTED');

        const restConfiguration = this.app.models.restConfiguration;
        const all = await restConfiguration.find({
            order: 'sequenceNumber ASC',
        });

        const tempArray = [];
        let newRest = null;

        for (const rest of all) {
            if (restConfig.url !== rest.url) {
                tempArray.push(rest);
            } else {
                rest.sequenceNumber = restConfig.sequenceNumber;
                newRest = rest;
            }
        };

        tempArray.splice(restConfig.sequenceNumber, 0, newRest);

        for (let i = 0; i < tempArray.length; i++) {
            const rest = tempArray[i];

            rest.sequenceNumber = i;
            await rest.save();
        }

        this.log('debug', 'changeSequence', 'FINISHED');
    };

    /**
     * Delete rest configuration
     *
     * @param {String} id id of rest configuration to delete
     */
    async deleteRestConfiguration(id) {
        this.log('debug', 'deleteRestConfiguration', 'STARTED');

        const restConfiguration = this.app.models.restConfiguration;
        await restConfiguration.destroyById(id);

        const all = await restConfiguration.find({
            order: 'sequenceNumber ASC',
        });

        for (let i = 0; i < all.length; i++) {
            const rest = all[i];
            rest.sequenceNumber = i;
            await rest.save();
        };

        this.log('debug', 'deleteRestConfiguration', 'FINISHED');
    };
};
