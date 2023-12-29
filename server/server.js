// Import the 'rootpath' module to set the root path for relative imports
require('rootpath')();

// Import necessary modules and libraries
const express = require('express');
const app = express();
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

// Middleware setup: Parse JSON and URL-encoded data, enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API routes setup: Mount the users controller for '/users' endpoint
app.use('/users', require('./users/users.controller'));

// Global error handler: Handle errors globally using the defined errorHandler middleware
app.use(errorHandler);

// Start server: Set the port based on the environment (production or development)
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));
