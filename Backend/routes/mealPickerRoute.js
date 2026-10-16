import express from "express";
import { suggestMeals } from "../controllers/mealPickerController.js";

const mealPickerRouter = express.Router();

// Public recommendation endpoint
mealPickerRouter.post("/suggest", suggestMeals);

export default mealPickerRouter;
