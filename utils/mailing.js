const nodemailer = require("nodemailer");

// Set up the Nodemailer transporter
let transporter = nodemailer.createTransport({
  // host: "smtp-mail.outlook.com",
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

const verifyTransPorter = async () => await transporter.verify();

const sendMail = async (mailOptions) => await transporter.sendMail(mailOptions);

module.exports = { verifyTransPorter, sendMail };
