const express = require("express");
const router = express.Router();

//import middleware

//import controller
const { handleContactUs } = require("../controllers/mailing.controller");

//get req

//post req
router.post("/contact-us", handleContactUs);

//put or patch req

//delete req

module.exports = router;
