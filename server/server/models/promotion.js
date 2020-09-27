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
//    along with Tower.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

const PromotionModel = require('./impl/promotion.js');

let promModel = null;

const initiate = (main) => {
    if (main.app !== undefined && main.app.booted) {
        promModel = new PromotionModel(main.app);
    } else {
        setTimeout( () => {
            initiate(main);
        }, 200);
    }
};

module.exports = function(promotion) {
    initiate(promotion);

    promotion.disableRemoteMethodByName('upsert'); // PATCH
    promotion.disableRemoteMethodByName('createChangeStream');

    promotion.patch = async (obj) => {
        return await promModel.patchObject(obj);
    };

    // ====================================================
    // ================ Remote methods ====================
    // ====================================================

    promotion.remoteMethod('patch', {
        http: {verb: 'PATCH', status: 200, path: '/'},
        accepts: [
            {arg: 'data', type: 'promotion', http: {source: 'body'}},
        ],
        description: 'Patch an existing model instance or insert a new one into the data source.',
        returns: {arg: 'promotion', type: 'promotion', root: true},
    });
};
