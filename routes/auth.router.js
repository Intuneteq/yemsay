const express = require("express");
const router = express.Router();

//import middleware

//import controller
const { handleSignUp, handleLogin, handleChangePassword } = require("../controllers/auth.controller");

//get req

//post req
// router.post("/signup", handleSignUp);
router.post("/signin", handleLogin);

//put or patch req
router.patch("/change-password")

//delete req

module.exports = router;
