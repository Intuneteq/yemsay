const path = require("path");

const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

const handlebarOptions = {
  viewEngine: {
    defaultLayout: false,
    extName: ".handlebars",
    partialsDir: path.resolve(__dirname, "..", "handlebars"),
  },
  viewPath: path.resolve(__dirname, "..", "handlebars"),
  extName: ".handlebars",
};

transporter.use("compile", hbs(handlebarOptions));

const verifyTransPorter = async () => await transporter.verify();

const sendMail = async (mailOptions) => await transporter.sendMail(mailOptions);

module.exports = { verifyTransPorter, sendMail };