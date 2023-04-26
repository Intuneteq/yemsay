//modules
const path = require("path");

// Library
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

// Define consts
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  region: process.env.S3_REGION,
  systemClockOffset: 0, // Set to 0 to use the system's clock
});

const BUCKET_NAME = "yemsay";

// AWS S3 bucket upload
const uploadProperty = async function (propertyMedia) {
  const publicUrls = await Promise.all(
    propertyMedia.map(async (media) => {
      //Remove whitespaces from originalname
      const orignalNameWoWhiteSpace = media.originalname.replace(/\s/g, "");

      // Set the S3 key (filename) and upload the file to S3
      const s3Key = `${media.fieldname}/${uuidv4()}_${orignalNameWoWhiteSpace}`;

      const s3Params = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: media.buffer,
        ACL: "public-read",
      };
      await s3.send(new PutObjectCommand(s3Params));

      // Generate the public URL for the uploaded file
      const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
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

// const { Storage } = require("@google-cloud/storage");
// const zlib = require("zlib");

// const googleCloud = new Storage({
//   keyFilename: path.join(__dirname, "../client_secret.json"),
//   projectId: process.env.PROJECT_ID,
// });

// //Get bucket from google cloud
// const bucket = googleCloud.bucket("yemsay_v1");

// Google Cloud bucket upload
// const uploadProperty = async function (propertyMedia) {
//   const publicUrls = await Promise.all(
//     propertyMedia.map(async (media) => {
//       //Remove whitespaces from originalname
//       const orignalNameWoWhiteSpace = media.originalname.replace(/\s/g, "");

//       //file path in gcs bucket
//       const file = bucket.file(`${media.fieldname}/${orignalNameWoWhiteSpace}`);

//       const options = {
//         gzip: true,
//         metadata: {
//           contentType: media.mimetype,
//         },
//         resumable: false,
//       };

//       // Upload each video file to the bucket
//       await file.save(media.buffer, {
//         contentType: media.mimetype,
//         ...options,
//       });

//       return file.publicUrl();
//     })
//   );
//   return publicUrls;
// };
