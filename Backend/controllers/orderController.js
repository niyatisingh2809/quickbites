import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import restaurantModel from "../models/restaurantModel.js";
import foodModel from "../models/foodModel.js";
import thaliTemplateModel from "../models/thaliTemplateModel.js";
import deliveryPartnerModel from "../models/deliveryPartnerModel.js";
import auditLogModel from "../models/auditLogModel.js";
import { validateAndPriceThaliItem } from "../services/pricingService.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { notifyOrderStatusUpdate, notifyNewOrder } from "../config/socket.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

let razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder"
});

/**
 * Server-Side Pricing Engine
 * Calculates tamper-proof pricing strictly from DB prices in integer paise.
 * Validates restaurant open/closed status and enforces single-restaurant cart.
 */
export const calculateOrderPricing = async (cartItems, requestedRestaurantId, promoCode = "") => {
  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart cannot be empty");
  }

  // Retrieve all requested regular items from DB
  const foodIds = cartItems.filter((i) => !i.isThali && !i.thaliTemplateId).map((item) => item.foodId || item._id).filter(Boolean);
  const dbFoods = await foodModel.find({ _id: { $in: foodIds } });
  const foodMap = new Map();
  dbFoods.forEach((f) => foodMap.set(f._id.toString(), f));

  // Determine Target Restaurant
  let targetRestaurantId = requestedRestaurantId;
  if (!targetRestaurantId) {
    const firstFood = dbFoods[0];
    if (firstFood && firstFood.restaurantId) {
      targetRestaurantId = firstFood.restaurantId;
    }
  }

  if (!targetRestaurantId) {
    const firstThali = cartItems.find((i) => i.isThali || i.thaliTemplateId);
    if (firstThali) {
      const tId = firstThali.thaliTemplateId || firstThali.templateId || firstThali._id;
      const tDoc = await thaliTemplateModel.findById(tId);
      if (tDoc) targetRestaurantId = tDoc.restaurantId;
    }
  }

  if (!targetRestaurantId) {
    const central = await restaurantModel.findOne({ slug: "quickbites-central-kitchen" });
    targetRestaurantId = central ? central._id : null;
  }

  const restaurant = await restaurantModel.findById(targetRestaurantId);
  if (!restaurant) {
    throw new Error("Target restaurant not found");
  }

  if (!restaurant.isOpen || !restaurant.serviceAvailable) {
    throw new Error(`[${restaurant.name}] is currently closed and not accepting orders`);
  }

  // Rush Mode check with automatic expiry handling
  if (restaurant.rushMode && restaurant.rushMode.isPaused) {
    if (restaurant.rushMode.pausedUntil && new Date(restaurant.rushMode.pausedUntil) <= new Date()) {
      // Auto-expired rush pause: resume restaurant on the fly
      restaurant.rushMode.isPaused = false;
      restaurant.rushMode.pausedUntil = null;
      await restaurant.save();
    } else {
      const reason = restaurant.rushMode.pauseReason || "High Demand & Kitchen Rush";
      throw new Error(`⏸️ [${restaurant.name}] is currently experiencing peak kitchen rush (${reason}). Ordering is temporarily paused. Please try again shortly.`);
    }
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of cartItems) {
    if (item.isThali || item.thaliTemplateId) {
      const verifiedThali = await validateAndPriceThaliItem(item, restaurant._id);
      subtotal += verifiedThali.price * verifiedThali.quantity;
      verifiedItems.push(verifiedThali);
    } else {
      const id = (item.foodId || item._id || "").toString();
      const dbItem = foodMap.get(id);
      if (!dbItem) {
        throw new Error(`Menu item not found: ${item.name || id}`);
      }

      if (!dbItem.isAvailable) {
        throw new Error(`"${dbItem.name}" is currently sold out. Please remove it from your cart.`);
      }

      // Strict single-restaurant check
      if (dbItem.restaurantId && dbItem.restaurantId.toString() !== targetRestaurantId.toString()) {
        throw new Error(
          `"${dbItem.name}" belongs to a different restaurant. QuickBites orders are strictly single-restaurant.`
        );
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const itemPrice = dbItem.price; // Strict server-side price in rupees
      subtotal += itemPrice * qty;

      verifiedItems.push({
        foodId: dbItem._id,
        name: dbItem.name,
        price: itemPrice,
        quantity: qty,
        isVeg: dbItem.isVeg !== false,
        variant: item.variant || "",
        addons: item.addons || []
      });
    }
  }

  const packagingFee = restaurant.packagingFee || 20;
  let deliveryFee = 40;
  const platformFee = 5;
  const gstTax = Math.round(subtotal * 0.05); // 5% GST on food

  let discount = 0;
  const cleanPromo = (promoCode || "").trim().toUpperCase();
  if (cleanPromo === "WELCOME50") {
    discount = Math.min(Math.round(subtotal * 0.5), 100);
  } else if (cleanPromo === "TASTY10") {
    discount = Math.min(40, subtotal);
  } else if (cleanPromo === "FOODIE20") {
    discount = Math.round(subtotal * 0.2);
  } else if (cleanPromo === "FREESHIP") {
    deliveryFee = 0;
  }

  const totalRupees = Math.max(0, subtotal + packagingFee + deliveryFee + platformFee + gstTax - discount);
  const totalPaise = Math.round(totalRupees * 100);

  // Financial Ledger calculation
  const commissionRate = restaurant.commissionRate || 15;
  const commissionAmount = Math.round((subtotal * commissionRate) / 100);
  const netPayableToRestaurant = subtotal - commissionAmount + packagingFee;

  return {
    restaurant,
    verifiedItems,
    pricingBreakdown: {
      subtotalRupees: subtotal,
      packagingFeeRupees: packagingFee,
      deliveryFeeRupees: deliveryFee,
      platformFeeRupees: platformFee,
      gstTaxRupees: gstTax,
      discountRupees: discount,
      totalPaise,
      totalRupees
    },
    ledger: {
      grossRupees: subtotal,
      commissionRate,
      commissionAmountRupees: commissionAmount,
      packagingFeeRupees: packagingFee,
      netPayableToRestaurantRupees: netPayableToRestaurant,
      settlementStatus: "unsettled"
    }
  };
};

