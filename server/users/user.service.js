const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
require('dotenv').config();

module.exports = {
    register,
    login
};

async function login({ username, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.hash)))
        throw 'Username or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, process.env.SECRET, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function register(params) {
    // validate
    const existingUsername = await db.User.findOne({ where: { username: params.username } });
    if (existingUsername) {
        throw 'Username "' + params.username + '" is already taken';
    }

    const existingEmail = await db.User.findOne({ where: { email: params.email } });
    if (existingEmail) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // save user
    await db.User.create(params);

}

// Other helper functions 

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}
