const mongoose = require("mongoose");
const { Schema } = mongoose;

// const ReviewSchema = require('./review.model');

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


const PropertySchema = new Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Profile",
    },
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
      enum: ["house", "land"],
    },
    description: {
      type: String,
      required: true,
    },
    media: {
      imgs: {
        type: [String]
      },
      video: {
        type: String
      },
    },
    tags: [String],
    features: [String],
    propertyStatus: {
      type: String,
      required: true,
      default: "unlisted",
      enum: ["listed", "unlisted", "deleted", "sold"],
    },
    reviews: ReviewSchema
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", PropertySchema);
