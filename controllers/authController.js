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
const { createToken } = require("../lib/token");

const handleSignUp = handleAsync(async (req, res) => {
  const { email, password } = req.body;

  //check if user exist
  const userExist = await Profile.findOne({ email }).exec();
  if (userExist) throw createApiError("user with email already exist", 400);

  //hash user password
  const hashedPasswd = await bcrypt.hash(password, 10);

  //create new admin profile
  try {
    const user = new Profile({
      email,
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

  //find admin
  const user = await Profile.findOne({ email }).exec();
  if (!user) throw createApiError("user not found", 404);

  //match password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createApiError("Incorrect password", 401);

  //generate access token
  const accessToken = createToken(user._id);

  res
    .status(200)
    .json(
      handleResponse({ message: email + " Sign In Successful", accessToken })
    );
});

module.exports = {
  handleSignUp,
  handleLogin,
};
