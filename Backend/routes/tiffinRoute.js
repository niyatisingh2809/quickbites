import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getTiffinPlans,
  subscribeTiffinPlan,
  getUserTiffinSubscriptions,
  skipTiffinDate,
  cancelTiffinSubscription
} from "../controllers/tiffinController.js";

const tiffinRouter = express.Router();

// Public: Browse Tiffin Plans
tiffinRouter.get("/plans", getTiffinPlans);

// Authenticated: Manage Subscriptions
tiffinRouter.post("/subscribe", authMiddleware, subscribeTiffinPlan);
tiffinRouter.get("/my-subscriptions", authMiddleware, getUserTiffinSubscriptions);
tiffinRouter.post("/skip-date", authMiddleware, skipTiffinDate);
tiffinRouter.post("/cancel", authMiddleware, cancelTiffinSubscription);

export default tiffinRouter;
