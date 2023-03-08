const express = require("express");
const router = express.Router();

//import middleware

//import controller
const { handleSignUp, handleLogin } = require("../controllers/authController");

//get req

//post req
router.post("/signup", handleSignUp);
router.post("/signin", handleLogin);

//put or patch req

//delete req

module.exports = router;
