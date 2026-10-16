import supportTicketModel from "../models/supportTicketModel.js";
import orderModel from "../models/orderModel.js";
import restaurantModel from "../models/restaurantModel.js";
import userModel from "../models/userModel.js";
import auditLogModel from "../models/auditLogModel.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

/**
 * Helper: Strip internal team notes from ticket before sending to customer
 */
const sanitizeTicketForCustomer = (ticketObj) => {
  if (!ticketObj) return null;
  const doc = ticketObj.toObject ? ticketObj.toObject() : { ...ticketObj };
  if (doc.messages && Array.isArray(doc.messages)) {
    doc.messages = doc.messages.filter((m) => !m.isInternalNote);
  }
  return doc;
};

/**
 * 1. Customer: Create a Support Ticket
 */
export const createTicket = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId, issueCategory, description, affectedItems: rawAffectedItems } = req.body;

    if (!orderId || !issueCategory || !description) {
      return res.status(400).json({
        success: false,
        message: "Order ID, issue category, and description are required."
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a clear description (at least 10 characters)."
      });
    }

    // 1. Ownership & order validation
    const order = await orderModel.findById(orderId).populate("restaurantId", "name phone");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.userId.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only file complaints for your own orders."
      });
    }

    // 2. Prevent duplicate active ticket for identical issue on this order
    const duplicateTicket = await supportTicketModel.findOne({
      orderId: order._id,
      issueCategory,
      status: { $in: ["Open", "Under Review", "Awaiting Customer"] }
    });

    if (duplicateTicket) {
      return res.status(409).json({
        success: false,
        message: `An active complaint (#${duplicateTicket.ticketNumber}) is already being reviewed for this issue. You can reply directly in that ticket.`,
        ticketNumber: duplicateTicket.ticketNumber,
        ticketId: duplicateTicket._id
      });
    }

    // 3. Validate affected items against order snapshot
    let parsedAffectedItems = [];
    if (rawAffectedItems) {
      try {
        parsedAffectedItems = typeof rawAffectedItems === "string" ? JSON.parse(rawAffectedItems) : rawAffectedItems;
      } catch (e) {
        parsedAffectedItems = [];
      }
    }

    const validatedAffectedItems = [];
    if (Array.isArray(parsedAffectedItems) && parsedAffectedItems.length > 0) {
      for (const item of parsedAffectedItems) {
        // Find matching item in purchased snapshot
        const purchased = order.items.find(
          (oi) =>
            (item.foodId && oi.foodId && oi.foodId.toString() === item.foodId.toString()) ||
            oi.name.toLowerCase() === (item.name || "").toLowerCase()
        );

        if (!purchased) {
          return res.status(400).json({
            success: false,
            message: `Reported item [${item.name || "Unknown"}] was not part of this order.`
          });
        }

        const reportQty = parseInt(item.quantity) || 1;
        if (reportQty > purchased.quantity) {
          return res.status(400).json({
            success: false,
            message: `Reported quantity (${reportQty}) for "${purchased.name}" exceeds the purchased quantity (${purchased.quantity}).`
          });
        }

        validatedAffectedItems.push({
          foodId: purchased.foodId || null,
          name: purchased.name,
          quantity: reportQty,
          purchasedQuantity: purchased.quantity,
          unitPriceRupees: purchased.price,
          issueDescription: item.issueDescription || ""
        });
      }
    }

    // 4. Handle optional supporting image attachments
    const attachments = [];
    if (req.files && Array.isArray(req.files)) {
      if (req.files.length > 4) {
        return res.status(400).json({ success: false, message: "A maximum of 4 images can be uploaded." });
      }

      for (const file of req.files) {
        if (!file.mimetype.startsWith("image/")) {
          return res.status(400).json({ success: false, message: "Only image files (JPEG, PNG, WebP) are allowed." });
        }
        if (file.size > 5 * 1024 * 1024) {
          return res.status(400).json({ success: false, message: "Each attachment must be less than 5MB." });
        }

        try {
          const uploadRes = await uploadToCloudinary(file.buffer, "support_attachments");
          attachments.push({
            url: uploadRes.secure_url || uploadRes.url,
            publicId: uploadRes.public_id || "",
            filename: file.originalname || "attachment.jpg"
          });
        } catch (uploadErr) {
          console.warn("Cloudinary upload failed, saving fallback URL:", uploadErr.message);
          attachments.push({
            url: `/images/support_${Date.now()}_${file.originalname || "attachment.jpg"}`,
            publicId: "",
            filename: file.originalname || "attachment.jpg"
          });
        }
      }
    }

    // 5. Build Customer Snapshot
    const user = await userModel.findById(customerId);
    const customerName = user?.name || order.address?.firstName || "Customer";
    const customerEmail = user?.email || order.address?.email || "customer@quickbites.in";
    const customerPhone = user?.phone || order.address?.phone || "";

    const priority = ["missing_item", "payment_or_billing"].includes(issueCategory) ? "high" : "medium";

    const newTicket = new supportTicketModel({
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      restaurantId: order.restaurantId?._id || order.restaurantId,
      restaurantName: order.restaurantId?.name || "QuickBites Kitchen",
      issueCategory,
      affectedItems: validatedAffectedItems,
      description: description.trim(),
      attachments,
      status: "Open",
      priority,
      messages: [
        {
          senderId: customerId,
          senderRole: "customer",
          senderName: customerName,
          message: description.trim(),
          isInternalNote: false,
          attachments
        }
      ],
      timeline: [
        {
          action: "TICKET_CREATED",
          actorId: customerId,
          actorName: customerName,
          actorRole: "customer",
          note: `Issue reported: [${issueCategory}]. Ref: awaiting agent review.`,
          timestamp: new Date()
        }
      ]
    });

    await newTicket.save();

    // Mark order as having an active support ticket
    order.hasActiveSupportTicket = true;
    order.supportTicketId = newTicket._id;
    await order.save();

    res.status(201).json({
      success: true,
      message: `Support ticket #${newTicket.ticketNumber} created successfully. Our team will review within 4 hours.`,
      ticket: sanitizeTicketForCustomer(newTicket)
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit support ticket. Please try again." });
  }
};

