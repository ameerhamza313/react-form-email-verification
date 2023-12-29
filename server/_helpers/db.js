const tedious = require('tedious');
const { Sequelize } = require('sequelize');

// Load the database configuration from config.json
const { dbName, dbConfig } = require('config.json');

// Initialize an empty object to store Sequelize models
module.exports = db = {};

// Call the initialize function and catch any errors
initialize().catch(err => {
    console.error(err);
});

// Function to initialize the Sequelize connection and models
async function initialize() {
    try {
        // Extract required parameters from the database configuration
        const dialect = 'mssql';
        const host = dbConfig.server;
        const { userName, password } = dbConfig.authentication.options;

        // Create the database if it doesn't already exist
        await ensureDbExists(dbName);

        // Connect to the database using Sequelize
        const sequelize = new Sequelize(dbName, userName, password, { host, dialect });

        // Initialize models and add them to the exported db object
        db.User = require('../users/user.model')(sequelize);

        // Sync all models with the database (alter: true will modify existing tables)
        await sequelize.sync({ alter: true });
    } catch (err) {
        console.error(`Initialization Failed: ${err.message}`);
    }
}

// Function to ensure that the specified database exists
async function ensureDbExists(dbName) {
    return new Promise((resolve, reject) => {
        // Create a connection to the database server
        const connection = new tedious.Connection(dbConfig);

        // Attempt to connect to the server
        connection.connect((err) => {
            if (err) {
                console.error(err);
                return reject(`Connection Failed: ${err.message}`);
            }

            // SQL query to create the database if it doesn't exist
            const createDbQuery = `IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${dbName}') CREATE DATABASE [${dbName}];`;

            // Create a SQL request to execute the query
            const request = new tedious.Request(createDbQuery, (err) => {
                if (err) {
                    console.error(err);
                    return reject(`Create DB Query Failed: ${err.message}`);
                }

                // Query executed successfully, resolve the promise
                resolve();
            });

            // Execute the SQL request
            connection.execSql(request);
        });
    });
}
