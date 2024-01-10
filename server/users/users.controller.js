const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../_helpers/db");
require("dotenv").config();
const emailService = require("./email.service");
const validateRequest = require("../_middleware/validate-request");
const { body, validationResult } = require("express-validator");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const validator = require("validator");

// Register Schema
const registerSchema = Joi.object({
  username: Joi.string().required(),
  contact: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmpassword: Joi.string().min(6).required(),
});

// Login Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Register Route
router.post(
  "/register",
  validateData,
  storeData,
  [
    body("username")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 16 })
      .withMessage("Username should be between 3 and 16 characters")
      .custom((value) => {
        // Check for numbers
        if (/\d/.test(value)) {
          throw new Error("Numbers are not allowed in the username");
        }

        // Check for special characters
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (specialCharRegex.test(value)) {
          throw new Error("Special characters are not allowed in the username");
        }

        // Check for blank spaces
        if (/\s/.test(value)) {
          throw new Error("Blank spaces are not allowed in the username");
        }

        // Check for other characters
        if (
          !validator.isWhitelisted(
            value,
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ."
          )
        ) {
          throw new Error(
            "Only letters and dot (.) are allowed in the username"
          );
        }

        return true;
      }),
    body("contact")
      .custom((value) => validateContactNumber(value))
      .withMessage("Invalid contact number"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address")
      .bail()
      .custom((value, { req }) => validateEmail(value, { req })),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .custom((value) => {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password should be min 8 char long (include at least 1 letter, 1 number, and 1 special character)"
          );
        }
        return true;
      }),
    body("confirmpassword")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Confirm Password is required")
      .isLength({ min: 6 })
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match"),
  ],
  validateRequest(registerSchema),
  register
);
// Login Route
router.post("/login", validateRequest(loginSchema), login);

// Verify Email Route
router.get("/verify", verifyEmail);

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

// Function to handle user registration
async function register(req, res, next) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors
        .array()
        .map((error) => error.msg)
        .join(", "),
    });
  }

  try {
    // Check if the username is already taken
    const existingUsername = await db.User.findOne({
      where: { username: req.body.username },
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Check if the email is already taken
    const existingEmail = await db.User.findOne({
      where: { email: req.body.email },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user in the database
    const newUser = await db.User.create({
      username: req.body.username,
      contact: req.body.contact,
      email: req.body.email,
      hash: hashedPassword,
      emailVerification: false,
    });

    // Send verification email
    await emailService.sendVerificationEmail(newUser.email, newUser.id);

    res.json({ message: "Registration successful. Verification email sent." });
  } catch (error) {
    next(error);
  }
}

// Function to handle email verification
async function verifyEmail(req, res, next) {
  try {
    const token = req.query.token;

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.SECRET);

    // Update the user's emailVerification status in the database
    const user = await db.User.findByPk(decodedToken.sub);
    if (user) {
      if (!user.emailVerification) {
        user.emailVerification = true;
        await user.save();

        // Include a login link in the response
        const loginLink = "http://localhost:3000/login"; // Replace with your actual login link
        const htmlResponse = `
                    <p>Email verification successful. You can now log in.</p> <a href="${loginLink}">Login</a>
                `;

        res.send(htmlResponse);
      } else {
        // Email has already been verified
        res.send(`
                <p>Email has already been verified. You can now log in.</p> <a href="http://localhost:3000/login">Login</a>
            `);
      }
    } else {
      // User not found
      res.status(404).send("User not found");
    }
  } catch (error) {
    next(error);
  }
}

// Function to handle user login
async function login(req, res, next) {
  try {
    // Validate the request body for login
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details.map((x) => x.message).join(", ") });
    }

    // Check if the user with the provided email exists
    const user = await db.User.scope("withHash").findOne({
      where: { email: req.body.email },
    });
    if (!user || !(await bcrypt.compare(req.body.password, user.hash))) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    }

    // Check if the user's email is verified
    if (!user.emailVerification) {
      return res.status(401).json({ message: "Email is not verified" });
    }

    // Generate JWT token for authentication
    const token = jwt.sign({ sub: user.id }, process.env.SECRET, {
      expiresIn: "1d",
    });

    // Respond with a success message and the token
    res.json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
}

module.exports = router;
