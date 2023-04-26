const express = require("express");
const router = express.Router();

//import middleware
const authentication = require("../middlewares/authentication");

//import controller
const {
  handleSignUp,
  handleLogin,
  handleChangePassword,
  handleEmailVerification,
  handleForgotPassword,
} = require("../controllers/auth.controller");

//get req

//post req
// router.post("/signup", handleSignUp);
router.post("/signin", handleLogin);
router.post("/email-verification", handleEmailVerification);

//put or patch req
router.patch("/change-password", authentication, handleChangePassword);
router.patch("/forgot-password", handleForgotPassword);

//delete req

module.exports = router;
