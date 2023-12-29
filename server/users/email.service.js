const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a nodemailer transporter using Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASSCODE
  }
});

// Function to send a verification email
function sendVerificationEmail(email, userId) {
  // Generate a JWT token with user ID as the subject, set to expire in 10 minutes
  const token = jwt.sign(
    { sub: userId },
    process.env.SECRET,
    { expiresIn: '10m' }
  );

  // Create the verification link using the generated token
  const verificationLink = `http://localhost:4000/users/verify?token=${token}`;

  // Define email configurations
  const mailConfigurations = {
    from: process.env.EMAIL_ID,
    to: email,
    subject: 'Email Verification',
    html: `
      <p>Hi there!</p>
      <p>You have recently visited our website and entered your email. Please click the link below to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>Thanks</p>
    `
  };

  // Send the email using the nodemailer transporter
  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email Sent Successfully');
      console.log(info);
    }
  });
}

// Export the function for external use
module.exports = {
  sendVerificationEmail
};
