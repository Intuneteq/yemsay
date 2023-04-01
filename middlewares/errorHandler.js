const multer = require("multer");

const errorHandler = function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    res
      .status(400)
      .json({ message: err.message, success: false, MulterError: true });
  } else if (err) {
    // An unknown error occurred when uploading.
    res
      .status(400)
      .json({ message: err.message, success: false, MulterError: false });
  } else {
    next();
  }
};

module.exports = errorHandler;