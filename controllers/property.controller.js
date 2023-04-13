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
  const avatar = req.files.avatar && req.files.avatar[0];
  const {
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features,
    salesSupportName,
    salesSupportNum,
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

  //upload property media to google clouds
  const publicUrls = await uploadProperty(propertyMedia);

  // extract video url. It will always come last
  const videoUrl = publicUrls.pop();
  const media = {
    imgs: [...publicUrls],
    video: videoUrl,
  };

  // Sales support
  const salesSupport = {
    name: salesSupportName,
    phoneNumber: salesSupportNum,
    avatar: avatar ? avatar.buffer : null,
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
    salesSupport,
  });

  try {
    await newProperty.save();
  } catch (error) {
    throw createApiError(error.message, 400);
  }

  res.status(201).json(handleResponse(newProperty.format()));
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

  res.status(201).json(
    handleResponse({
      message: "Property created",
      results,
      property: newProperty,
    })
  );
});

const handleGetProperties = handleAsync(async (req, res) => {
  // Get auth user
  const user = req.user;

  // Req Params
  const { propertyType, propertyStatus } = req.params;

  if(!propertyType || !propertyStatus) throw createApiError('Bad Request', 400);

  // Find admin Props with params
  const properties = await Properties.find({
    adminId: user._id,
    propertyType,
    propertyStatus
  });

  // Format response 
  const response = properties.map((property) => property.miniFormat());

  res.status(200).json(handleResponse(response));
});

const handleGetAllProperties = handleAsync(async (req, res) => {
  // Get auth user
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
    const item = property.miniFormat();

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

  res.status(200).json(handleResponse({ houses, lands }));
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

  res.status(201).json(handleResponse(property.format()));
});

const handleDashboard = handleAsync(async (req, res) => {
  const user = req.user;

  const properties = await Properties.find({ adminId: user._id });
  if (!properties || !properties.length)
    throw createApiError("properties not found", 404);

  let listed = 0;
  let unlisted = 0;
  const recentlyAddedProperties = properties
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((property) => {
      if (property.propertyStatus == "listed") listed++;
      if (property.propertyStatus == "unlisted") unlisted++;

      return property.miniFormat();
    })
    .slice(0, 4);

  // Get all reviews
  const reviews = properties
    .sort((a, b) => b.createdAt - a.createdAt)
    .reduce((acc, curr) => {
      const currentProp = curr.reviewers.map((review) => {
        return {
          score: review.reviewScore,
          name: review.name,
          review: review.review,
          createdAt: review.createdAt,
        };
      });
      return [...acc, ...currentProp];
    }, [])
    .slice(0, 5);

  res.status(200).json(
    handleResponse({
      name: user.fullName,
      listed,
      unlisted,
      allProperties: properties.length,
      recentlyAdded: recentlyAddedProperties,
      reviews,
    })
  );
});

const handlePropertyListing = handleAsync(async (req, res) => {
  const user = req.user;
  const { status } = req.body;
  const { propertyId } = req.params;

  if (
    !["listed", "unlisted", "sold", "deleted"].includes(status.toLowerCase())
  ) {
    throw createApiError("Invalid property status provided", 400);
  }

  //find admin properties with propertyId and update
  const property = await Properties.findOneAndUpdate(
    {
      adminId: user._id,
      _id: propertyId,
    },
    { $set: { propertyStatus: status.toLowerCase() } },
    { new: true }
  );

  if (!property) {
    throw createApiError("Property not found", 404);
  }

  res.status(200).json(handleResponse(property.format()));
});

