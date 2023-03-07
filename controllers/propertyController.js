//models
const Properties = require("../models/properties");

//utils
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");

//helpers
const { allTrue } = require("../lib/payload");
const { uploadProperty } = require('../lib/propertyHelpers');

const handleAddProperty = handleAsync(async (req, res) => {
  const user = req.user;
  const images = req.files.images;
  const video = req.files.video[0];
  const { title, location, price, propertyType, description, tags, features } =
    req.body;

  const payload = allTrue(
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features
  );
  if (!payload) throw createApiError("Payload Incomplete", 422);

  const propertyMedia = [...images, video];
  const publicUrls = await uploadProperty(propertyMedia);

  const newProperty = new Properties({
    adminId: user._id,
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features,
    media: {
      imgs: [publicUrls[0], publicUrls[1], publicUrls[2], publicUrls[3]],
      video: publicUrls[4]
    }
  })

  await newProperty.save();

  res.status(201).json(handleResponse({ message: "Property created" }));
});

const handleGetAllProperties = handleAsync(async (req, res) => {
  const user = req.user;

  // const properties = await


});

module.exports = {
  handleAddProperty,
  handleGetAllProperties,
};
