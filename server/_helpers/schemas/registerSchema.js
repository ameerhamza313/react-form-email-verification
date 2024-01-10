const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().required(),
  contact: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmpassword: Joi.string().min(6).required(),
});

module.exports = registerSchema;
