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
      
      //Remove whitespaces from originalname
      const orignalNameWoWhiteSpace = media.originalname.replace(/\s/g, '');

      //file path in gcs bucket
      const file = bucket.file(`${media.fieldname}/${orignalNameWoWhiteSpace}`);

      // Upload the data to the bucket
      await file.save(media.buffer, {
        contentType: media.mimetype,  
        gzip: true,
        metadata: {
            // Enable long-lived HTTP caching headers
            cacheControl: 'public, max-age=31536000',
        },
      });

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
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000,
        contentType: media.mimetype,
      });
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      const value = {
        originalname: media.originalname,
        signedUrl: url,
        publicUrl,
      };
      return value;
    })
  );
  return result;
};

module.exports = { uploadProperty, getSignedUrl };
