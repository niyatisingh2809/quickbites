import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, default: () => `FD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}` },
    userId: { type: String, required: true, index: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: {
      type: String,
      default: "Food Processing"
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod", "gpay", "paytm", "phonepe", "card", "netbanking", "upi"],
      default: "cod"
    },
    transactionId: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    payment: { type: Boolean, default: false },
    stripeSessionId: { type: String, default: "" },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;