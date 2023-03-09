//import library
const path = require("path");
const express = require("express");
const multer = require("multer");

//Define consts
const router = express.Router();
const dest = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: dest,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
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
  handleGetAdminPropertyById,
  handleDashboard,
  handlePropertyListing,
  handleEditProperty,
  handleListedLands,
  handleListedHouses,
  handleGetProperty,
  handleAddReview
} = require("../controllers/property.controller");

//get req
router.get("/lands", handleListedLands)
router.get("/houses", handleListedHouses)
router.get("/admin", authentication, handleGetAllProperties);
router.get("/admin/dashboard", authentication, handleDashboard);
router.get("/admin/:propertyId", authentication, handleGetAdminPropertyById);
router.get("/:propertyId", handleGetProperty)

//post req
router.post(
  "/admin",
  authentication,
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "video", maxCount: 1 },
  ]),
  fileExtLimiter,
  handleAddProperty
);
router.post('/review/:propertyId', handleAddReview);

//put or patch req
router.patch("/admin/listing/:propertyId", authentication, handlePropertyListing);
router.put(
  "/admin/:propertyId",
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
