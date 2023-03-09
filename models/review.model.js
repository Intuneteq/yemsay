const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  property: {
    type: Number,
    default: 0,
  },
  valueForMoney: {
    type: Number,
    default: 0,
  },
  location: {
    type: Number,
    default: 0,
  },
  support: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  review: {
    type: String,
  },
});

// module.exports = mongoose.model("Review", ReviewSchema);
