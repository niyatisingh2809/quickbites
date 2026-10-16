import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
      index: true
    },
    userEmail: { type: String, default: "" },
    userRole: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ["Restaurant", "User", "Order", "DeliveryPartner", "Food", "System"],
      required: true,
      index: true
    },
    entityId: { type: String, default: "", index: true },
    details: { type: Object, default: {} },
    ipAddress: { type: String, default: "" }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

const auditLogModel = mongoose.models.audit_log || mongoose.model("audit_log", auditLogSchema);

export default auditLogModel;
