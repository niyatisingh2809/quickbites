import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  placeOrder,
  placeOrderCod,
  verifyOrder,
  stripeWebhook,
  userOrders,
  listOrders,
  updateStatus,
  getOrder
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/placecod", authMiddleware, placeOrderCod);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/webhook", stripeWebhook);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.get("/track/:orderId", getOrder);

export default orderRouter;