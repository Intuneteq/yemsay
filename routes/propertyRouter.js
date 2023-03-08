//import library
const path = require("path");
const express = require("express");
const multer = require("multer");

//Define consts
const router = express.Router();
const dest = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  dest: dest,
  storage: storage,
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
const {
  handleAddProperty,
  handleGetAllProperties,
  handleGetPropertyById,
  handleDashboard,
  handlePropertyListing,
  handleEditProperty,
} = require("../controllers/propertyController");

//get req
router.get("/", authentication, handleGetAllProperties);
router.get("/dashboard", authentication, handleDashboard);
router.get("/:propertyId", authentication, handleGetPropertyById);

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
router.patch("/listing/:propertyId", authentication, handlePropertyListing);
router.put(
  "/:propertyId",
  authentication,
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "video", maxCount: 1 },
  ]),
  fileExtLimiter,
  handleEditProperty
);

//delete req

// custom error handler to handle errors during file upload
router.use(errorHandler);

module.exports = router;
