//library
const bcrypt = require("bcryptjs");

//models
const Profile = require("../models/profile.model");

//utils
const {
  handleAsync,
  handleError,
  handleResponse,
  createApiError,
} = require("../utils/helpers");

//helpers
const { createToken, verifyResetToken, generateSetPasswordLink } = require("../lib/token");
const { allTrue } = require("../lib/payload");
const { sendVerificationEmail } = require("../lib/mailingList");

const handleSignUp = handleAsync(async (req, res) => {
  const { fullName, email, password } = req.body;

  const payload = allTrue(email, password);
  if(!payload) throw createApiError('Incomplete payload', 422);

  //check if user exist
  const userExist = await Profile.findOne({ email: email.toLowerCase() }).exec();
  if (userExist) throw createApiError(`admin with ${email} already exist`, 409);

  //hash user password
  const hashedPasswd = await bcrypt.hash(password, 10);

  //create new admin profile
  try {
    const user = new Profile({
      fullName,
      email: email.toLowerCase(),
      password: hashedPasswd,
    });
    await user.save();
  } catch (error) {
    throw createApiError("server error", 500);
  }

  res
    .status(201)
    .json(handleResponse({ message: "user account " + email + " created." }));
});

const handleLogin = handleAsync(async (req, res) => {
  const { email, password } = req.body;

  const payload = allTrue(email, password);
  if(!payload) throw createApiError('Incomplete payload', 422);

  //find admin
  const user = await Profile.findOne({ email: email.toLowerCase() }).exec();
  if (!user) throw createApiError("user not found", 404);

  //match password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createApiError("Incorrect password", 401);

  //generate access token
  const accessToken = createToken(user._id);

  res
    .status(200)
    .json(
      handleResponse({ name: user.fullName, accessToken })
    );
});

const handleChangePassword = handleAsync(async(req, res) => {
  const {oldPassword, newPassword} = req.body;

  //find admin
  const user = await Profile.findOne({ email: req.user.email.toLowerCase() }).exec();
  if (!user) throw createApiError("user not found", 404);

  //match password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw createApiError("Incorrect password", 401);

   //hash user new password
   const hashedPasswd = await bcrypt.hash(newPassword, 10);

   user.password = hashedPasswd

   await user.save();

   res.status(200).json(handleResponse({}, "Password Changed Successfully"))
})

const handleEmailVerification = handleAsync(async(req, res) => {
  const { email } = req.body;

  //find admin
  const user = await Profile.findOne({ email: email.toLowerCase() }).exec();
  if (!user) throw createApiError("user not found", 404);

  const link = generateSetPasswordLink(user._id);

  const { error, errorMessage } = await sendVerificationEmail(email, link);

  if(error) throw createApiError(errorMessage, 500);

  res.status(200).json(handleResponse({}, "Password change Link sent to " + email))
});

const handleForgotPassword = handleAsync(async(req, res) => {
  const { password } = req.body;

  // Bearer Token from request
  const authHeader = req.headers.authorization;

  // Authenticate user
  if (!authHeader || !authHeader.startsWith("Bearer"))
    throw createApiError("authentication invalid", 401);

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      msg: "Token not authorized",
    });
  }

  // Verify Reset Token
  const { error, user } = verifyResetToken(token);
  if (error) throw createApiError("Expired token", 403);

  // Find user
  const foundUser = await Profile.findById(user.id);
  if (!foundUser) throw createApiError("user not found", 404);

  // Hash new password
  const hashedPwd = await bcrypt.hash(password, 10);

  // Update in db
  foundUser.password = hashedPwd;
  foundUser.save();

  res.status(201).json(handleResponse({}, "Password changed"));
})


module.exports = {
  handleSignUp,
  handleLogin,
  handleChangePassword,
  handleEmailVerification,
  handleForgotPassword,
  //check
};
