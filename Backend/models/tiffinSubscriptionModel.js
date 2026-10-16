import mongoose from "mongoose";

const fulfilmentRecordSchema = new mongoose.Schema(
  {
    fulfilmentKey: { type: String, required: true, index: true }, // ${subscriptionId}_${dateString}_${mealType}
    dateString: { type: String, required: true },
    mealType: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "order" },
    status: {
      type: String,
      enum: ["created", "skipped", "failed"],
      default: "created"
    },
    dishName: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const tiffinSubscriptionSchema = new mongoose.Schema(
  {
    subscriptionNumber: {
      type: String,
      default: () => `TIF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      unique: true,
      index: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "restaurant", required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "tiffin_plan", required: true, index: true },
    planSnapshot: { type: Object, required: true }, // Immutable copy of plan details & policy
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    mealType: { type: String, default: "lunch" },
    deliveryAddress: { type: Object, required: true },
    deliverySlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true
    },
    skippedDates: [{ type: String }], // Array of 'YYYY-MM-DD' strings skipped before cutoff
    skipsUsed: { type: Number, default: 0 },
    creditsEarnedRupees: { type: Number, default: 0 },
    fulfilments: [fulfilmentRecordSchema],
    paymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "paid"
    },
    paymentTransactionId: { type: String, default: "" }
  },
  { timestamps: true }
);

tiffinSubscriptionSchema.index({ status: 1, startDate: 1, endDate: 1 });

const tiffinSubscriptionModel =
  mongoose.models.tiffin_subscription || mongoose.model("tiffin_subscription", tiffinSubscriptionSchema);

export default tiffinSubscriptionModel;
