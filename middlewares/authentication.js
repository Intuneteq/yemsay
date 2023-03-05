require("dotenv").config();
const jwt = require("jsonwebtoken");
const Profile = require("../models/profile");

const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ message: "authentication invalid", success: false });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Token not authorized",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { userInfo } = payload;

    const user = await Profile.findById(userInfo.id);

    // Check if user account exists
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Token not authorized",
      });

    req.user = user;

    next();
  } catch (error) {
    console.error(error);

    return res.status(403).json({
      success: false,
      msg: "Session Expired",
    });
  }
};

module.exports = authentication;