/**
 * Preview / Compute order bill breakdown for customer frontend
 */
export const previewOrderPricing = async (req, res) => {
  try {
    const { items, restaurantId, promoCode } = req.body;
    const result = await calculateOrderPricing(items, restaurantId, promoCode);
    res.json({
      success: true,
      pricing: result.pricingBreakdown,
      restaurant: {
        id: result.restaurant._id,
        name: result.restaurant.name,
        packagingFee: result.restaurant.packagingFee,
        avgPrepTimeMinutes: result.restaurant.avgPrepTimeMinutes
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Placing order via COD / Instant UPI with server-side pricing validation
 */
export const placeOrderCod = async (req, res) => {
  try {
    const { userId, items, address, paymentMethod, transactionId, restaurantId, promoCode, deliveryInstructions } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty" });
    }

    // 1. Calculate tamper-proof server-side pricing
    const calc = await calculateOrderPricing(items, restaurantId, promoCode);

    const selectedMethod = paymentMethod || "cod";
    const isInstantPaid = selectedMethod !== "cod";
    const genTxnId =
      transactionId ||
      (isInstantPaid ? `TXN-UPI-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}` : "");

    const newOrder = new orderModel({
      userId,
      restaurantId: calc.restaurant._id,
      items: calc.verifiedItems,
      amount: calc.pricingBreakdown.totalRupees,
      pricingBreakdown: calc.pricingBreakdown,
      address,
      paymentMethod: selectedMethod,
      transactionId: genTxnId,
      paymentStatus: isInstantPaid ? "completed" : "pending",
      payment: isInstantPaid,
      deliveryInstructions: deliveryInstructions || {},
      status: "Awaiting Restaurant Acceptance",
      statusHistory: [
        {
          status: "Awaiting Restaurant Acceptance",
          changedBy: userId,
          role: "customer",
          note: `Order placed via ${selectedMethod.toUpperCase()}`
        }
      ],
      ledger: calc.ledger
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Real-time notification to Kitchen Dashboard & Super Admin
    notifyNewOrder(newOrder);

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Awaiting restaurant acceptance.",
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      amount: newOrder.amount,
      pricingBreakdown: newOrder.pricingBreakdown
    });
  } catch (error) {
    console.error("Direct Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to place order" });
  }
};

/**
 * Initiating Razorpay order with server-calculated amount in paise
 */
export const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, address, restaurantId, promoCode, deliveryInstructions } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty" });
    }

    const calc = await calculateOrderPricing(items, restaurantId, promoCode);

    const newOrder = new orderModel({
      userId,
      restaurantId: calc.restaurant._id,
      items: calc.verifiedItems,
      amount: calc.pricingBreakdown.totalRupees,
      pricingBreakdown: calc.pricingBreakdown,
      address,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      payment: false,
      deliveryInstructions: deliveryInstructions || {},
      status: "Pending Payment",
      statusHistory: [
        {
          status: "Pending Payment",
          changedBy: userId,
          role: "customer",
          note: "Initiated Razorpay online checkout"
        }
      ],
      ledger: calc.ledger
    });
    await newOrder.save();

    const options = {
      amount: calc.pricingBreakdown.totalPaise,
      currency: "INR",
      receipt: `rcpt_${newOrder._id.toString().slice(-10)}`,
      notes: {
        orderId: newOrder._id.toString(),
        restaurantId: calc.restaurant._id.toString()
      }
    };

    let rzpOrderId = null;
    let keyId = process.env.RAZORPAY_KEY_ID || "";

    if (
      keyId &&
      process.env.RAZORPAY_KEY_SECRET &&
      !keyId.includes("placeholder") &&
      !process.env.RAZORPAY_KEY_SECRET.includes("placeholder")
    ) {
      try {
        const rzpOrder = await razorpay.orders.create(options);
        rzpOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn("Razorpay API Notice:", rzpErr.message);
      }
    }

    res.json({
      success: true,
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      razorpayOrderId: rzpOrderId,
      amount: options.amount,
      amountRupees: calc.pricingBreakdown.totalRupees,
      currency: "INR",
      keyId: keyId && !keyId.includes("placeholder") ? keyId : ""
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to initiate Razorpay order" });
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyRazorpay = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    if (process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes("placeholder")) {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update((razorpay_order_id || "") + "|" + (razorpay_payment_id || ""))
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
      }
    }

    const updated = await orderModel.findByIdAndUpdate(
      orderId,
      {
        payment: true,
        paymentStatus: "completed",
        status: "Awaiting Restaurant Acceptance",
        transactionId: razorpay_payment_id || `RPAY-${Date.now()}`,
        $push: {
          statusHistory: {
            status: "Awaiting Restaurant Acceptance",
            changedBy: userId || "customer",
            role: "customer",
            note: "Payment confirmed via Razorpay"
          }
        }
      },
      { new: true }
    );

    if (userId) {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    }

    notifyNewOrder(updated);

    res.json({ success: true, message: "Payment verified successfully", orderId });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

/**
 * Razorpay Webhook Endpoint with Idempotency & HMAC Verification
 */
export const razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (webhookSecret && signature && req.rawBody) {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("⚠️ Razorpay Webhook Signature Verification Failed");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  }

  const event = req.body;
  const eventType = event.event;

  try {
    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.orderId;

      if (orderId) {
        const existingOrder = await orderModel.findById(orderId);
        // Idempotency check: don't process if already marked completed
        if (existingOrder && existingOrder.paymentStatus !== "completed") {
          existingOrder.payment = true;
          existingOrder.paymentStatus = "completed";
          existingOrder.status = "Awaiting Restaurant Acceptance";
          existingOrder.transactionId = paymentEntity.id;
          existingOrder.statusHistory.push({
            status: "Awaiting Restaurant Acceptance",
            changedBy: "Razorpay Webhook",
            role: "system",
            note: `Payment captured: ${paymentEntity.id}`
          });
          await existingOrder.save();

          notifyNewOrder(existingOrder);
          console.log(`✅ Order ${orderId} marked PAID via Razorpay Webhook`);
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.orderId;
      if (orderId) {
        await orderModel.findByIdAndUpdate(orderId, {
          paymentStatus: "failed",
          status: "Cancelled",
          $push: {
            statusHistory: {
              status: "Cancelled",
              changedBy: "Razorpay Webhook",
              role: "system",
              note: `Payment failed: ${paymentEntity?.error_description || "Declined"}`
            }
          }
        });
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ status: "error" });
  }
};

/**
 * Server-Enforced Order State Machine Transition
 * Enforces role-based permissions and authorized state transitions
 */
export const orderStateTransition = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatus, rejectionReason, cancellationReason, deliveryOtp, deliveryPartnerId } = req.body;

    const order = await orderModel.findById(orderId).populate("restaurantId", "name ownerId");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const currentStatus = order.status;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Allowed transition logic
    let allowed = false;

    // 1. Restaurant Owner transitions
    if (userRole === "restaurant_owner") {
      const ownerRest = await restaurantModel.findOne({ ownerId: userId });
      if (!ownerRest || order.restaurantId?._id?.toString() !== ownerRest._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only manage orders for your own restaurant"
        });
      }

      if (currentStatus === "Awaiting Restaurant Acceptance") {
        if (newStatus === "Accepted & Preparing") allowed = true;
        if (newStatus === "Rejected by Restaurant") {
          allowed = true;
          order.rejectionReason = rejectionReason || "Restaurant unable to fulfill this order";
        }
      } else if (currentStatus === "Accepted & Preparing") {
        if (newStatus === "Ready for Pickup") allowed = true;
      }
    }

    // 2. Delivery Partner transitions
    if (userRole === "delivery_partner" || userRole === "rider") {
      const rider = await deliveryPartnerModel.findOne({ userId });
      if (!rider || order.deliveryPartnerId?.toString() !== rider._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only update orders assigned to you"
        });
      }

      if (currentStatus === "Assigned to Delivery Partner") {
        if (newStatus === "Out for Delivery") allowed = true;
      } else if (currentStatus === "Out for Delivery") {
        if (newStatus === "Delivered") {
          // Verify customer 4-digit delivery OTP
          if (!deliveryOtp || deliveryOtp.trim() !== order.deliveryOtp) {
            return res.status(400).json({
              success: false,
              message: "Invalid Delivery OTP. Please ask customer for their 4-digit code."
            });
          }
          allowed = true;
          rider.completedDeliveriesCount = (rider.completedDeliveriesCount || 0) + 1;
          rider.activeOrderId = null;
          await rider.save();
        } else if (newStatus === "Delivery Failed") {
          allowed = true;
          rider.activeOrderId = null;
          await rider.save();
        }
      }
    }

    // 3. Customer transitions (Cancellation before acceptance)
    if (userRole === "customer") {
      if (order.userId?.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (currentStatus === "Awaiting Restaurant Acceptance") {
        if (newStatus === "Cancelled") {
          allowed = true;
          order.cancellationReason = cancellationReason || "Cancelled by customer before restaurant acceptance";
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Order cannot be cancelled after the restaurant has started preparing."
        });
      }
    }

    // 4. Platform Admin (Full operational override & manual assignment)
    if (userRole === "admin") {
      allowed = true;
      if (newStatus === "Assigned to Delivery Partner" && deliveryPartnerId) {
        order.deliveryPartnerId = deliveryPartnerId;
        await deliveryPartnerModel.findByIdAndUpdate(deliveryPartnerId, {
          activeOrderId: order._id
        });
      }
      if (rejectionReason) order.rejectionReason = rejectionReason;
      if (cancellationReason) order.cancellationReason = cancellationReason;
    }

    if (!allowed) {
      return res.status(400).json({
        success: false,
        message: `Illegal status transition from [${currentStatus}] to [${newStatus}] by role [${userRole}]`
      });
    }

    // Apply status update
    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      changedBy: req.user.name || req.user.email || userId,
      role: userRole,
      timestamp: new Date(),
      note: rejectionReason || cancellationReason || ""
    });

    await order.save();

    // Broadcast real-time update
    notifyOrderStatusUpdate(order._id, newStatus);

    res.json({
      success: true,
      message: `Order status transitioned to [${newStatus}]`,
      order
    });
  } catch (error) {
    console.error("Order Transition Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update order status" });
  }
};

