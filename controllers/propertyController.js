//library

//models
const Properties = require("../models/properties");
const Profiles = require("../models/profile");

//utils
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");

//helpers
const { allTrue } = require("../lib/payload");

const handleAddProperty = handleAsync(async (req, res) => {
  const user = req.user;
  const images = req.files.images;
  const video = req.files.video[0];
  const { title, location, price, propertyType, description, tags, features } =
    req.body;

  const admin = await Profiles.findById(user._id);
  if (!admin) throw createApiError("user not found", 404);

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

  const bufferedImgs = images.map(image => image.buffer);
  const bufferedVideo = video.buffer;

  const newProperty = new Properties({
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features,
    media: {
      imgs: bufferedImgs,
      video: bufferedVideo
    }
  });
  await newProperty.save();

  res.status(201).json(handleResponse({message: 'Property created'}))
});

module.exports = {
  handleAddProperty,
};
