const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewerSchema = new Schema(
  {
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
      required: true,
    },
    reviewScore: {
      type: Number
    }
  },
  { timestamps: true }
);

const ManagerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  avatar: {
    type: Buffer
  }
})

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
        type: [String],
      },
      video: {
        type: String,
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
    avgPropertyScore: {
      type: Number,
      default: 0,
    },
    avgValueForMoneyScore: {
      type: Number,
      default: 0,
    },
    avgLocationScore: {
      type: Number,
      default: 0,
    },
    avgSupportScore: {
      type: Number,
      default: 0,
    },
    avgReviewScore: {
      type: Number,
      default: 0,
    },
    totalReviewers: {
      type: Number,
      default: 0,
    },
    reviewers: [ReviewerSchema],
    salesSupport: ManagerSchema
  },
  { timestamps: true }
);

PropertySchema.virtual("reviewerCount").get(function () {
  return this.reviewers.length;
});

PropertySchema.methods.updateReviews = function ({
  property,
  valueForMoney,
  location,
  support,
}) {
  this.avgPropertyScore = Math.ceil((this.avgPropertyScore + property) / 2);
  this.avgValueForMoneyScore = Math.ceil(
    (this.avgValueForMoneyScore + valueForMoney) / 2
  );
  this.avgLocationScore = Math.ceil((this.avgLocationScore + location) / 2);
  this.avgSupportScore = Math.ceil((this.avgSupportScore + support) / 2);
  this.avgReviewScore = Math.ceil(
    (this.avgPropertyScore +
      this.avgValueForMoneyScore +
      this.avgLocationScore +
      this.avgSupportScore +
      5) /
      5
  );
};

PropertySchema.methods.miniFormat = function () {
  return {
    id: this._id,
    title: this.title,
    location: this.location,
    price: this.price,
    type: this.propertyType,
    status: this.propertyStatus,
    tags: this.tags,
    features: this.features,
    image: this.media.imgs[0],
    createdAt: this.createdAt,
  }
}

PropertySchema.methods.format = function () {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    location: this.location,
    price: this.price,
    type: this.propertyType,
    status: this.propertyStatus,
    tags: this.tags,
    features: this.features,
    media: this.media,
    salesSupport: {
      name: this.salesSupport.name,
      phoneNumber: this.salesSupport.phoneNumber,
      avatar: this.salesSupport.avatar?.toString("base64") ?? null
    },
    createdAt: this.createdAt,
  };
};

PropertySchema.methods.reviewFormat = function () {
  return {
    totalRating: this.avgReviewScore,
    propertyRating: this.avgPropertyScore,
    locationRating: this.avgLocationScore,
    valueForMoneyRating: this.avgValueForMoneyScore,
    supportRating: this.avgSupportScore,
    totalReviewers: this.totalReviewers,
    reviewers: this.reviewers
  }
}

module.exports = mongoose.model("Property", PropertySchema);
