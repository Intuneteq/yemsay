//library
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");

//Define consts
const googleCloud = new Storage({
    keyFilename: path.join(__dirname, "../client_secret.json"),
    projectId: "yemsay",
  });
  
const bucket = googleCloud.bucket("yemsay_v1");

const uploadProperty = async function (propertyMedia) {
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

  return publicUrls;
};

module.exports = { uploadProperty };
