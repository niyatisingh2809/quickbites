import mongoose from "mongoose";

const documentSubSchema = new mongoose.Schema(
  {
    docType: {
      type: String,
      enum: ["FSSAI", "GST", "PAN", "BANK_PASSBOOK", "SHOP_ESTABLISHMENT"],
      required: true
    },
    docUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true
    },
    description: { type: String, default: "" },
    cuisine: {
      type: [String],
      default: ["North Indian"],
      index: true
    },
    image: { type: String, default: "default_restaurant.png" },
    bannerImage: { type: String, default: "" },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true, index: true },
      country: { type: String, default: "India" },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [77.2090, 28.6139] } // [longitude, latitude]
      }
    },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    openingHours: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "23:00" }
    },
    isOpen: { type: Boolean, default: true, index: true },
    serviceAvailable: { type: Boolean, default: true, index: true },
    avgPrepTimeMinutes: { type: Number, default: 25, min: 5, max: 120 },
    rushMode: {
      isPaused: { type: Boolean, default: false, index: true },
      pausedUntil: { type: Date, default: null },
      pauseReason: { type: String, default: "" },
      pausedAt: { type: Date, default: null },
      manualEstimatedPrepTime: { type: Number, default: 0 }
    },
    deliveryRadiusKm: { type: Number, default: 7, min: 1, max: 30 },
    packagingFee: { type: Number, default: 20, min: 0 }, // in rupees
    commissionRate: { type: Number, default: 15, min: 0, max: 50 }, // percentage
    fssaiLicenseNumber: { type: String, default: "" },
    gstin: { type: String, default: "" },
    documents: [documentSubSchema],
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true
    },
    rejectionReason: { type: String, default: "" },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    deliveryMode: {
      type: String,
      enum: ["platform", "restaurant_managed", "both"],
      default: "platform"
    },
    bankDetails: {
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
      upiId: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

restaurantSchema.index({ "address.city": 1, verificationStatus: 1, isOpen: 1 });
restaurantSchema.index({ "address.location": "2dsphere" });

const restaurantModel = mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);

export default restaurantModel;
