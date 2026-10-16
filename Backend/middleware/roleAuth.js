import restaurantModel from "../models/restaurantModel.js";
import userModel from "../models/userModel.js";

/**
 * Middleware to restrict access based on user role(s).
 * Must be placed after authMiddleware.
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before role verification"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(", ")}]. Your role is [${req.user.role}].`
      });
    }

    next();
  };
};

/**
 * Middleware for Restaurant Owner endpoints:
 * 1. Verifies that the user has the 'restaurant_owner' or 'admin' role.
 * 2. Fetches the restaurant owned by req.user.id and attaches it to req.restaurant.
 */
export const restaurantOwnerMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Admins have override access
    if (req.user.role === "admin") {
      // If a specific restaurantId was passed in params or body, attach that
      const restaurantId = req.params.restaurantId || req.body.restaurantId || req.query.restaurantId;
      if (restaurantId) {
        const adminSelectedRestaurant = await restaurantModel.findById(restaurantId);
        if (adminSelectedRestaurant) {
          req.restaurant = adminSelectedRestaurant;
        }
      }
      return next();
    }

    // Must be restaurant_owner
    if (req.user.role !== "restaurant_owner") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only registered restaurant partners can access this resource"
      });
    }

    const restaurant = await restaurantModel.findOne({ ownerId: req.user.id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant found associated with your account. Please complete partner onboarding."
      });
    }

    req.restaurant = restaurant;
    next();
  } catch (error) {
    console.error("Restaurant Owner Middleware Error:", error);
    res.status(500).json({ success: false, message: "Error verifying restaurant ownership" });
  }
};
