import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    imagePublicId: { type: String, default: "" },
    category: { type: String, required: true, trim: true, index: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "restaurant", index: true },
    isVeg: { type: Boolean, default: true, index: true },
    prepTimeMinutes: { type: Number, default: 20 },
    variants: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    addons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    reviewsCount: { type: Number, default: 120 },
    mealType: {
      type: String,
      enum: ["light", "regular", "filling"],
      default: "regular",
      index: true
    },
    spiceLevel: {
      type: String,
      enum: ["mild", "medium", "spicy"],
      default: "medium",
      index: true
    },
    cuisine: { type: String, default: "North Indian", index: true },
    tags: [{ type: String }],
    isAvailable: { type: Boolean, default: true, index: true },
    featuredRank: { type: Number, default: 999, index: true }
  },
  { timestamps: true }
);

foodSchema.index({ category: 1, createdAt: -1 });

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;