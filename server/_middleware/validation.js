const { body } = require("express-validator");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const validator = require("validator");

// Register Schema
const registerSchema = require("../_helpers/schemas/registerSchema");

// Login Schema
const loginSchema = require("../_helpers/schemas/loginSchema");

// Function to validate contact number
const validateContactNumber = (value) => {
  try {
    const phoneNumber = parsePhoneNumberFromString(value, "ZZ");
    return phoneNumber && phoneNumber.isValid();
  } catch (error) {
    return false;
  }
};

// Function to validate email using validator package
const validateEmail = (value, { req }) => {
  if (value && !validator.isEmail(value)) {
    throw new Error("Invalid email address");
  }
  return true;
};

module.exports = { validateContactNumber, validateEmail };
