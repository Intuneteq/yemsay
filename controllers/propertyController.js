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
const { uploadProperty } = require("../lib/propertyHelpers");

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
      video: publicUrls[4],
    },
  });

  await newProperty.save();

  res.status(201).json(handleResponse({ message: "Property created" }));
});

const handleGetAllProperties = handleAsync(async (req, res) => {
  const user = req.user;

  const properties = await Properties.find({ adminId: user._id });

  const houses = {
    listedProperties: [],
    unlistedProperties: [],
    soldProperties: [],
  };

  const lands = {
    listedProperties: [],
    unlistedProperties: [],
    soldProperties: [],
  };

  properties.forEach((property) => {
    const item = {
      id: property._id,
      title: property.title,
      location: property.location,
      price: property.price,
      type: property.propertyType,
      status: property.propertyStatus,
      tags: property.tags,
      features: property.features,
      media: property.media,
      createdAt: property.createdAt,
    };

    const listedHouse =
      property.propertyType == "house" && property.propertyStatus == "listed";
    const unlistedHouse =
      property.propertyType == "house" && property.propertyStatus == "unlisted";
    const soldHouse =
      property.propertyType == "house" && property.propertyStatus == "sold";

    const listedLand =
      property.propertyType == "land" && property.propertyStatus == "listed";
    const unlistedLand =
      property.propertyType == "land" && property.propertyStatus == "unlisted";
    const soldLand =
      property.propertyType == "land" && property.propertyStatus == "sold";

    if (listedHouse) {
      houses.listedProperties.push(item);
    }

    if (unlistedHouse) {
      houses.unlistedProperties.push(item);
    }

    if (soldHouse) {
      houses.soldProperties.push(item);
    }

    if (listedLand) {
      lands.listedProperties.push(item)
    }

    if(unlistedLand) {
      lands.unlistedProperties.push(item)
    }

    if(soldLand) {
      lands.soldProperties.push(item)
    }
  });

  res
    .status(201)
    .json(
      handleResponse({ houses, lands })
    );
});

const handleGetPropertyById = handleAsync(async (req, res) => {
  const user = req.user;
  const { propertyId } = req.params;

  const property = await Properties.findOne({
    adminId: user._id,
    _id: propertyId,
  });

  res.status(201).json(handleResponse({ property }));
});

const handleDashboard = handleAsync(async (req, res) => {
  const user = req.user;

  const properties = await Properties.find({ adminId: user._id });

  let listed = 0;
  let unlisted = 0;
  const recentlyAddedProperties = properties
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((property) => {
      if (property.propertyStatus == "listed") listed++;
      if (property.propertyStatus == "unlisted") unlisted++;

      return {
        id: property._id,
        title: property.title,
        location: property.location,
        price: property.price,
        type: property.propertyType,
        status: property.propertyStatus,
        tags: property.tags,
        features: property.features,
        media: property.media,
        createdAt: property.createdAt,
      };
    })
    .slice(0, 2);

  res.status(201).json({
    listed,
    unlisted,
    allProperties: properties.length,
    recentlyAdded: recentlyAddedProperties,
  });
});

module.exports = {
  handleAddProperty,
  handleGetAllProperties,
  handleGetPropertyById,
  handleDashboard,
};
