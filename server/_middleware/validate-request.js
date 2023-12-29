module.exports = validateRequest;

// Validation Middleware
function validateRequest(schema) {
    return (req, res, next) => {
        const options = {
            abortEarly: false, // Include all errors
            allowUnknown: true, // Ignore unknown props
            stripUnknown: true // Remove unknown props
        };

        const { error, value } = schema.validate(req.body, options);

        if (error) {
            // Validation error
            return res.status(400).json({ message: `Validation error: ${error.details.map(x => x.message).join(', ')}` });
        } else {
            // Validation successful
            req.body = value;
            next();
        }
    };
}