import express from "express";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";
import {
  placeOrderCod,
  placeOrderRazorpay,
  verifyRazorpay,
  razorpayWebhook,
  previewOrderPricing,
  orderStateTransition,
  userOrders,
  listOrders,
  getOrder,
  updateStatus,
  verifyOrder,
  getRazorpayConfig,
  saveRazorpayConfig,
  getSettlementsLedger,
  markSettlementPaid,
  verifyPickupHandover,
  getPickupCode,
  reorderCheck
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Optional auth for public preview
const optionalAuth = (req, res, next) => {
  let token = req.headers.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next();
  authMiddleware(req, res, next);
};

// --- PRICING & CHECKOUT ---
orderRouter.post("/calculate-pricing", optionalAuth, previewOrderPricing);
orderRouter.post("/place", authMiddleware, placeOrderCod);
orderRouter.post("/placecod", authMiddleware, placeOrderCod);
orderRouter.post("/razorpay", authMiddleware, placeOrderRazorpay);
orderRouter.post("/verifyrazorpay", authMiddleware, verifyRazorpay);
orderRouter.post("/razorpay-webhook", razorpayWebhook);
orderRouter.post("/verify", verifyOrder);

// --- ORDER STATE MACHINE ---
orderRouter.patch("/:orderId/transition", authMiddleware, orderStateTransition);

// --- ORDER RETRIEVAL ---
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", authMiddleware, listOrders);
orderRouter.get("/track/:orderId", getOrder);
orderRouter.post("/status", authMiddleware, updateStatus);

// --- SETTLEMENTS & ACCOUNTING LEDGER ---
orderRouter.get(
  "/settlements",
  authMiddleware,
  authorizeRoles("admin", "restaurant_owner"),
  getSettlementsLedger
);
orderRouter.post(
  "/settlements/mark-paid",
  authMiddleware,
  authorizeRoles("admin"),
  markSettlementPaid
);

// --- RAZORPAY CONFIG ---
orderRouter.get("/razorpay-config", getRazorpayConfig);
orderRouter.post("/save-razorpay-config", authMiddleware, authorizeRoles("admin"), saveRazorpayConfig);

// --- SECURE PICKUP HANDOVER & SMART REORDER ---
orderRouter.post("/verify-pickup", authMiddleware, authorizeRoles("admin", "restaurant_owner"), verifyPickupHandover);
orderRouter.get("/pickup-code/:orderId", authMiddleware, getPickupCode);
orderRouter.post("/reorder-check", authMiddleware, reorderCheck);

export default orderRouter;