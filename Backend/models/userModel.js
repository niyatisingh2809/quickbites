import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "restaurant_owner", "delivery_partner", "rider", "admin"],
      default: "customer",
      index: true
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      index: true
    },
    phone: { type: String, default: "" },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "restaurant", default: null },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "delivery_partner", default: null },
    cartData: { type: Object, default: {} },
    favoriteFoods: [{ type: mongoose.Schema.Types.ObjectId, ref: "food" }],
    favoriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: "restaurant" }]
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;