const handleEditProperty = handleAsync(async (req, res) => {
  const user = req.user;
  const { propertyId } = req.params;
  const images = req.files.images;
  const video = req.files.video?.length && req.files.video[0];
  const avatar = req.files.avatar?.length && req.files.avatar[0];
  const {
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features,
    salesSupportName,
    salesSupportNum,
    imgs, // array of images in db to be updated
  } = req.body;

  const property = await Properties.findOne({
    adminId: user._id,
    _id: propertyId,
  });

  if (!property) {
    throw createApiError("Property not found", 404);
  }

  if (images?.length) {
    //property media to be uploaded
    const propertyMedia = video ? [...images, video] : [...images];

    //upload property media to google clouds
    const publicUrls = await uploadProperty(propertyMedia);

    if (video) {
      // extract video url. It will always come last
      const videoUrl = publicUrls.pop();
      property.media.video = videoUrl;
    }

    // Enforce matching length for arrays of images to be updated with array of images to be updated with
    const isMatch = imgs.length === publicUrls.length;

    if (!isMatch) throw createApiError("upload the image to be updated", 400);

    let i = 0;
    let j = 0;
    // Update images at their index with the newly uploaded image
    while (i < imgs.length && j < publicUrls.length) {
      const index = property.media.imgs.indexOf(imgs[i]);
      if (index !== -1) {
        property.media.imgs[index] = publicUrls[j];
      }
      i++;
      j++;
    }
  }

  property.title = title ?? property.title;
  property.location = location ?? property.location;
  property.price = price ?? property.price;
  property.propertyType = propertyType ?? property.propertyType;
  property.description = description ?? property.description;
  property.tags = tags?.length ? tags : property.tags;
  property.features = features?.length ? features : property.features;
  property.salesSupport.name = salesSupportName ?? property.salesSupport.name;
  property.salesSupport.phoneNumber =
    salesSupportNum ?? property.salesSupport.phoneNumber;
  property.salesSupport.avatar = avatar?.buffer ?? property.salesSupport.avatar;

  await property.save();

  res.status(200).json(handleResponse(property.format()));
});

const handleListedLands = handleAsync(async (req, res) => {
  const listedLands = await Properties.find()
    .where("propertyType")
    .equals("land")
    .where("propertyStatus")
    .equals("listed");

  const response = listedLands.map((listed) => listed.miniFormat());

  res.status(200).json(handleResponse(response));
});

const handleListedHouses = handleAsync(async (req, res) => {
  const listedHouses = await Properties.find()
    .where("propertyType")
    .equals("house")
    .where("propertyStatus")
    .equals("listed");

  const response = listedHouses.map((listed) => listed.miniFormat());

  res.status(200).json(handleResponse(response));
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

  const simPropRes = similarProperties.map((sim) => sim.miniFormat());

  res.status(200).json(
    handleResponse({
      property: { ...property.format(), ...property.reviewFormat() },
      similarProperties: simPropRes,
    })
  );
});

const handleAddReview = handleAsync(async (req, res) => {
  const { propertyId } = req.params;
  const { property, valueForMoney, location, support, name, email, review } =
    req.body;

  //Get Property
  const selectedProperty = await Properties.findById(propertyId);

  const reviewScore = (property + valueForMoney + location + support + 5) / 5;
  //save reviewer
  selectedProperty.reviewers = [
    ...selectedProperty.reviewers,
    { name, email, review, reviewScore },
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

  res.status(200).json(handleResponse());
});

const handleGetLatestProperties = handleAsync(async (req, res) => {
  const properties = await Properties.find();

  const recentProperties = properties
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((property) => property.miniFormat())
    .slice(0, 4);

  res.status(200).json(handleResponse(recentProperties));
});

const handleBannerDetails = handleAsync(async (req, res) => {
  const properties = await Properties.find().select(
    "title propertyStatus propertyType"
  );

  const separateProperties = properties.reduce(
    (acc, curr) => {
      const listedHouse =
        curr.propertyType === "house" && curr.propertyStatus === "listed";
      const listedLand =
        curr.propertyType === "land" && curr.propertyStatus === "listed";

      if (curr.propertyStatus === "sold") {
        acc.sold.push(curr);
      }

      if (listedHouse) {
        acc.home.push(curr);
      }

      if (listedLand) {
        acc.land.push(curr);
      }
      return acc;
    },
    { home: [], land: [], sold: [] }
  );

  res.status(200).json(
    handleResponse({
      homeForSale: separateProperties.home.length,
      landForSale: separateProperties.land.length,
      sold: separateProperties.sold.length,
    })
  );
});

const handleDeleteProperty = handleAsync(async (req, res) => {
  const user = req.user;
  const { propertyId } = req.params;

  if (!propertyId) throw createApiError("Please Provide PropertyId", 400);

  const property = await Properties.findOneAndDelete({
    adminId: user._id,
    _id: propertyId,
  });

  if (!property) throw createApiError("property not found", 404);

  res.status(200).json(handleResponse());
});

module.exports = {
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
  handleDeleteProperty,
};
