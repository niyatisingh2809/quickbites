import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    pincode: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true, index: true },
    area: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    status: {
      type: String,
      enum: ["pending", "launched", "notified"],
      default: "pending",
      index: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate signups for the exact same email + pincode
waitlistSchema.index({ email: 1, pincode: 1 }, { unique: true });

const waitlistModel = mongoose.models.waitlist || mongoose.model("waitlist", waitlistSchema);

export default waitlistModel;
