import express from "express";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";
import {
  registerDeliveryPartner,
  getMyDeliveryProfile,
  toggleAvailability,
  updateCurrentLocation,
  listAdminDeliveryPartners,
  updateDeliveryPartnerStatus
} from "../controllers/deliveryPartnerController.js";

const deliveryPartnerRouter = express.Router();

const optionalAuth = (req, res, next) => {
  let token = req.headers.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next();
  authMiddleware(req, res, next);
};

// --- RIDER ONBOARDING ---
deliveryPartnerRouter.post("/register", optionalAuth, registerDeliveryPartner);

// --- RIDER APP / PORTAL ENDPOINTS ---
deliveryPartnerRouter.get(
  "/profile",
  authMiddleware,
  authorizeRoles("delivery_partner", "rider", "admin"),
  getMyDeliveryProfile
);
deliveryPartnerRouter.patch(
  "/availability",
  authMiddleware,
  authorizeRoles("delivery_partner", "rider", "admin"),
  toggleAvailability
);
deliveryPartnerRouter.post(
  "/location",
  authMiddleware,
  authorizeRoles("delivery_partner", "rider", "admin"),
  updateCurrentLocation
);

// --- PLATFORM ADMIN MODERATION ENDPOINTS ---
deliveryPartnerRouter.get(
  "/admin/list",
  authMiddleware,
  authorizeRoles("admin"),
  listAdminDeliveryPartners
);
deliveryPartnerRouter.patch(
  "/admin/:id/status",
  authMiddleware,
  authorizeRoles("admin"),
  updateDeliveryPartnerStatus
);

export default deliveryPartnerRouter;
