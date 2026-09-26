import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const adminMiddleware = async (req, res, next) => {
  let token = req.headers.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: Admin authorization required"
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "default_dev_secret_change_in_production";
    const token_decode = jwt.verify(token, jwtSecret);

    const user = await userModel.findById(token_decode.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have administrator permissions"
      });
    }

    req.user = user;
    if (!req.body) req.body = {};
    req.body.userId = user._id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid"
    });
  }
};

export default adminMiddleware;
