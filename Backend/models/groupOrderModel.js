import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    name: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const memberSelectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    userName: { type: String, required: true },
    items: [
      {
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true }, // in Rupees
        quantity: { type: Number, required: true, min: 1 },
        isVeg: { type: Boolean, default: true }
      }
    ],
    userFoodTotalRupees: { type: Number, default: 0 },
    userShareRupees: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const groupOrderSchema = new mongoose.Schema(
  {
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: { type: String, default: "PG / Office Group Meal", trim: true },
    hostUserId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    hostName: { type: String, required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "restaurant", required: true, index: true },
    deliveryAddress: { type: Object, required: true },
    status: {
      type: String,
      enum: ["open", "locked", "completed", "cancelled", "expired"],
      default: "open",
      index: true
    },
    expiresAt: { type: Date, required: true, index: true },
    members: [groupMemberSchema],
    memberSelections: [memberSelectionSchema],
    combinedPricing: {
      foodSubtotalRupees: { type: Number, default: 0 },
      packagingFeeRupees: { type: Number, default: 0 },
      deliveryFeeRupees: { type: Number, default: 0 },
      platformFeeRupees: { type: Number, default: 0 },
      gstTaxRupees: { type: Number, default: 0 },
      discountRupees: { type: Number, default: 0 },
      totalRupees: { type: Number, default: 0 }
    },
    perPersonBreakdown: [
      {
        userId: String,
        userName: String,
        foodTotalRupees: Number,
        allocatedFeesRupees: Number,
        totalShareRupees: Number
      }
    ],
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "order", default: null },
    idempotencyKey: { type: String, default: "" }
  },
  { timestamps: true }
);

groupOrderSchema.index({ expiresAt: 1, status: 1 });

const groupOrderModel =
  mongoose.models.group_order || mongoose.model("group_order", groupOrderSchema);

export default groupOrderModel;
