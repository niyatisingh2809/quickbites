import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  // Support both legacy "token" header and standard "Authorization: Bearer <token>"
  let token = req.headers.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: No authorization token provided"
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "default_dev_secret_change_in_production";
    const token_decode = jwt.verify(token, jwtSecret);

    // Attach to req.user and keep req.body.userId for full backward compatibility
    req.user = {
      id: token_decode.id,
      role: token_decode.role || "customer"
    };
    if (!req.body) req.body = {};
    req.body.userId = token_decode.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again."
    });
  }
};

export default authMiddleware;