/**
 * 2. Customer: Get all tickets for logged-in user
 */
export const getCustomerTickets = async (req, res) => {
  try {
    const customerId = req.user.id;
    const tickets = await supportTicketModel
      .find({ customerId })
      .populate("restaurantId", "name image")
      .sort({ createdAt: -1 });

    const sanitized = tickets.map((t) => sanitizeTicketForCustomer(t));

    res.json({ success: true, count: sanitized.length, tickets: sanitized });
  } catch (error) {
    console.error("Get Customer Tickets Error:", error);
    res.status(500).json({ success: false, message: "Failed to load support tickets." });
  }
};

/**
 * 3. Shared: Get ticket details by ID with role-based redactions
 */
export const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    const ticket = await supportTicketModel
      .findById(ticketId)
      .populate("orderId")
      .populate("restaurantId", "name address phone image");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    // Role checks
    if (userRole === "customer") {
      if (ticket.customerId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden." });
      }
      return res.json({ success: true, ticket: sanitizeTicketForCustomer(ticket) });
    }

    if (userRole === "restaurant_owner") {
      const rest = await restaurantModel.findOne({ ownerId: userId });
      if (!rest || rest._id.toString() !== ticket.restaurantId?._id?.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: Not your restaurant's ticket." });
      }
    }

    // Admins and authorized restaurants can see internal notes and raw data
    res.json({ success: true, ticket });
  } catch (error) {
    console.error("Get Ticket Details Error:", error);
    res.status(500).json({ success: false, message: "Failed to load ticket details." });
  }
};

/**
 * 4. Reply to ticket (Customer, Restaurant Owner, or Platform Admin)
 */
