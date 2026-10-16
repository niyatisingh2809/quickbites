import express from "express";
import {
  loginUser,
  registerUser,
  getProfile,
  toggleFavoriteFood,
  toggleFavoriteRestaurant,
  getUserFavorites
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getProfile);

// Phase 4: Favorites
userRouter.post("/favorites/food/toggle", authMiddleware, toggleFavoriteFood);
userRouter.post("/favorites/restaurant/toggle", authMiddleware, toggleFavoriteRestaurant);
userRouter.get("/favorites", authMiddleware, getUserFavorites);

export default userRouter;