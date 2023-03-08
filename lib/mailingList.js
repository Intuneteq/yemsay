let { verifyTransPorter, sendMail } = require("../utils/mailing");

const sendContactUsMail = async ({ name, email, phoneNumber, message }) => {
  const verify = await verifyTransPorter();
  if (verify) {
    //mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: "tobiolanitori@gmail.com",
      subject: "Contact Us",
      template: "contactUs",
      context: { name, message, email, phoneNumber },
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
  if (verify) {
    //mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: "tobiolanitori@gmail.com",
      subject: "Book Appointment",
      template: "appointment",
      context: {
        firstName,
        lastName,
        email,
        phoneNumber,
        location,
        inspectionDate,
        inspectionTime,
        message,
      },
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

module.exports = { sendContactUsMail, sendAppointmentMail };
