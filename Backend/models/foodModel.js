import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    imagePublicId: { type: String, default: "" },
    category: { type: String, required: true, trim: true, index: true },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    reviewsCount: { type: Number, default: 120 },
    isAvailable: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

foodSchema.index({ category: 1, createdAt: -1 });

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;