const { someEquallyTrue } = require("../lib/payload");

const fileExtLimiter = (req, res, next) => {
  if (Object.keys(req.files).length >= 1) {
    if (!req.files.video || !req.files.images)
      return res.status(400).json({ success: false, message: "upload media" });

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
        return ext == "image/png" || ext == "image/jpeg" || ext == "image/jpg";
      });
      if (!validImg)
        return res
          .status(400)
          .json({ message: "image file not supported", success: false });
    }
    next();
  } else {
    return res.status(400).json({ success: false, message: "upload media" });
  }
};

module.exports = fileExtLimiter;
