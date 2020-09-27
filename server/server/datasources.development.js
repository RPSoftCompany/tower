module.exports = {
    db: {
        name: 'db',
        connector: 'memory',
    },
    mongoDB: {
        url: 'mongodb://mongo:27017/docker',
        name: 'mongoDB',
        connector: 'mongodb',
    },
};
