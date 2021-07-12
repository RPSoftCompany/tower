'use strict';
const Promise = require('bluebird');

module.exports = function(server) {
    Promise.each(server.models(), function(model) {
        if (model.dataSource) {
            const autoupdate = Promise.promisify(model.dataSource.autoupdate);
            if (autoupdate) {
                return autoupdate.call(model.dataSource, model.modelName);
            }
        }
    });
};
