import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: String, default: "system" },
    role: { type: String, default: "system" },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      default: () => `QB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      unique: true,
      index: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
      index: true
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "delivery_partner",
      default: null,
      index: true
    },
    items: [
      {
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food" },
        name: { type: String, required: true },
        price: { type: Number, required: true }, // unit price in rupees
        quantity: { type: Number, required: true, min: 1 },
        isVeg: { type: Boolean, default: true },
        variant: { type: String, default: "" },
        addons: [{ name: String, price: Number }],
        isThali: { type: Boolean, default: false },
        thaliTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: "thali_template" },
        thaliConfiguration: {
          templateName: { type: String, default: "" },
          basePriceRupees: { type: Number, default: 0 },
          components: [
            {
              groupId: { type: String, default: "" },
              groupName: { type: String, default: "" },
              componentId: { type: String, default: "" },
              name: { type: String, default: "" },
              quantity: { type: Number, default: 1 },
              extraPriceRupees: { type: Number, default: 0 },
              portion: { type: String, default: "" },
              image: { type: String, default: "" },
              isVeg: { type: Boolean, default: true }
            }
          ],
          preparationInstructions: { type: String, default: "" },
          unitPriceRupees: { type: Number, default: 0 }
        }
      }
    ],
    amount: { type: Number, required: true }, // total in rupees (backward compatibility)
    pricingBreakdown: {
      subtotalRupees: { type: Number, required: true },
      packagingFeeRupees: { type: Number, default: 20 },
      deliveryFeeRupees: { type: Number, default: 40 },
      platformFeeRupees: { type: Number, default: 5 },
      gstTaxRupees: { type: Number, default: 0 },
      discountRupees: { type: Number, default: 0 },
      totalPaise: { type: Number, required: true },
      totalRupees: { type: Number, required: true }
    },
    address: { type: Object, required: true },
    status: {
      type: String,
      enum: [
        "Pending Payment",
        "Awaiting Restaurant Acceptance",
        "Accepted & Preparing",
        "Ready for Pickup",
        "Assigned to Delivery Partner",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Rejected by Restaurant",
        "Delivery Failed",
        // Legacy statuses for backward compatibility:
        "Food Processing",
        "Out for delivery"
      ],
      default: "Awaiting Restaurant Acceptance",
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod", "gpay", "paytm", "phonepe", "card", "netbanking", "upi", "razorpay"],
      default: "cod"
    },
    transactionId: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      index: true
    },
    payment: { type: Boolean, default: false },
    deliveryOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString()
    },
    rejectionReason: { type: String, default: "" },
    cancellationReason: { type: String, default: "" },
    statusHistory: [statusHistorySchema],
    ledger: {
      grossRupees: { type: Number, default: 0 },
      commissionRate: { type: Number, default: 15 },
      commissionAmountRupees: { type: Number, default: 0 },
      packagingFeeRupees: { type: Number, default: 0 },
      netPayableToRestaurantRupees: { type: Number, default: 0 },
      settlementStatus: {
        type: String,
        enum: ["unsettled", "settled"],
        default: "unsettled",
        index: true
      },
      settledAt: { type: Date, default: null }
    },
    // Refund Lifecycle Management
    refundAmountRupees: { type: Number, default: 0, min: 0 },
    refundableAmountRupees: { type: Number, default: 0, min: 0 },
    refundStatus: {
      type: String,
      enum: ["none", "requested", "processing", "successful", "failed", "manual_refund_required"],
      default: "none",
      index: true
    },
    refundHistory: [
      {
        refundId: { type: String, required: true },
        amountRupees: { type: Number, required: true },
        reason: { type: String, default: "" },
        idempotencyKey: { type: String, required: true },
        gateway: { type: String, default: "manual" },
        gatewayRefundId: { type: String, default: "" },
        status: { type: String, default: "successful" },
        initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        processedAt: { type: Date, default: Date.now },
        notes: { type: String, default: "" }
      }
    ],

    // Support Ticket Association
    hasActiveSupportTicket: { type: Boolean, default: false, index: true },
    supportTicketId: { type: mongoose.Schema.Types.ObjectId, ref: "support_ticket", default: null },

    // Phase 3: Secure Pickup Handover (SHA-256 Hash)
    pickupHandover: {
      codeHash: { type: String, default: "" },
      attempts: { type: Number, default: 0 },
      maxAttempts: { type: Number, default: 5 },
      expiresAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
      adminOverridden: { type: Boolean, default: false },
      overrideReason: { type: String, default: "" }
    },

    // Phase 5: Customer Delivery Instructions Snapshot
    deliveryInstructions: {
      landmark: { type: String, default: "", maxlength: 100 },
      buildingOrGate: { type: String, default: "", maxlength: 150 },
      dropOffPreference: {
        type: String,
        enum: ["hand_to_customer", "leave_at_door", "leave_with_guard"],
        default: "hand_to_customer"
      },
      contactPreference: {
        type: String,
        enum: ["call_on_arrival", "dont_ring_bell", "whatsapp_only"],
        default: "call_on_arrival"
      },
      specialNote: { type: String, default: "", maxlength: 200 }
    },

    stripeSessionId: { type: String, default: "" },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ deliveryPartnerId: 1, status: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;