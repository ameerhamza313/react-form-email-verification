const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../_helpers/db');
require('dotenv').config();
const emailService = require('./email.service');
const validateRequest = require('../_middleware/validate-request');

// Register Schema
const registerSchema = Joi.object({
    username: Joi.string().required(),
    contact: Joi.string().min(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmpassword: Joi.string().min(6).required()
});

// Login Schema
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

// Register Route
router.post('/register', validateRequest(registerSchema), register);

// Login Route
router.post('/login', validateRequest(loginSchema), login);

// Verify Email Route
router.get('/verify', verifyEmail);

// Function to handle user registration
async function register(req, res, next) {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details.map(x => x.message).join(', ') });
    }

    const existingUsername = await db.User.findOne({ where: { username: req.body.username } });
    if (existingUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
    }

    const existingEmail = await db.User.findOne({ where: { email: req.body.email } });
    if (existingEmail) {
        return res.status(400).json({ message: 'Email is already taken' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try {
        // Create a new user in the database
        const newUser = await db.User.create({
            username: req.body.username,
            contact: req.body.contact,
            email: req.body.email,
            hash: hashedPassword,
            emailVerification: false
        });

        // Send verification email
        await emailService.sendVerificationEmail(newUser.email, newUser.id);

        res.json({ message: 'Registration successful. Verification email sent.' });
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
                res.send('Email verification successful. You can now log in.');
            } else {
                res.send('Email has already been verified. You can log in.');
            }
        } else {
            res.status(404).send('User not found');
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
            return res.status(400).json({ message: error.details.map(x => x.message).join(', ') });
        }

        // Check if the user with the provided email exists
        const user = await db.User.scope('withHash').findOne({ where: { email: req.body.email } });
        if (!user || !(await bcrypt.compare(req.body.password, user.hash))) {
            return res.status(401).json({ message: 'Email or password is incorrect' });
        }

        // Check if the user's email is verified
        if (!user.emailVerification) {
            return res.status(401).json({ message: 'Email is not verified' });
        }

        // Generate JWT token for authentication
        const token = jwt.sign({ sub: user.id }, process.env.SECRET, { expiresIn: '1d' });

        // Respond with a success message and the token
        res.json({ message: 'Login successful', token });
    } catch (error) {
        next(error);
    }
}

module.exports = router;
