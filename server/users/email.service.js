const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
// const { secret, email_id, passcode} = require('../config.json');
require('dotenv').config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASSCODE
  }
});


function sendVerificationEmail(email, userId) {
  const token = jwt.sign(
      { sub: userId },
      process.env.SECRET,
      { expiresIn: '10m' }
  );

  const verificationLink = `http://localhost:4000/users/verify?token=${token}`;

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

  transporter.sendMail(mailConfigurations, function (error, info) {
      if (error) {
          console.error('Error sending email:', error);
      } else {
          console.log('Email Sent Successfully');
          console.log(info);
      }
  });
}

module.exports = {
  sendVerificationEmail
};
