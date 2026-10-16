import mongoose from "mongoose";

const dailyMenuSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    mealName: { type: String, required: true },
    description: { type: String, default: "" }, // e.g. "Dal Makhani, Shahi Paneer, 4 Butter Rotis, Steamed Rice, Salad"
    isVeg: { type: Boolean, default: true }
  },
  { _id: false }
);

const tiffinPlanSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    mealType: {
      type: String,
      enum: ["lunch", "dinner", "both"],
      default: "lunch",
      index: true
    },
    durationDays: { type: Number, default: 7, min: 1, max: 60 },
    priceRupees: { type: Number, required: true, min: 100 },
    deliverySlot: { type: String, default: "12:30 PM - 01:30 PM" },
    serviceCity: { type: String, required: true, index: true },
    servicePincodes: [{ type: String }],
    maxDailyCapacity: { type: Number, default: 40, min: 1 },
    activeSubscribersCount: { type: Number, default: 0 },
    skipCutoffHours: { type: Number, default: 3, min: 1, max: 24 }, // Cutoff before delivery slot
    skipPolicy: {
      type: {
        type: String,
        enum: ["wallet_credit", "extend_plan"],
        default: "wallet_credit"
      },
      creditPerSkipRupees: { type: Number, default: 80 },
      maxSkips: { type: Number, default: 3 }
    },
    weeklyMenu: [dailyMenuSchema],
    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active",
      index: true
    }
  },
  { timestamps: true }
);

tiffinPlanSchema.index({ serviceCity: 1, status: 1 });

const tiffinPlanModel =
  mongoose.models.tiffin_plan || mongoose.model("tiffin_plan", tiffinPlanSchema);

export default tiffinPlanModel;
