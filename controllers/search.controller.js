//module

//models
const Properties = require("../models/property.model");

//utils
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");

//helpers

const handleSearchQuery = handleAsync(async (req, res) => {
  const { location, property, propertyType, averagePrice } = req.query;

  /**
   * @param property = propertyType in the property model;
   * @param propertyType = features in the property model;
   * @param location = location in Property model;
   * @param averagePrice is derived and expected to match Price in property model
   */
  
  if (!property) throw createApiError("bad request", 400);

  // Replace all consecutive spaces with a single space and then trim any leading/trailing spaces.
  const locationSearch = location && location.replace(/\s+/g, " ").trim();
  const propertyTypeSearch = propertyType
    ? propertyType.replace(/\s/g, "").split("").join("\\s*")
    : undefined;

  // Define search regex
  const locationRegex = new RegExp(`\\b${locationSearch}\\b`, "i"); // Match a word boundary (i.e., the beginning or end of a word)
  const propertyTypeRegex = new RegExp(propertyTypeSearch, "i");

  // Build the query object
  const query = {
    $and: [
      { propertyStatus: "listed" },
      {
        $or: [
          { location: { $regex: locationRegex } },
          { features: propertyType && { $in: [propertyTypeRegex] } },
          {
            price: averagePrice && {
              $gte: averagePrice - averagePrice * 0.5,
              $lte: averagePrice * 0.5 + averagePrice,
            },
          },
        ],
      },
    ],
  };

  // Query DB with defined query
  const foundProperties = await Properties.find(query)
    .where("propertyType")
    .equals(property);

  // Format response
  const response = foundProperties.map((prop) => prop.miniFormat());

  res.status(200).json(handleResponse(response));
});

module.exports = { handleSearchQuery };
