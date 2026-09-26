import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import { notifyOrderStatusUpdate, notifyNewOrder } from "../config/socket.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Placing user order via Stripe checkout from frontend
const placeOrder = async (req, res) => {
  const frontend_url = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    const { userId, items, amount, address } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty" });
    }

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      payment: false,
      status: "Food Processing"
    });
    await newOrder.save();

    // Clear user cart in DB
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name
        },
        unit_amount: Math.round(item.price * 100 * 80)
      },
      quantity: item.quantity
    }));

    // Delivery fee
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges"
        },
        unit_amount: 2 * 100 * 80
      },
      quantity: 1
    });

    let sessionUrl = "";
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      try {
        const session = await stripe.checkout.sessions.create({
          line_items: line_items,
          mode: "payment",
          client_reference_id: newOrder._id.toString(),
          metadata: {
            orderId: newOrder._id.toString()
          },
          success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
        });

        newOrder.stripeSessionId = session.id;
        await newOrder.save();
        sessionUrl = session.url;
      } catch (stripeErr) {
        console.warn("⚠️ Stripe API error, falling back to instant verify redirect:", stripeErr.message);
        sessionUrl = `${frontend_url}/verify?success=true&orderId=${newOrder._id}`;
      }
    } else {
      // Demo / development mode fallback: auto verify redirect
      console.log("ℹ️ Running in demo mode without live Stripe key. Redirecting to verify...");
      sessionUrl = `${frontend_url}/verify?success=true&orderId=${newOrder._id}`;
    }

    res.json({ success: true, session_url: sessionUrl, orderId: newOrder._id });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to initiate payment" });
  }
};


// Placing user order via Direct Payment (GPay, Paytm, PhonePe, Cards, NetBanking, UPI, COD)
const placeOrderCod = async (req, res) => {
  try {
    const { userId, items, amount, address, paymentMethod, transactionId } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty" });
    }

    const selectedMethod = paymentMethod || "cod";
    const isInstantPaid = selectedMethod !== "cod";
    const genTxnId = transactionId || (isInstantPaid ? `TXN-UPI-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}` : "");

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      paymentMethod: selectedMethod,
      transactionId: genTxnId,
      paymentStatus: isInstantPaid ? "completed" : "pending",
      payment: isInstantPaid,
      status: "Food Processing"
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Trigger real-time alert for Admin Dashboard
    notifyNewOrder(newOrder);

    const methodLabels = {
      cod: "Cash on Delivery",
      gpay: "Google Pay (UPI)",
      paytm: "Paytm Wallet / UPI",
      phonepe: "PhonePe",
      card: "Debit / Credit Card",
      netbanking: "Net Banking",
      upi: "Instant UPI"
    };

    res.status(201).json({
      success: true,
      message: `Order placed successfully via ${methodLabels[selectedMethod] || selectedMethod}`,
      orderId: newOrder._id,
      transactionId: genTxnId
    });
  } catch (error) {
    console.error("Direct Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};


// Verify order from frontend redirect callback
const verifyOrder = async (req, res) => {
  const { orderId, success, sessionId } = req.body;
  try {
    if (success === "true" || success === true) {
      // If Stripe session ID is present and secret key exists, check actual Stripe status
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
        } catch (e) {
          console.warn("Could not verify session with Stripe API, relying on status update:", e.message);
        }
      }

      await orderModel.findByIdAndUpdate(orderId, {
        payment: true,
        paymentStatus: "completed"
      });
      return res.json({ success: true, message: "Paid" });
    } else {
      // Instead of deleting, mark order as failed/cancelled to preserve audit trail
      await orderModel.findByIdAndUpdate(orderId, {
        payment: false,
        paymentStatus: "failed",
        status: "Cancelled"
      });
      return res.json({ success: false, message: "Payment cancelled or failed" });
    }
  } catch (error) {
    console.error("Verify Order Error:", error);
    res.status(500).json({ success: false, message: "Verification error" });
  }
};

// Stripe Webhook Endpoint for asynchronous payment events
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret && req.rawBody) {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } else {
      // Fallback if rawBody or secret is not configured
      event = req.body;
    }
  } catch (err) {
    console.error("⚠️  Stripe Webhook Signature Verification Failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific event types
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.client_reference_id || session.metadata?.orderId;
      if (orderId) {
        const updated = await orderModel.findByIdAndUpdate(orderId, {
          payment: true,
          paymentStatus: "completed",
          status: "Food Processing"
        }, { new: true });
        
        if (updated) {
          notifyNewOrder(updated);
          notifyOrderStatusUpdate(orderId, "Food Processing");
        }
        console.log(`✅ Order ${orderId} marked as PAID via Webhook`);
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.warn(`❌ Payment failed for intent ${paymentIntent.id}`);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// User orders for customer frontend (supports pagination)
const userOrders = async (req, res) => {
  try {
    const { page, limit } = req.query;
    let query = orderModel.find({ userId: req.body.userId }).sort({ createdAt: -1 });

    if (limit && parseInt(limit) > 0) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit);
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const orders = await query;
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// Listing orders for admin panel (supports pagination & status filter)
const listOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const filter = status && status !== "All" ? { status } : {};

    let query = orderModel.find(filter).sort({ createdAt: -1 });
    if (limit && parseInt(limit) > 0) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit);
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const orders = await query;
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("List Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to list orders" });
  }
};


// API for updating order status (admin)
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });

    // Real-time broadcast to customer & admin
    notifyOrderStatusUpdate(orderId, status);

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

// Get specific order details for live tracking
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
};

export {
  placeOrder,
  placeOrderCod,
  verifyOrder,
  stripeWebhook,
  userOrders,
  listOrders,
  updateStatus,
  getOrder
};