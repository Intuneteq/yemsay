//modules
const path = require("path");
// const fs = require("fs");

// Library
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
// const { Storage } = require("@google-cloud/storage");
// const zlib = require("zlib");

console.log(process.env.S3_REGION)

// Define consts
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  region: process.env.S3_REGION,
  systemClockOffset: 0 // Set to 0 to use the system's clock
});

const BUCKET_NAME = "yemsay";

// const googleCloud = new Storage({
//   keyFilename: path.join(__dirname, "../client_secret.json"),
//   projectId: process.env.PROJECT_ID,
// });

// //Get bucket from google cloud
// const bucket = googleCloud.bucket("yemsay_v1");

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

// const uploadProperty = async function (propertyMedia) {
//   const signedUrls = await Promise.all(
//     propertyMedia.map(async (media) => {
//       // Remove whitespaces from originalname
//       const originalNameWoWhiteSpace = media.originalname.replace(/\s/g, "");
//       // Get a signed URL for the file
//       const [signedUrl] = await bucket.file(`${media.fieldname}/${originalNameWoWhiteSpace}`).getSignedUrl({
//         version: 'v4',
//         action: 'write',
//         expires: Date.now() + 15 * 60 * 1000, // 15 minutes
//         contentType: media.mimetype,
//       });
//       // Return the signed URL and file name
//       return { fileName: `${media.fieldname}/${originalNameWoWhiteSpace}`, signedUrl };
//     })
//   );

//   // Upload the files in parallel using the signed URLs and compose them into a single file
//   const destinationFileName = 'composite-file-name';
//   const destinationFile = bucket.file(destinationFileName);
//   await Promise.all(signedUrls.map(({ fileName, signedUrl }) => {
//     const sourceFile = bucket.file(fileName);
//     return sourceFile.createResumableUpload(signedUrl, {
//       origin: 'http://localhost:3000' // Replace with your frontend URL
//     });
//   }));
//   await Promise.all(signedUrls.map(({ fileName }) => {
//     const sourceFile = bucket.file(fileName);
//     return sourceFile.delete();
//   }));
//   await destinationFile.setMetadata({
//     contentType: propertyMedia[0].mimetype
//   });
//   const [publicUrl] = await destinationFile.getSignedUrl({
//     version: 'v4',
//     action: 'read',
//     expires: Date.now() + 15 * 60 * 1000 // 15 minutes
//   });
//   return publicUrl;
// };

// async function uploadProperty(propertyMedia) {
//   const composeRequest = bucket.compose(propertyMedia.map((media) => {
//     const originalName = media.originalname.replace(/\s+/g, '_');
//     const contentType = media.mimetype;
//     const filePath = `${media.fieldname}/${originalName}`;
//     const source = bucket.file(filePath);
//     return { source, contentType };
//   }), 'output-file');

//   const [result] = await composeRequest.promise();
//   const publicUrl = `https://storage.googleapis.com/${bucketName}/${result.name}`;

//   return publicUrl;
// }

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

// const uploadProperty = async function (propertyMedia) {
//   const sources = propertyMedia.map((media) => {
//     // Remove whitespaces from originalname
//     const orignalNameWoWhiteSpace = media.originalname.replace(/\s/g, "");

//     //file path in gcs bucket
//     const file = bucket.file(`${media.fieldname}/${orignalNameWoWhiteSpace}`);

//     return {orignalNameWoWhiteSpace}
//   });

//   const combineOptions = {
//     ifGenerationMatch: 0,
//   };

//   await bucket.combine(sources, destinationFileName, combineOptions);
// };

// async function uploadProperty(propertyMedia) {
//   const uploadUrls = propertyMedia.map(async (media) => {
//     // Remove whitespace from originalname
//     const originalNameWoWhiteSpace = media.originalname.replace(/\s/g, "");
//     const filePath = `${media.fieldname}/${originalNameWoWhiteSpace}`;

//     // Create a file object and add it to the upload request
//     const file = bucket.file(filePath);

//     // Get the upload URL for the file
//     const uploadUrl = await file.getSignedUrl({
//       action: "resumable",
//       contentType: media.mimetype,
//       expires: new Date(Date.now() + 3600 * 1000), // Expires in 1 hour
//     });

//     // Return an object with the file and its upload URL
//     return { file, uploadUrl: uploadUrl[0] };
//   });

//   // Wait for all the upload URLs to be fetched
//   const fileUrls = await Promise.all(uploadUrls);

//   // Create the upload request and add all the files to it
//   const upload = bucket.createComposeRequest();
//   fileUrls.forEach(({ file }) => {
//     upload.addFile(file, { resumable: false });
//   });

//   // Start the upload request and wait for it to complete
//   const [uploadedFile] = await upload.create();

//   // Return the public URLs for each uploaded file
//   const publicUrls = uploadedFile.metadata.mediaLink.split("\n");
//   return publicUrls;
// }

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
