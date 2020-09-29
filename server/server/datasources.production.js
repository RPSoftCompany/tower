const fs = require('file-system');
const path = require('path');

let config = fs.readFileSync(path.join(path.dirname(process.execPath), 'database-config.json')).toString();

config = JSON.parse(config);

const db = {
    db: {
        name: 'db',
        connector: 'memory',
    },
};

config.mongoDB.useNewUrlParser = true;
config.mongoDB.useUnifiedTopology = true;
config.mongoDB.name = 'mongoDB';
config.mongoDB.connector = 'mongodb';

db.mongoDB = config.mongoDB;

module.exports = db;
