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

module.exports = function(app) {
    const Role = app.models.Role;

    const remotes = app.remotes();
    const baseAuth = remotes.authorization;
    remotes.authorization = async (context, next) => {
        const member = app.get('MemberInstance');
        const token = await member.basicAuthLogin(context);

        if (token === null) {
            let accessToken = null;
            if (context.args.options && context.args.options.accessToken) {
                accessToken = context.args.options.accessToken;
            } else if (context.req.query) {
                accessToken = context.req.query.access_token;
            }

            if (!accessToken) {
                let headerToken = null;
                for (const header of app.get('AuthorizationHeaders')) {
                    if (!headerToken) {
                        headerToken = context.req.headers[header.toLowerCase()];
                    }
                }

                if (headerToken) {
                    accessToken = headerToken;
                }
            }

            if (accessToken) {
                context.req.accessToken = accessToken;
                if (context.args.options === undefined) {
                    context.args.options = {};
                }
                context.args.options.accessToken = context.req.accessToken;
            }

            await baseAuth(context, next);
        } else {
            if (context.args.options === undefined) {
                context.args.options = {};
            }
            context.args.options.accessToken = token;
            context.req.accessToken = token;

            await baseAuth(context, next);
        }
    };

    const getAccessTokenDetails = async (app, token) => {
        return app.models.AccessToken.findById(token);
    };

    Role.registerResolver('groupSolver', async (_role, context) => {
        const logger = app.get('winston');

        logger.log('debug', `groupSolver => STARTED`);

        logger.log('debug', `groupSolver => MODEL: ${context.modelName}`);
        logger.log('debug', `groupSolver => PROPERTY: ${context.accessType}`);

        const member = app.get('MemberInstance');

        let tokenWithDetails = context.accessToken;

        if (typeof tokenWithDetails === 'string') {
            tokenWithDetails = await getAccessTokenDetails(app, context.accessToken);
        }

        if (!tokenWithDetails || !tokenWithDetails.userId) {
            return false;
        }

        const roles = await member.getUserRoles(tokenWithDetails.userId);

        if (roles.includes('admin')) {
            logger.log('debug', `groupSolver => FINISHED`);
            return true;
        }

        let model = context.modelName;
        let access = context.accessType;

        if (access === 'READ') {
            access = 'view';
        } else {
            access = 'modify';
        }

        if (model === 'v1') {
            model = 'configuration';
            access = 'view';
        } else if (model === 'constantVariable') {
            model = 'configurationModel';
        }

        let hasPermissions = false;
        const roleToCheck = `${model}.${access}`;

        roles.forEach((role) => {
            if (role === roleToCheck) {
                hasPermissions = true;
            }
        });

        logger.log('debug', `groupSolver => FINISHED`);

        return hasPermissions;
    });
};