export const replyToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, isInternalNote = false } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty." });
    }

    const ticket = await supportTicketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    // Guard closed tickets
    if (ticket.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "This ticket has been permanently closed. If needed, please submit a new complaint."
      });
    }

    const user = await userModel.findById(userId);
    const senderName = user?.name || (userRole === "admin" ? "QuickBites Support" : "Kitchen Manager");

    let internalFlag = Boolean(isInternalNote);

    // Customer can NEVER post internal notes
    if (userRole === "customer") {
      if (ticket.customerId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden." });
      }
      internalFlag = false;

      // If status was Awaiting Customer, transition back to Under Review
      if (ticket.status === "Awaiting Customer") {
        ticket.status = "Under Review";
        ticket.timeline.push({
          action: "STATUS_CHANGED",
          actorId: userId,
          actorName: senderName,
          actorRole: "customer",
          note: "Customer provided additional details. Status moved to Under Review.",
          timestamp: new Date()
        });
      }
    } else if (userRole === "restaurant_owner") {
      const rest = await restaurantModel.findOne({ ownerId: userId });
      if (!rest || rest._id.toString() !== ticket.restaurantId.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: Not your restaurant's order." });
      }
    }

    // Add message
    ticket.messages.push({
      senderId: userId,
      senderRole: userRole,
      senderName,
      message: message.trim(),
      isInternalNote: internalFlag,
      createdAt: new Date()
    });

    ticket.timeline.push({
      action: internalFlag ? "INTERNAL_NOTE_ADDED" : "REPLY_POSTED",
      actorId: userId,
      actorName: senderName,
      actorRole: userRole,
      note: internalFlag ? "Added internal team note" : "Customer visible reply sent",
      timestamp: new Date()
    });

    await ticket.save();

    res.json({
      success: true,
      message: internalFlag ? "Internal note added." : "Reply sent successfully.",
      ticket: userRole === "customer" ? sanitizeTicketForCustomer(ticket) : ticket
    });
  } catch (error) {
    console.error("Reply Ticket Error:", error);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
};

/**
 * 5. Update Ticket Status & Resolution (Admin or Restaurant Owner)
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, proposedResolution, finalResolution, resolutionType, priority, assignedAdminId } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    const ticket = await supportTicketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    const user = await userModel.findById(userId);
    const actorName = user?.name || "Admin Staff";

    // Restaurant Owner permissions check
    if (userRole === "restaurant_owner") {
      const rest = await restaurantModel.findOne({ ownerId: userId });
      if (!rest || rest._id.toString() !== ticket.restaurantId.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden." });
      }

      // Restaurants can propose resolutions and update status to 'Under Review' or 'Awaiting Customer'
      if (status && !["Under Review", "Awaiting Customer"].includes(status)) {
        return res.status(403).json({
          success: false,
          message: "Restaurant partners can only propose resolutions or request info from customer. Final resolution is confirmed by platform admin."
        });
      }

      if (proposedResolution) {
        ticket.resolution.proposedResolution = proposedResolution;
        ticket.timeline.push({
          action: "RESOLUTION_PROPOSED",
          actorId: userId,
          actorName,
          actorRole: "restaurant_owner",
          note: `Kitchen proposed resolution: ${proposedResolution}`,
          timestamp: new Date()
        });
      }
    } else if (userRole === "admin") {
      // Platform Admin has full lifecycle control
      if (priority) ticket.priority = priority;
      if (assignedAdminId) ticket.assignedAdminId = assignedAdminId;

      if (proposedResolution) ticket.resolution.proposedResolution = proposedResolution;
      if (finalResolution) ticket.resolution.finalResolution = finalResolution;
      if (resolutionType) ticket.resolution.resolutionType = resolutionType;

      if (status) {
        const prevStatus = ticket.status;
        ticket.status = status;

        if (status === "Resolved" || status === "Closed") {
          ticket.resolution.resolvedBy = userId;
          ticket.resolution.resolvedAt = new Date();
          ticket.reopenDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days reopen period
        }

        ticket.timeline.push({
          action: "STATUS_CHANGED",
          actorId: userId,
          actorName,
          actorRole: "admin",
          note: `Status changed from [${prevStatus}] to [${status}]`,
          timestamp: new Date()
        });
      }
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await ticket.save();

    res.json({
      success: true,
      message: `Ticket updated successfully. Current status: [${ticket.status}]`,
      ticket
    });
  } catch (error) {
    console.error("Update Ticket Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update ticket." });
  }
};

/**
 * 6. Customer: Reopen Ticket within allowed window
 */
