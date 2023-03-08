//library

//models

//utils
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");

//helpers
const { allTrue } = require("../lib/payload");
const { sendContactUsMail } = require("../lib/mailingList")

const handleContactUs = handleAsync(async (req, res) => {
  const { name, email, phoneNumber, message } = req.body;

  const payload = allTrue(name, email, phoneNumber, message);
  if (!payload) throw createApiError("Payload Incomplete", 422);

  const {error} = await sendContactUsMail(name, email, phoneNumber, message);
  if(error) throw createApiError('email not sent', 500);

  res.status(250).json(handleResponse({ message: "email sent" }));
});

module.exports = { handleContactUs };
