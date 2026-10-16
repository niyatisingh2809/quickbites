import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";
import { addFood, listFood, removeFood, toggleAvailability } from "../controllers/foodController.js";

const foodRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// Public dish listing for customer app & discovery
foodRouter.get("/list", listFood);

// Protected endpoints restricted to Platform Admins and Restaurant Owners
foodRouter.post(
  "/add",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  upload.single("image"),
  addFood
);

foodRouter.post(
  "/remove",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  removeFood
);

foodRouter.patch(
  "/availability",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  toggleAvailability
);

export default foodRouter;