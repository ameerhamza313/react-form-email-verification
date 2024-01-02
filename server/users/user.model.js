const { DataTypes } = require('sequelize');

// Export the model function for use in other files
module.exports = model;

// Model function to define the User model using Sequelize
function model(sequelize) {
    // Define the attributes (fields) of the User model
    const attributes = {
        username: { type: DataTypes.STRING, allowNull: false },
        contact: { type: DataTypes.BIGINT, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        hash: { type: DataTypes.STRING, allowNull: false },
        emailVerification: { type: DataTypes.BOOLEAN, allowNull: false }
    };

    // Define options for the User model
    const options = {
        // Default scope: exclude hash attribute by default
        defaultScope: {
            attributes: { exclude: ['hash'] }
        },
        // Scopes: additional scopes for the model
        scopes: {
            // Scope to include hash attribute
            withHash: { attributes: {} }
        }
    };

    // Define and return the 'User' model using Sequelize
    return sequelize.define('User', attributes, options);
}
