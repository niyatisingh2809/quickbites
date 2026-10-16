import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
      index: true
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle", "ev"],
      default: "bike"
    },
    vehicleNumber: { type: String, default: "" },
    drivingLicenseNumber: { type: String, default: "" },
    aadhaarNumber: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    city: { type: String, required: true, index: true },
    documents: [
      {
        docType: {
          type: String,
          enum: ["DRIVING_LICENSE", "AADHAAR", "PAN", "VEHICLE_RC"],
          required: true
        },
        docUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false }
      }
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true
    },
    rejectionReason: { type: String, default: "" },
    isAvailable: { type: Boolean, default: false, index: true }, // Active on duty toggle
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [77.2090, 28.6139] },
      updatedAt: { type: Date, default: Date.now }
    },
    rating: { type: Number, default: 4.8, min: 1, max: 5 },
    completedDeliveriesCount: { type: Number, default: 0 },
    activeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      default: null
    },
    bankDetails: {
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      upiId: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ city: 1, status: 1, isAvailable: 1 });

const deliveryPartnerModel =
  mongoose.models.delivery_partner || mongoose.model("delivery_partner", deliveryPartnerSchema);

export default deliveryPartnerModel;
