import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles, restaurantOwnerMiddleware } from "../middleware/roleAuth.js";
import {
  registerRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  uploadRestaurantDocument,
  listAdminRestaurants,
  updateRestaurantStatus,
  updateRestaurantSettings,
  getPublicRestaurants,
  getPublicRestaurantById,
  toggleRushMode
} from "../controllers/restaurantController.js";

const restaurantRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only image files (.jpg, .png, .webp) and PDF documents are allowed!"), false);
    }
  }
});

// Optional auth helper: attaches user if token is present, but doesn't block if not
const optionalAuth = (req, res, next) => {
  let token = req.headers.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next();
  authMiddleware(req, res, next);
};

// --- PUBLIC CUSTOMER ENDPOINTS ---
restaurantRouter.get("/list", getPublicRestaurants);
restaurantRouter.get("/detail/:idOrSlug", getPublicRestaurantById);

// --- RESTAURANT ONBOARDING ---
restaurantRouter.post("/register", optionalAuth, upload.single("image"), registerRestaurant);

// --- RESTAURANT OWNER DASHBOARD ENDPOINTS ---
restaurantRouter.get("/my-restaurant", authMiddleware, restaurantOwnerMiddleware, getMyRestaurant);
restaurantRouter.put("/my-restaurant", authMiddleware, restaurantOwnerMiddleware, updateMyRestaurant);
restaurantRouter.post(
  "/documents",
  authMiddleware,
  restaurantOwnerMiddleware,
  upload.single("document"),
  uploadRestaurantDocument
);

// --- PLATFORM ADMIN MODERATION ENDPOINTS ---
restaurantRouter.get("/admin/list", authMiddleware, authorizeRoles("admin"), listAdminRestaurants);
restaurantRouter.patch("/admin/:id/status", authMiddleware, authorizeRoles("admin"), updateRestaurantStatus);
restaurantRouter.patch("/admin/:id/settings", authMiddleware, authorizeRoles("admin"), updateRestaurantSettings);

// --- KITCHEN RUSH MODE TOGGLE ---
restaurantRouter.post(
  "/rush-mode",
  authMiddleware,
  authorizeRoles("restaurant_owner", "admin"),
  toggleRushMode
);

export default restaurantRouter;
