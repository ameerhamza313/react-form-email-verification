const tedious = require('tedious');
const { Sequelize } = require('sequelize');

const { dbName, dbConfig } = require('config.json');

module.exports = db = {};

initialize().catch(err => {
    console.error(err);
});

async function initialize() {
    try {
        const dialect = 'mssql';
        const host = dbConfig.server;
        const { userName, password } = dbConfig.authentication.options;

        // create db if it doesn't already exist
        await ensureDbExists(dbName);

        // connect to db
        const sequelize = new Sequelize(dbName, userName, password, { host, dialect });

        // init models and add them to the exported db object
        db.User = require('../users/user.model')(sequelize);

        // sync all models with database
        await sequelize.sync({ alter: true });
    } catch (err) {
        console.error(`Initialization Failed: ${err.message}`);
    }
}

async function ensureDbExists(dbName) {
    return new Promise((resolve, reject) => {
        const connection = new tedious.Connection(dbConfig);
        connection.connect((err) => {
            if (err) {
                console.error(err);
                return reject(`Connection Failed: ${err.message}`);
            }

            const createDbQuery = `IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${dbName}') CREATE DATABASE [${dbName}];`;
            const request = new tedious.Request(createDbQuery, (err) => {
                if (err) {
                    console.error(err);
                    return reject(`Create DB Query Failed: ${err.message}`);
                }

                // query executed successfully
                resolve();
            });

            connection.execSql(request);
        });
    });
}
