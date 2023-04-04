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

  /*
    @property from the query = propertyType in the property model;
    @propertyType from query = features in the property model;
  */

  //remove all whitespaces across string & Add optional spaces between characters in the search query
  const locationSearch = location.replace(/\s/g, "").split("").join("\\s*");
  const propertyTypeSearch = propertyType
    ? propertyType.replace(/\s/g, "").split("").join("\\s*")
    : undefined;

  //Define search regex
  const locationRegex = new RegExp(locationSearch, "i");
  const propertyRegex = new RegExp(property, "i");
  const propertyTypeRegex = new RegExp(propertyTypeSearch, "i");

  //Build the query object
  const query = {
    $and: [
      { propertyStatus: "listed" },
      { location: { $regex: locationRegex } },
      { propertyType: { $regex: propertyRegex } },
      { features: { $elemMatch: { $regex: propertyTypeRegex } } },
    ],
  };

  if (averagePrice) {
    //Calculate minimum and maximum price for filter range
    const minPrice = averagePrice - averagePrice * 0.5;
    const maxPrice = averagePrice * 0.5 + averagePrice;
    query.$and.push({ price: { $gte: minPrice, $lte: maxPrice } },);
  }

  const findProperty = await Properties.find(query);

  res.status(200).json(handleResponse(findProperty));
});

module.exports = { handleSearchQuery };
