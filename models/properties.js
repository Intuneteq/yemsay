const mongoose = require("mongoose");
const { Schema } = mongoose;

const PropertySchema = new Schema({
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
    enum: ['house', 'land']
  },
  description: {
    type: String,
    required: true
  },
  media: {
    imgs: [String],
    video: String
  },
  tags: [String],
  features: [String],
  propertyStatus: {
    type: String,
    required: true,
    enum: ['listed', 'unlisted', 'deleted', 'sold']
  }
}, {timestamps: true});

module.exports = mongoose.model('Property', PropertySchema);