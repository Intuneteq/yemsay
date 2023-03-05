const { someEquallyTrue } = require("../lib/payload");

const fileExtLimiter = (req, res, next) => {
  if (req.files) {
    if (req.files.video) {
      const videos = req.files.video;
      const videoExt = videos.map((video) => video.mimetype);
      const allMp4 = someEquallyTrue("video/mp4", videoExt);

      if (!allMp4)
        return res
          .status(400)
          .json({ message: "video file not supported", success: false });
    }

    if (req.files.images) {
      const images = req.files.images;
      const imgExt = images.map((img) => img.mimetype);
      const validImg = imgExt.every((ext) => {
        return ext == "image/png" || ext == "image/jpeg";
      });
      if (!validImg)
        return res
          .status(400)
          .json({ message: "image file not supported", success: false });
    }
  }

  next();
};

module.exports = fileExtLimiter;
