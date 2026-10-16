import express from "express";
import { searchMealsByBudget, validateBudgetMealCheckout } from "../controllers/budgetMealController.js";

const budgetMealRouter = express.Router();

budgetMealRouter.post("/search", searchMealsByBudget);
budgetMealRouter.post("/validate-checkout", validateBudgetMealCheckout);

export default budgetMealRouter;
