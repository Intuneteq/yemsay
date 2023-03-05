//import library
const path = require("path");
const express = require("express");
const multer = require("multer");

//Define consts
const router = express.Router();
const dest = path.join(__dirname, "../uploads");
const upload = multer({
  dest: dest,
  limits: {
    fileSize: 10485760,
    files: 5,
  },
});

//import middleware
const authentication = require("../middlewares/authentication");
const fileExtLimiter = require("../middlewares/fileExtLimiter");
const errorHandler = require("../middlewares/errorHandler");

//import controller
const { handleAddProperty } = require("../controllers/propertyController");

//get req

//post req
router.post(
  "/",
  authentication,
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "video", maxCount: 1 },
  ]),
  fileExtLimiter,
  handleAddProperty
);

//put or patch req

//delete req

// custom error handler to handle errors during file upload
router.use(errorHandler);

module.exports = router;
