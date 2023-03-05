//library

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

const handleAddProperty = handleAsync(async (req, res) => {
  const user = req.user;
  // console.log(user);

  const {
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features,
  } = req.body;

  const payload = allTrue(
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    features
  );

  // console.log(req.files)
  // console.log(req.body)

  // console.log(video)

  if(!payload) throw createApiError('Payload Incomplete', 422);


});

module.exports = {
  handleAddProperty,
};