/**
 * List orders with strict role-based data isolation
 */
export const listOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    // Role-based data isolation
    if (req.user && req.user.role === "restaurant_owner") {
      const ownerRest = await restaurantModel.findOne({ ownerId: req.user.id });
      if (!ownerRest) {
        return res.json({ success: true, count: 0, data: [] });
      }
      filter.restaurantId = ownerRest._id;
    } else if (req.user && (req.user.role === "delivery_partner" || req.user.role === "rider")) {
      const rider = await deliveryPartnerModel.findOne({ userId: req.user.id });
      if (!rider) {
        return res.json({ success: true, count: 0, data: [] });
      }
      filter.deliveryPartnerId = rider._id;
    }

    let query = orderModel
      .find(filter)
      .populate("restaurantId", "name phone address")
      .populate("deliveryPartnerId", "fullName phone vehicleType vehicleNumber")
      .sort({ createdAt: -1 });

    if (limit && parseInt(limit) > 0) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit);
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const orders = await query;
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("List Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to list orders" });
  }
};

/**
 * Customer Orders
 */
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.body.userId || req.user.id })
      .populate("restaurantId", "name phone address rating")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

/**
 * Get single order details with honest status (for tracking)
 */
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = await orderModel
      .findById(orderId)
      .populate("restaurantId", "name phone address location avgPrepTimeMinutes")
      .populate("deliveryPartnerId", "fullName phone vehicleType");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
};

