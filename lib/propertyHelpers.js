//modules
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

//library
const { Storage } = require("@google-cloud/storage");
const zlib = require("zlib");

//Define consts
const googleCloud = new Storage({
  keyFilename: path.join(__dirname, "../client_secret.json"),
  projectId: process.env.PROJECT_ID,
});

//Get bucket from google cloud
const bucket = googleCloud.bucket("yemsay_v1");

const uploadProperty = async function (propertyMedia) {
  const publicUrls = await Promise.all(
    propertyMedia.map(async (media) => {
      //file path in gcs bucket
      const file = bucket.file(`${media.fieldname}/${media.originalname}`);

      // Compress the data using gzip compression
      const compressedData = zlib.gzipSync(media.buffer);

      // Upload the compressed data to the bucket
      await file.save(compressedData, {
        contentType: media.mimetype,
        gzip: true, // Enable gzip compression
      });

      // const contents = media.buffer;
      // await file.save(contents, { contentType: media.mimetype });
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      return publicUrl;
    })
  );
  return publicUrls;
};

const getSignedUrl = async function (propertyMedia) {
  const result = await Promise.all(
    propertyMedia.map(async (media) => {
      // Get a reference to the file
      const file = bucket.file(`${media.fieldname}/${media.originalname}`);

      // Generate a signed URL for the file with a one-hour expiration time
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: "write",
        expires: Date.now() + 15 * 60 * 1000,
        contentType: media.mimetype,
      });
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      const value = {
        originalname: media.originalname,
        signedUrl: url,
        publicUrl
      }
      return value;
    })
  );
  return result;
};

module.exports = { uploadProperty, getSignedUrl };
