//import library
const path = require("path");
const express = require("express");
const multer = require("multer");

//Define consts
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15485760,
    files: 6,
  },
});

//import middleware
const authentication = require("../middlewares/authentication");
const {
  fileExtLimiter,
  fileEditExtLimiter,
} = require("../middlewares/fileExtLimiter");
const errorHandler = require("../middlewares/errorHandler");

//import controller
const {
  handleAddProperty,
  handleGetProperties,
  handleGetAllProperties, // Deprecating soon
  handleGetAdminPropertyById,
  handleDashboard,
  handlePropertyListing,
  handleEditProperty,
  handleListedLands,
  handleListedHouses,
  handleGetProperty,
  handleAddReview,
  handleUploadWithUrl,
  handleGetLatestProperties,
  handleBannerDetails,
  handleDeleteProperty
} = require("../controllers/property.controller");

//get req
router.get("/lands", handleListedLands);
router.get("/houses", handleListedHouses);
router.get("/recent", handleGetLatestProperties);
router.get("/banner", handleBannerDetails);
router.get("/admin", authentication, handleGetAllProperties);
router.get("/admin/dashboard", authentication, handleDashboard);
router.get("/admin/:propertyId", authentication, handleGetAdminPropertyById);
router.get("/admin/:propertyType/status/:propertyStatus", authentication, handleGetProperties);
router.get("/:propertyId", handleGetProperty);

//post req
router.post(
  "/admin",
  authentication,
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "video", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  fileExtLimiter,
  handleAddProperty
);
router.post("/admin/signed-url", authentication, handleUploadWithUrl);
router.post("/review/:propertyId", handleAddReview);

//put or patch req
router.patch(
  "/admin/listing/:propertyId",
  authentication,
  handlePropertyListing
);
router.put(
  "/admin/:propertyId",
  authentication,
  upload.fields([
    { name: "images", maxCount: 4 },
    { name: "video", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  fileEditExtLimiter,
  handleEditProperty
);

//delete req
router.delete('/:propertyId', authentication, handleDeleteProperty);

// custom error handler to handle errors during file upload
router.use(errorHandler);

module.exports = router;
