let { verifyTransPorter, sendMail } = require("../utils/mailing");
const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");

const sendContactUsMail = async ({ name, email, phoneNumber, message }) => {
  const verify = await verifyTransPorter();

  //path
  const filePath = path.join(__dirname, "../handlebars/contactUs.handlebars");

  // Read the Handlebars template file
  const emailTemplateSource = fs.readFileSync(filePath, "utf8");

  // Compile the template
  const emailTemplate = handlebars.compile(emailTemplateSource);

  if (verify) {
    const mailOptions = {
      from: {
        name: "Yemsay's Contact Us",
        address: process.env.AUTH_EMAIL,
      },
      to: "yemsaysproperties@gmail.com",
      subject: "Contact Us",
      html: emailTemplate({
        name,
        email,
        phoneNumber,
        message,
      }),
    };

    try {
      await sendMail(mailOptions);
      return { error: false };
    } catch (error) {
      return { error: true };
    }
  } else {
    return { error: true };
  }
};

const sendAppointmentMail = async ({
  firstName,
  lastName,
  email,
  phoneNumber,
  location,
  inspectionDate,
  inspectionTime,
  message,
}) => {
  const verify = await verifyTransPorter();

  //path
  const filePath = path.join(__dirname, "../handlebars/appointment.handlebars");

  // Read the Handlebars template file
  const emailTemplateSource = fs.readFileSync(filePath, "utf8");

  // Compile the template
  const emailTemplate = handlebars.compile(emailTemplateSource);

  if (verify) {
    //mail options
    const mailOptions = {
      from: {
        name: "Yemsay's Appointments",
        address: process.env.AUTH_EMAIL,
      },
      to: "yemsaysproperties@gmail.com",
      subject: "Book Appointment",
      html: emailTemplate({
        firstName,
        lastName,
        email,
        phoneNumber,
        location,
        inspectionDate,
        inspectionTime,
        message,
      }),
    };

    try {
      await sendMail(mailOptions);
      return { error: false };
    } catch (error) {
      return { error: true };
    }
  } else {
    return { error: true };
  }
};

const sendVerificationEmail = async (email, link) => {
  let verify;
  try {
    verify = await verifyTransPorter();
  } catch (error) {
    console.log(error);
    return { error: true, errorMessage: error.message };
  }

  if (!verify) return { error: true, errorMessage: "" };

  //path
  const filePath = path.join(__dirname, "../handlebars/sendLink.handlebars");

  // Read the Handlebars template file
  const emailTemplateSource = fs.readFileSync(filePath, "utf8");

  // Compile the template
  const emailTemplate = handlebars.compile(emailTemplateSource);

  const mailOptions = {
    from: {
      name: "Yemsay",
      address: process.env.AUTH_EMAIL,
    },
    to: email,
    subject: "Email Verification",
    html: emailTemplate({ link }),
  };

  try {
    await sendMail(mailOptions);
    return { error: false, errorMessage: "" };
  } catch (error) {
    return { error: true, errorMessage: error.message };
  }
};

module.exports = {
  sendContactUsMail,
  sendAppointmentMail,
  sendVerificationEmail,
};
