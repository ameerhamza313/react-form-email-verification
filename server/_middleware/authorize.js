const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize() {
    return [
        // Authenticate JWT token and attach decoded token to request as req.user
        jwt({ secret, algorithms: ['HS256'] }),

        // Attach full user record to request object
        async (req, res, next) => {
            try {
                // Get user with id from token 'sub' (subject) property
                const user = await db.User.findByPk(req.user.sub);

                // Check if the user still exists
                if (!user) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                // Authorization successful
                req.user = user.get();
                next();
            } catch (error) {
                // Handle unexpected errors
                console.error('Authorization error:', error.message);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    ];
}