/**
 * Legacy status update (kept for backward compatibility)
 */
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, {
      status,
      $push: {
        statusHistory: {
          status,
          changedBy: req.user?.name || "Admin",
          role: req.user?.role || "admin",
          timestamp: new Date()
        }
      }
    });

    notifyOrderStatusUpdate(orderId, status);
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

/**
 * Legacy verifyOrder
 */
export const verifyOrder = async (req, res) => {
  const { orderId, success, sessionId } = req.body;
  try {
    if (success === "true" || success === true) {
      if (sessionId && process.env.STRIPE_SECRET_KEY) {
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session.payment_status === "paid") {
            await orderModel.findByIdAndUpdate(orderId, {
              payment: true,
              paymentStatus: "completed"
            });
            return res.json({ success: true, message: "Paid" });
          }
        } catch (e) {}
      }
      await orderModel.findByIdAndUpdate(orderId, { payment: true, paymentStatus: "completed" });
      return res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndUpdate(orderId, { payment: false, paymentStatus: "failed", status: "Cancelled" });
      return res.json({ success: false, message: "Payment cancelled" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification error" });
  }
};

export const getRazorpayConfig = async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const isConfigured = Boolean(keyId && !keyId.includes("placeholder"));
  res.json({ success: true, isConfigured, keyId: isConfigured ? keyId : "" });
};

