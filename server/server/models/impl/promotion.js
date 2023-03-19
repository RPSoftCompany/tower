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

module.exports = class Promotion {
    /**
     * Constructor
     *
     * @param {object} app APP
     */
    constructor(app) {
        this.configurationName = 'promotion';
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
     * Patch promotion object
     *
     * @param {promotion} obj object to patch
     *
     */
    async patchObject(obj) {
        this.log('debug', 'patchObject', 'STARTED');

        obj.id = undefined;

        const promotion = this.app.models.promotion;
        const find = await promotion.findOne({
            where: {
                base: obj.base,
                fromModel: obj.fromModel,
            },
        });

        if (find !== null && find !== undefined) {
            find.updateAttributes(obj);

            this.log('debug', 'patchObject', 'FINISHED');
            return find;
        } else {
            obj.save();

            this.log('debug', 'patchObject', 'FINISHED');
            return obj;
        }
    };
};
