import express from "express";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";
import {
  getRestaurantThalis,
  getThaliById,
  validateCustomerThali,
  createThaliTemplate,
  updateThaliTemplate,
  toggleComponentAvailability,
  deleteThaliTemplate
} from "../controllers/thaliController.js";

const thaliRouter = express.Router();

// Public routes
thaliRouter.get("/list", getRestaurantThalis);
thaliRouter.get("/:id", getThaliById);
thaliRouter.post("/validate-price", validateCustomerThali);

// Protected routes (Admin / Restaurant Owner)
thaliRouter.post(
  "/create",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  createThaliTemplate
);

thaliRouter.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  updateThaliTemplate
);

thaliRouter.patch(
  "/:id/component-availability",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  toggleComponentAvailability
);

thaliRouter.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  deleteThaliTemplate
);

export default thaliRouter;