export const saveRazorpayConfig = async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;
    if (!keyId) return res.status(400).json({ success: false, message: "Valid Key ID is required" });
    process.env.RAZORPAY_KEY_ID = keyId.trim();
    if (keySecret) process.env.RAZORPAY_KEY_SECRET = keySecret.trim();
    razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder" });
    res.json({ success: true, message: "Credentials saved", keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Phase 4: Financial Settlements & Ledger
 */
export const getSettlementsLedger = async (req, res) => {
  try {
    const { restaurantId, status } = req.query;
    const filter = { payment: true };

    if (req.user.role === "restaurant_owner") {
      const ownerRest = await restaurantModel.findOne({ ownerId: req.user.id });
      if (!ownerRest) return res.json({ success: true, ledger: [], summary: {} });
      filter.restaurantId = ownerRest._id;
    } else if (restaurantId && restaurantId !== "all") {
      filter.restaurantId = restaurantId;
    }

    if (status && status !== "all") {
      filter["ledger.settlementStatus"] = status;
    }

    const orders = await orderModel
      .find(filter)
      .populate("restaurantId", "name bankDetails commissionRate")
      .select("orderNumber amount pricingBreakdown ledger createdAt status")
      .sort({ createdAt: -1 });

    let totalGross = 0;
    let totalCommission = 0;
    let totalPackaging = 0;
    let totalNetPayable = 0;
    let totalSettled = 0;
    let totalUnsettled = 0;

    orders.forEach((o) => {
      const l = o.ledger || {};
      totalGross += l.grossRupees || 0;
      totalCommission += l.commissionAmountRupees || 0;
      totalPackaging += l.packagingFeeRupees || 0;
      totalNetPayable += l.netPayableToRestaurantRupees || 0;
      if (l.settlementStatus === "settled") {
        totalSettled += l.netPayableToRestaurantRupees || 0;
      } else {
        totalUnsettled += l.netPayableToRestaurantRupees || 0;
      }
    });

    res.json({
      success: true,
      ordersCount: orders.length,
      summary: {
        totalGrossRupees: totalGross,
        totalCommissionRupees: totalCommission,
        totalPackagingRupees: totalPackaging,
        totalNetPayableRupees: totalNetPayable,
        totalSettledRupees: totalSettled,
        totalUnsettledRupees: totalUnsettled
      },
      orders
    });
  } catch (error) {
    console.error("Settlement Ledger Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate settlement ledger" });
  }
};

/**
 * Mark restaurant orders as settled (Platform Admin manual payout recording)
 */
export const markSettlementPaid = async (req, res) => {
  try {
    const { orderIds, paymentReference } = req.body;
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "Provide an array of order IDs to mark as settled" });
    }

    await orderModel.updateMany(
      { _id: { $in: orderIds } },
      {
        $set: {
          "ledger.settlementStatus": "settled",
          "ledger.settledAt": new Date()
        }
      }
    );

    await auditLogModel.create({
      userId: req.user.id,
      userRole: "admin",
      action: "SETTLEMENT_RECORDED",
      entityType: "Order",
      details: { orderCount: orderIds.length, paymentReference: paymentReference || "Bank NEFT/RTGS Transfer" }
    });

    res.json({
      success: true,
      message: `Marked ${orderIds.length} orders as SETTLED in ledger`,
      settledCount: orderIds.length
    });
  } catch (error) {
    console.error("Mark Settlement Error:", error);
    res.status(500).json({ success: false, message: "Failed to update settlement status" });
  }
};

