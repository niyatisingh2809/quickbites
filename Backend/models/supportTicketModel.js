import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    senderRole: {
      type: String,
      enum: ["customer", "restaurant_owner", "admin", "system"],
      required: true
    },
    senderName: { type: String, required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    // Internal team notes are strictly forbidden from customer-facing APIs
    isInternalNote: { type: Boolean, default: false, index: true },
    attachments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
        filename: { type: String, default: "" }
      }
    ],
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const ticketTimelineSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    actorName: { type: String, default: "System" },
    actorRole: { type: String, default: "system" },
    note: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `QB-TKT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
      index: true
    },
    orderNumber: { type: String, required: true, index: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
      index: true
    },
    restaurantName: { type: String, default: "" },
    issueCategory: {
      type: String,
      enum: [
        "missing_item",
        "wrong_item",
        "damaged_packaging",
        "delivery_delay_or_failure",
        "payment_or_billing",
        "quality_issue",
        "other"
      ],
      required: true,
      index: true
    },
    affectedItems: [
      {
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food", default: null },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        purchasedQuantity: { type: Number, required: true },
        unitPriceRupees: { type: Number, default: 0 },
        issueDescription: { type: String, default: "" }
      }
    ],
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1500
    },
    attachments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
        filename: { type: String, default: "" },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: ["Open", "Under Review", "Awaiting Customer", "Resolved", "Closed"],
      default: "Open",
      index: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true
    },
    assignedAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      index: true
    },
    messages: [ticketMessageSchema],
    resolution: {
      proposedResolution: { type: String, default: "" },
      finalResolution: { type: String, default: "" },
      resolutionType: {
        type: String,
        enum: ["none", "refund_issued", "replacement_sent", "coupon_issued", "info_provided", "rejected"],
        default: "none"
      },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
      resolvedAt: { type: Date, default: null }
    },
    reopenDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days window
    },
    slaTargetHours: {
      type: Number,
      default: 4 // Internal 4-hour SLA target
    },
    timeline: [ticketTimelineSchema]
  },
  { timestamps: true }
);

supportTicketSchema.index({ customerId: 1, createdAt: -1 });
supportTicketSchema.index({ restaurantId: 1, status: 1 });
supportTicketSchema.index({ orderId: 1, issueCategory: 1, status: 1 });

const supportTicketModel =
  mongoose.models.support_ticket || mongoose.model("support_ticket", supportTicketSchema);

export default supportTicketModel;
