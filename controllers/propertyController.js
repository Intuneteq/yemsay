//library
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");

//models
const Properties = require("../models/properties");
const Profiles = require("../models/profile");

//utils
const {
  handleAsync,
  createApiError,
  handleResponse,
} = require("../utils/helpers");

//helpers
const { allTrue } = require("../lib/payload");

const googleCloud = new Storage({
  keyFilename: path.join(__dirname, "../client_secret.json"),
  projectId: "yemsay",
});

const bucket = googleCloud.bucket("yemsay_v1");

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

  const publicUrls = await Promise.all(
    propertyMedia.map((media) => {
      //path to data
      const localFilePath = path.join(
        __dirname,
        `../uploads/${media.originalname}`
      );

      // Create a read stream for the local file
      const readStream = fs.createReadStream(localFilePath);

      // Define the destination path for the file in the bucket (including the file name)
      const destinationPath =
        media.fieldname == "images"
          ? `images/${media.originalname}`
          : `videos/${media.originalname}`;

      //create writestream to write data into bucket
      const writeStream = bucket.file(destinationPath).createWriteStream();

      const url = new Promise((resolve, reject) => {
        readStream
          .pipe(writeStream)
          .on("error", reject)
          .on("finish", () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
            fs.promises.unlink(localFilePath);
            resolve(publicUrl);
          });
      });

      return url;
    })
  );

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
      video: publicUrls[4]
    }
  })

  await newProperty.save();

  res.status(201).json(handleResponse({ message: "Property created" }));
});

const handleGetAllProperties = handleAsync(async (req, res) => {
  const user = req.user;

  //find admin
  const admin = await Profiles.findById(user._id);
  if (!admin) throw createApiError("user not found", 404);

  //find admin Properties
  // const
});

module.exports = {
  handleAddProperty,
  handleGetAllProperties,
};
