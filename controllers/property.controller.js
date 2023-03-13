//models
const Properties = require("../models/property.model");

//utils
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");

//helpers
const { allTrue } = require("../lib/payload");
const { uploadProperty, getSignedUrl } = require("../lib/propertyHelpers");

const handleAddProperty = handleAsync(async (req, res) => {
  //get auth user
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
    tags.length,
    features.length
  );
  if (!payload) throw createApiError("Payload Incomplete", 422);

  //property media to be uploaded
  const propertyMedia = [...images, video];

  //upload property media to google clouds
  const publicUrls = await uploadProperty(propertyMedia);

  // extract video url. It will always come last
  const videoUrl = publicUrls.pop();
  const media = {
    imgs: [...publicUrls],
    video: videoUrl,
  };

  //create new property
  const newProperty = new Properties({
    adminId: user._id,
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features,
    media,
  });

  try {
    await newProperty.save();
  } catch (error) {
    throw createApiError("server error", 500);
  }

  res
    .status(201)
    .json(handleResponse({ message: "Property created", data: newProperty }));
});

const handleUploadWithUrl = handleAsync(async (req, res) => {
  //get auth user
  const user = req.user;
  const {
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features,
    images,
    video,
  } = req.body;

  const payload = allTrue(
    title,
    location,
    price,
    propertyType,
    description,
    tags.length,
    features.length
  );
  if (!payload) throw createApiError("Payload Incomplete", 422);

  //property media to be uploaded
  const propertyMedia = [...images, video];

  const results = await getSignedUrl(propertyMedia);

  // extract video url. It will always come last
  const videoResult = results.pop();
  const media = {
    imgs: results.map((img) => img.publicUrl),
    video: videoResult.publicUrl,
  };

  //create new property
  const newProperty = new Properties({
    adminId: user._id,
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features,
    media,
  });

  try {
    await newProperty.save();
  } catch (error) {
    throw createApiError("server error", 500);
  }

  res
    .status(201)
    .json(handleResponse({ message: "Property created", results, property: newProperty }));
});

const handleGetAllProperties = handleAsync(async (req, res) => {
  //get auth user
  const user = req.user;

  //find admin properties
  const properties = await Properties.find({ adminId: user._id });
  if (!properties || !properties.length)
    throw createApiError("properties not found", 404);

  //house properties
  const houses = {
    listedProperties: [],
    unlistedProperties: [],
    soldProperties: [],
  };

  //land properties
  const lands = {
    listedProperties: [],
    unlistedProperties: [],
    soldProperties: [],
  };

  properties.forEach((property) => {
    const item = property.format();

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
      lands.listedProperties.push(item);
    }

    if (unlistedLand) {
      lands.unlistedProperties.push(item);
    }

    if (soldLand) {
      lands.soldProperties.push(item);
    }
  });

  res.status(201).json(handleResponse({ houses, lands }));
});

const handleGetAdminPropertyById = handleAsync(async (req, res) => {
  const user = req.user;
  const { propertyId } = req.params;

  //find property properties with adminId and propertyId
  const property = await Properties.findOne({
    adminId: user._id,
    _id: propertyId,
  });

  if (!property) throw createApiError("property not found", 404);

  res.status(201).json(handleResponse({ property }));
});

const handleDashboard = handleAsync(async (req, res) => {
  const user = req.user;

  const properties = await Properties.find({ adminId: user._id });
  if (!properties || !properties.length)
    throw createApiError("properties not found", 404);

  let listed = 0;
  let unlisted = 0;
  const recentlyAddedProperties = properties
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((property) => {
      if (property.propertyStatus == "listed") listed++;
      if (property.propertyStatus == "unlisted") unlisted++;

      return property.format();
    })
    .slice(0, 2);

  res.status(201).json({
    listed,
    unlisted,
    allProperties: properties.length,
    recentlyAdded: recentlyAddedProperties,
  });
});

const handlePropertyListing = handleAsync(async (req, res) => {
  const user = req.user;
  const { status } = req.body;
  const { propertyId } = req.params;

  if (!["listed", "unlisted"].includes(status)) {
    throw createApiError("Invalid property status provided", 400);
  }

  //find admin properties with propertyId and update
  const property = await Properties.findOneAndUpdate(
    {
      adminId: user._id,
      _id: propertyId,
    },
    { $set: { propertyStatus: status } },
    { new: true }
  );

  if (!property) {
    throw createApiError("Property not found", 404);
  }

  res.status(200).json(handleResponse({ property }));
});

const handleEditProperty = handleAsync(async (req, res) => {
  const user = req.user;
  const { propertyId } = req.params;
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
    features,
    images,
    video
  );
  if (!payload) throw createApiError("Payload Incomplete", 422);

  //property media to be uploaded
  const propertyMedia = [...images, video];

  //upload property media to google clouds
  const publicUrls = await uploadProperty(propertyMedia);

  // extract video url. It will always come last
  const videoUrl = publicUrls.pop();
  const media = {
    imgs: [...publicUrls],
    video: videoUrl,
  };

  //find admin properties with propertyId and update
  const property = await Properties.findOneAndUpdate(
    {
      adminId: user._id,
      _id: propertyId,
    },
    {
      $set: {
        title,
        location,
        price,
        propertyType,
        description,
        media,
        tags,
        features,
      },
    },
    { new: true }
  );

  if (!property) {
    throw createApiError("Property not found", 404);
  }

  res.status(200).json(handleResponse({ property }));
});

const handleListedLands = handleAsync(async (req, res) => {
  const listedLands = await Properties.find()
    .where("propertyType")
    .equals("land")
    .where("propertyStatus")
    .equals("listed");

  res.status(200).json({ listedLands });
});

const handleListedHouses = handleAsync(async (req, res) => {
  const listedHouses = await Properties.find()
    .where("propertyType")
    .equals("house")
    .where("propertyStatus")
    .equals("listed");

  res.status(200).json({ listedHouses });
});

const handleGetProperty = handleAsync(async (req, res) => {
  const { propertyId } = req.params;

  const property = await Properties.findById(propertyId);
  if (!property) throw createApiError("property not found", 404);

  const propertyType = property.propertyType;

  const similarProperties = await Properties.where("propertyType")
    .equals(propertyType)
    .where("propertyStatus")
    .equals("listed")
    .limit(9)
    .exec();

  res.status(200).json({ property, similarProperties });
});

const handleAddReview = handleAsync(async (req, res) => {
  const { propertyId } = req.params;
  const { property, valueForMoney, location, support, name, email, review } =
    req.body;

  //Get Property
  const selectedProperty = await Properties.findById(propertyId);

  //save reviewer
  selectedProperty.reviewers = [
    ...selectedProperty.reviewers,
    { name, email, review },
  ];

  //update reviewer count by invoking the virtual method
  selectedProperty.totalReviewers = selectedProperty.reviewerCount;

  //update review scores by invoking the UpdateReviews method
  selectedProperty.updateReviews({
    property,
    valueForMoney,
    location,
    support,
  });

  await selectedProperty.save();

  res.status(200).json({ message: "review updated" });
});

module.exports = {
  handleAddProperty,
  handleGetAllProperties,
  handleGetAdminPropertyById,
  handleDashboard,
  handlePropertyListing,
  handleEditProperty,
  handleListedLands,
  handleListedHouses,
  handleGetProperty,
  handleAddReview,
  handleUploadWithUrl,
};
