const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../_helpers/db");
require("dotenv").config();

// Exported functions for user registration and login
module.exports = {
  register,
  login,
};

// Function to handle user login
async function login({ username, password }) {
  // Find user by username including the 'hash' attribute
  const user = await db.User.scope("withHash").findOne({ where: { username } });

  // Check if the user exists and the provided password is correct
  if (!user || !(await bcrypt.compare(password, user.hash))) {
    throw "Username or password is incorrect";
  }

  // Authentication successful, generate a JWT token
  const token = jwt.sign({ sub: user.id }, process.env.SECRET, {
    expiresIn: "1d",
  });

  // Return user information without the 'hash' and the generated token
  return { ...omitHash(user.get()), token };
}

// Function to handle user registration
async function register(params) {
  // Validate if the username is already taken
  const existingUsername = await db.User.findOne({
    where: { username: params.username },
  });
  if (existingUsername) {
    throw 'Username "' + params.username + '" is already taken';
  }

  // Validate if the email is already taken
  const existingEmail = await db.User.findOne({
    where: { email: params.email },
  });
  if (existingEmail) {
    throw 'Email "' + params.email + '" is already taken';
  }

  // Hash the password before saving it
  if (params.password) {
    params.hash = await bcrypt.hash(params.password, 10);
  }

  // Save the user in the database
  await db.User.create(params);
}

// Helper function to omit the 'hash' attribute from the user object
function omitHash(user) {
  const { hash, ...userWithoutHash } = user;
  return userWithoutHash;
}
