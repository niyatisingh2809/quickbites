import express from "express";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";
import { getPerformanceAnalytics } from "../controllers/analyticsController.js";

const analyticsRouter = express.Router();

// Performance Analytics (Admin and Restaurant Owners)
analyticsRouter.get(
  "/performance",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  getPerformanceAnalytics
);

export default analyticsRouter;
