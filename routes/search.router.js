const express = require("express");
const router = express.Router();

//import middleware

//import controller
const { handleSearchQuery } = require("../controllers/search.controller");

//get req

//post req
router.get("/", handleSearchQuery);

//put or patch req

//delete req

module.exports = router;