export const reopenTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reason } = req.body;
    const customerId = req.user.id;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ success: false, message: "Please provide a valid reason to reopen." });
    }

    const ticket = await supportTicketModel.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    if (ticket.customerId.toString() !== customerId) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    if (ticket.status !== "Resolved") {
      return res.status(400).json({
        success: false,
        message: `Only resolved tickets can be reopened. Current status is [${ticket.status}].`
      });
    }

    if (ticket.reopenDeadline && new Date() > ticket.reopenDeadline) {
      ticket.status = "Closed";
      await ticket.save();
      return res.status(400).json({
        success: false,
        message: "The 7-day window to reopen this ticket has expired. Please submit a new support request."
      });
    }

    const user = await userModel.findById(customerId);
    const customerName = user?.name || "Customer";

    ticket.status = "Under Review";
    ticket.messages.push({
      senderId: customerId,
      senderRole: "customer",
      senderName,
      message: `Reopened Ticket: ${reason.trim()}`,
      isInternalNote: false,
      createdAt: new Date()
    });

    ticket.timeline.push({
      action: "TICKET_REOPENED",
      actorId: customerId,
      actorName: customerName,
      actorRole: "customer",
      note: `Customer reopened ticket. Reason: ${reason.trim()}`,
      timestamp: new Date()
    });

    await ticket.save();

    res.json({
      success: true,
      message: "Your ticket has been reopened and queued for immediate senior agent review.",
      ticket: sanitizeTicketForCustomer(ticket)
    });
  } catch (error) {
    console.error("Reopen Ticket Error:", error);
    res.status(500).json({ success: false, message: "Failed to reopen ticket." });
  }
};

/**
 * 7. Platform Admin: List tickets with filtering, pagination, and SLA tracking
 */
export const listAdminTickets = async (req, res) => {
  try {
    const { status, issueCategory, priority, restaurantId, search, page = 1, limit = 20 } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    const filter = {};

    // Restaurant isolation: Restaurant owners only see tickets concerning their own restaurant
    if (userRole === "restaurant_owner") {
      const rest = await restaurantModel.findOne({ ownerId: userId });
      if (!rest) {
        return res.status(404).json({ success: false, message: "No restaurant found for your account." });
      }
      filter.restaurantId = rest._id;
    } else if (restaurantId && restaurantId !== "all") {
      filter.restaurantId = restaurantId;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (issueCategory && issueCategory !== "all") {
      filter.issueCategory = issueCategory;
    }

    if (priority && priority !== "all") {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { ticketNumber: new RegExp(search, "i") },
        { orderNumber: new RegExp(search, "i") },
        { customerName: new RegExp(search, "i") },
        { customerPhone: new RegExp(search, "i") }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = await supportTicketModel.countDocuments(filter);

    const tickets = await supportTicketModel
      .find(filter)
      .populate("restaurantId", "name address")
      .populate("assignedAdminId", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      tickets
    });
  } catch (error) {
    console.error("List Admin Tickets Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tickets." });
  }
};

/**
 * 8. Platform Admin: Process Idempotent Refund linked to Ticket & Order
 */