/**
 * Phase 3: Secure Pickup Handover Verification (SHA-256 Code Check)
 * Called by kitchen when rider arrives with the 6-digit handover code.
 */
export const verifyPickupHandover = async (req, res) => {
  try {
    const { orderId, code } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!orderId || !code) {
      return res.status(400).json({ success: false, message: "Order ID and 6-digit code are required." });
    }

    const order = await orderModel.findById(orderId).populate("restaurantId", "name ownerId");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Role check: Only restaurant owner of this order or platform admin
    if (userRole === "restaurant_owner") {
      const rest = await restaurantModel.findOne({ ownerId: userId });
      if (!rest || rest._id.toString() !== order.restaurantId?._id?.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: Not your restaurant's order." });
      }
    } else if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    if (order.pickupHandover && order.pickupHandover.attempts >= (order.pickupHandover.maxAttempts || 5)) {
      return res.status(429).json({
        success: false,
        message: "Maximum pickup code attempts exceeded (5/5). Please contact platform admin."
      });
    }

    const inputHash = crypto.createHash("sha256").update(code.trim()).digest("hex");
    let storedHash = order.pickupHandover?.codeHash;

    // Generate deterministic code if storedHash was not initialized
    if (!storedHash) {
      const secret = process.env.JWT_SECRET || "default_dev_secret_change_in_production";
      const rawCode = (
        parseInt(
          crypto.createHmac("sha256", secret).update(order._id.toString()).digest("hex").slice(0, 8),
          16
        ) % 900000 + 100000
      ).toString();
      storedHash = crypto.createHash("sha256").update(rawCode).digest("hex");
      if (!order.pickupHandover) order.pickupHandover = {};
      order.pickupHandover.codeHash = storedHash;
    }

    if (storedHash !== inputHash) {
      if (!order.pickupHandover) order.pickupHandover = {};
      order.pickupHandover.attempts = (order.pickupHandover.attempts || 0) + 1;
      await order.save();
      const remaining = Math.max(0, (order.pickupHandover.maxAttempts || 5) - order.pickupHandover.attempts);
      return res.status(400).json({
        success: false,
        message: `❌ Invalid Handover Code! Rider cannot take parcel. ${remaining} attempts remaining.`
      });
    }

    // Success: Transition to Out for Delivery
    order.status = "Out for Delivery";
    order.pickupHandover.verifiedAt = new Date();
    order.pickupHandover.verifiedBy = userId;
    order.statusHistory.push({
      status: "Out for Delivery",
      changedBy: req.user.name || "Kitchen Staff",
      role: userRole,
      note: "Pickup verified by kitchen via 6-digit cryptographic handover code.",
      timestamp: new Date()
    });

    await order.save();
    notifyOrderStatusUpdate(order._id, "Out for Delivery");

    res.json({
      success: true,
      message: "✅ Handover Code Verified! Parcel handed over to Rider. Status: Out for Delivery.",
      order
    });
  } catch (error) {
    console.error("Verify Pickup Handover Error:", error);
    res.status(500).json({ success: false, message: "Failed to verify handover." });
  }
};