export const processTicketRefund = async (req, res) => {
  try {
    const { ticketId, orderId, amountRupees, reason, idempotencyKey, settlementMode = "manual_cash" } = req.body;
    const adminId = req.user.id;

    if (!orderId || !amountRupees || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "Order ID, refund amount, and a unique idempotencyKey are required."
      });
    }

    const refundAmount = parseFloat(amountRupees);
    if (isNaN(refundAmount) || refundAmount <= 0) {
      return res.status(400).json({ success: false, message: "Refund amount must be a positive number." });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // 1. Idempotency Check: if this exact idempotencyKey was already executed, return existing record
    const existingRefund = (order.refundHistory || []).find((r) => r.idempotencyKey === idempotencyKey);
    if (existingRefund) {
      return res.json({
        success: true,
        message: "Refund already processed with this idempotency key.",
        refund: existingRefund,
        order
      });
    }

    // 2. Validate remaining refundable amount
    const totalOrderAmount = order.amount || order.pricingBreakdown?.totalRupees || 0;
    const currentlyRefunded = order.refundAmountRupees || 0;
    const remainingRefundable = Math.max(0, totalOrderAmount - currentlyRefunded);

    if (refundAmount > remainingRefundable) {
      return res.status(400).json({
        success: false,
        message: `Refund of ₹${refundAmount} exceeds remaining refundable limit (₹${remainingRefundable}).`
      });
    }

    const refundId = `REF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    let gateway = "manual";
    let gatewayRefundId = "";
    let finalStatus = "successful";
    let refundNote = reason || "Customer satisfaction refund";

    // 3. Evaluate payment method
    if (order.paymentMethod === "cod") {
      // COD orders CANNOT be refunded via Stripe/Razorpay!
      // Must use auditable manual recording mode
      gateway = settlementMode; // e.g. "manual_cash", "manual_bank_transfer", "store_credit"
      finalStatus = "successful";
      refundNote = `[COD Settlement via ${settlementMode.toUpperCase()}]: ${refundNote}`;
    } else if (order.paymentMethod === "stripe" && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      try {
        if (order.stripeSessionId) {
          const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
          if (session.payment_intent) {
            const stripeRefund = await stripe.refunds.create({
              payment_intent: session.payment_intent,
              amount: Math.round(refundAmount * 100), // in paise
              idempotencyKey
            });
            gateway = "stripe";
            gatewayRefundId = stripeRefund.id;
            finalStatus = stripeRefund.status === "succeeded" ? "successful" : "processing";
          }
        }
      } catch (stripeErr) {
        console.warn("Stripe live refund API notice:", stripeErr.message);
        gateway = "manual_refund_required";
        finalStatus = "manual_refund_required";
        refundNote += ` (Gateway offline / test mode: ${stripeErr.message})`;
      }
    } else {
      // Local development or simulated gateway: mark as manual settlement
      gateway = "manual_refund_required";
      finalStatus = "manual_refund_required";
      refundNote += " (Flagged for offline account transfer / store credit)";
    }

    // 4. Update order state atomically
    order.refundAmountRupees = currentlyRefunded + refundAmount;
    order.refundableAmountRupees = totalOrderAmount - order.refundAmountRupees;
    order.refundStatus = finalStatus === "successful" ? (order.refundAmountRupees >= totalOrderAmount ? "successful" : "processing") : "manual_refund_required";

    if (order.refundAmountRupees >= totalOrderAmount) {
      order.paymentStatus = "refunded";
    }

    const refundRecord = {
      refundId,
      amountRupees: refundAmount,
      reason: refundNote,
      idempotencyKey,
      gateway,
      gatewayRefundId,
      status: finalStatus,
      initiatedBy: adminId,
      processedAt: new Date(),
      notes: `Approved for Ticket ${ticketId || "N/A"}`
    };

    order.refundHistory.push(refundRecord);
    await order.save();

    // 5. Update Ticket if ticketId provided
    if (ticketId) {
      const ticket = await supportTicketModel.findById(ticketId);
      if (ticket) {
        ticket.resolution.finalResolution = `Refund of ₹${refundAmount} recorded (${gateway}). Status: ${finalStatus}.`;
        ticket.resolution.resolutionType = "refund_issued";
        ticket.resolution.resolvedBy = adminId;
        ticket.resolution.resolvedAt = new Date();
        ticket.status = "Resolved";
        ticket.timeline.push({
          action: "REFUND_EXECUTED",
          actorId: adminId,
          actorName: req.user.name || "Platform Admin",
          actorRole: "admin",
          note: `Refund ID ${refundId} for ₹${refundAmount} processed. Gateway: [${gateway}].`,
          timestamp: new Date()
        });
        await ticket.save();
      }
    }

    // 6. Audit Trail
    await auditLogModel.create({
      userId: adminId,
      userRole: "admin",
      action: "ORDER_REFUND_EXECUTED",
      entityType: "Order",
      entityId: order._id.toString(),
      details: {
        orderNumber: order.orderNumber,
        refundId,
        refundAmount,
        totalRefunded: order.refundAmountRupees,
        remainingRefundable: order.refundableAmountRupees,
        gateway,
        status: finalStatus,
        reason: refundNote
      }
    });

    res.json({
      success: true,
      message: `Refund of ₹${refundAmount} recorded successfully [${finalStatus}].`,
      refund: refundRecord,
      order
    });
  } catch (error) {
    console.error("Process Refund Error:", error);
    res.status(500).json({ success: false, message: "Failed to process refund." });
  }
};