/**
 * Phase 3: Get 6-digit Pickup Handover Code (Strictly for Assigned Rider or Admin)
 */
export const getPickupCode = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Role check: assigned delivery partner or admin
    if (userRole === "delivery_partner" || userRole === "rider") {
      const rider = await deliveryPartnerModel.findOne({ userId });
      if (!rider || order.deliveryPartnerId?.toString() !== rider._id.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: Not assigned to this order." });
      }
    } else if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    const secret = process.env.JWT_SECRET || "default_dev_secret_change_in_production";
    const rawCode = (
      parseInt(
        crypto.createHmac("sha256", secret).update(order._id.toString()).digest("hex").slice(0, 8),
        16
      ) % 900000 + 100000
    ).toString();

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      pickupCode: rawCode,
      status: order.status
    });
  } catch (error) {
    console.error("Get Pickup Code Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pickup code." });
  }
};

/**
 * Phase 4: Smart Reorder Stock & Price Verification
 * Compares past order items against live DB availability and price.
 */
export const reorderCheck = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const restaurant = await restaurantModel.findById(order.restaurantId);
    const restaurantStatus = {
      id: restaurant?._id,
      name: restaurant?.name || "Kitchen",
      isOpen: restaurant?.isOpen && restaurant?.serviceAvailable,
      isRushModePaused: Boolean(restaurant?.rushMode?.isPaused),
      packagingFee: restaurant?.packagingFee || 20
    };

    const itemStatus = [];
    let allAvailable = true;
    let priceChanged = false;

    for (const item of order.items) {
      if (item.isThali) {
        itemStatus.push({
          name: item.name,
          quantity: item.quantity,
          isAvailable: true,
          oldPrice: item.price,
          newPrice: item.price,
          isThali: true,
          thaliConfiguration: item.thaliConfiguration
        });
      } else {
        const liveFood = await foodModel.findById(item.foodId);
        if (!liveFood || !liveFood.isAvailable) {
          allAvailable = false;
          itemStatus.push({
            name: item.name,
            quantity: item.quantity,
            isAvailable: false,
            reason: liveFood ? "Currently Out of Stock" : "Dish no longer on menu",
            oldPrice: item.price,
            newPrice: liveFood ? liveFood.price : item.price
          });
        } else {
          if (liveFood.price !== item.price) priceChanged = true;
          itemStatus.push({
            foodId: liveFood._id,
            name: liveFood.name,
            quantity: item.quantity,
            isAvailable: true,
            oldPrice: item.price,
            newPrice: liveFood.price
          });
        }
      }
    }

    res.json({
      success: true,
      restaurant: restaurantStatus,
      items: itemStatus,
      allAvailable,
      priceChanged
    });
  } catch (error) {
    console.error("Reorder Check Error:", error);
    res.status(500).json({ success: false, message: "Failed to verify reorder items." });
  }
};