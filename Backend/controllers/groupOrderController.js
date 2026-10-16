import groupOrderModel from "../models/groupOrderModel.js";
import restaurantModel from "../models/restaurantModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { calculateDeliveredPrice } from "../services/pricingService.js";
import crypto from "crypto";
import { notifyNewOrder } from "../config/socket.js";

/**
 * 1. Host creates a new group order
 */
export const createGroupOrder = async (req, res) => {
  try {
    const { restaurantId, deliveryAddress, title, durationMinutes = 60 } = req.body;
    const hostUserId = req.user.id;

    if (!restaurantId || !deliveryAddress || !deliveryAddress.city) {
      return res.status(400).json({
        success: false,
        message: "Restaurant and delivery address (with city) are required to start a group order"
      });
    }

    const restaurant = await restaurantModel.findById(restaurantId);
    if (!restaurant || restaurant.verificationStatus !== "approved" || !restaurant.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Selected restaurant is currently unavailable or closed"
      });
    }

    const hostUser = await userModel.findById(hostUserId);
    const inviteCode = crypto.randomBytes(6).toString("hex");
    const expiresAt = new Date(Date.now() + Math.min(Math.max(15, parseInt(durationMinutes)), 180) * 60 * 1000);

    const group = new groupOrderModel({
      inviteCode,
      title: title ? title.trim() : `${hostUser.name}'s Group Order`,
      hostUserId,
      hostName: hostUser.name,
      restaurantId,
      deliveryAddress,
      status: "open",
      expiresAt,
      members: [
        {
          userId: hostUserId,
          name: hostUser.name,
          joinedAt: new Date()
        }
      ],
      memberSelections: []
    });

    await group.save();

    res.status(201).json({
      success: true,
      message: "Group order created! Share the invite link with your PG or office colleagues.",
      inviteCode,
      group
    });
  } catch (error) {
    console.error("Create Group Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create group order" });
  }
};

/**
 * 2. Get group order details by invite code & auto-join
 */
export const getGroupOrderDetails = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const group = await groupOrderModel
      .findOne({ inviteCode })
      .populate("restaurantId", "name slug address cuisine packagingFee isOpen avgPrepTimeMinutes");

    if (!group) {
      return res.status(404).json({ success: false, message: "Invalid or expired group order invite link" });
    }

    // Check expiry
    if (group.status === "open" && new Date() > new Date(group.expiresAt)) {
      group.status = "expired";
      await group.save();
    }

    // Auto-join if user is signed in and not yet in members
    if (req.user && req.user.id && group.status === "open") {
      const alreadyMember = group.members.some((m) => m.userId.toString() === req.user.id);
      if (!alreadyMember) {
        const user = await userModel.findById(req.user.id);
        if (user) {
          group.members.push({
            userId: user._id,
            name: user.name,
            joinedAt: new Date()
          });
          await group.save();
        }
      }
    }

    // Fetch menu for this restaurant so participants can easily select
    const menu = await foodModel.find({
      restaurantId: group.restaurantId?._id || group.restaurantId,
      isAvailable: true
    });

    res.json({
      success: true,
      group: {
        id: group._id,
        inviteCode: group.inviteCode,
        title: group.title,
        hostUserId: group.hostUserId,
        hostName: group.hostName,
        restaurant: group.restaurantId,
        deliveryAddress: group.deliveryAddress,
        status: group.status,
        expiresAt: group.expiresAt,
        members: group.members, // Privacy-preserved: name & userId only
        memberSelections: group.memberSelections,
        combinedPricing: group.combinedPricing,
        perPersonBreakdown: group.perPersonBreakdown,
        isHost: req.user ? req.user.id === group.hostUserId.toString() : false
      },
      menu
    });
  } catch (error) {
    console.error("Get Group Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch group order details" });
  }
};

/**
 * 3. Participant adds / edits their own items in the group order
 */
export const updateMemberSelection = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const { items, notes } = req.body;
    const userId = req.user.id;

    const group = await groupOrderModel.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ success: false, message: "Group order not found" });
    }

    if (group.status !== "open") {
      return res.status(400).json({
        success: false,
        message: `This group order is [${group.status.toUpperCase()}]. Modifications are no longer allowed.`
      });
    }

    if (new Date() > new Date(group.expiresAt)) {
      group.status = "expired";
      await group.save();
      return res.status(400).json({ success: false, message: "The order deadline has expired." });
    }

    // Verify items from database
    const foodIds = (items || []).map((i) => i.foodId).filter(Boolean);
    const dbFoods = await foodModel.find({ _id: { $in: foodIds } });
    const foodMap = new Map();
    dbFoods.forEach((f) => foodMap.set(f._id.toString(), f));

    let userFoodTotal = 0;
    const verifiedUserItems = [];

    for (const i of items || []) {
      const dbFood = foodMap.get(i.foodId.toString());
      if (!dbFood || !dbFood.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Item "${i.name || i.foodId}" is currently sold out.`
        });
      }

      const qty = Math.max(1, parseInt(i.quantity) || 1);
      userFoodTotal += dbFood.price * qty;

      verifiedUserItems.push({
        foodId: dbFood._id,
        name: dbFood.name,
        price: dbFood.price,
        quantity: qty,
        isVeg: dbFood.isVeg !== false
      });
    }

    const user = await userModel.findById(userId);

    // Update or insert selection for this user
    const existingIndex = group.memberSelections.findIndex((s) => s.userId.toString() === userId);
    if (existingIndex >= 0) {
      if (verifiedUserItems.length === 0) {
        group.memberSelections.splice(existingIndex, 1);
      } else {
        group.memberSelections[existingIndex] = {
          userId,
          userName: user.name,
          items: verifiedUserItems,
          userFoodTotalRupees: userFoodTotal,
          userShareRupees: userFoodTotal, // Will be updated on lock
          updatedAt: new Date()
        };
      }
    } else if (verifiedUserItems.length > 0) {
      group.memberSelections.push({
        userId,
        userName: user.name,
        items: verifiedUserItems,
        userFoodTotalRupees: userFoodTotal,
        userShareRupees: userFoodTotal,
        updatedAt: new Date()
      });
    }

    await group.save();

    res.json({
      success: true,
      message: "Your meal selection has been saved to the group tray",
      memberSelections: group.memberSelections
    });
  } catch (error) {
    console.error("Update Member Selection Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update your meal selection" });
  }
};

/**
 * 4. Host locks group order and calculates per-person cost breakdown
 */
export const lockGroupOrder = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const group = await groupOrderModel.findOne({ inviteCode });
    if (!group) return res.status(404).json({ success: false, message: "Group order not found" });

    if (group.hostUserId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the group host can lock the order" });
    }

    if (group.memberSelections.length === 0) {
      return res.status(400).json({ success: false, message: "No items have been selected by any member" });
    }

    // Flatten all items across all participants
    const allItems = [];
    group.memberSelections.forEach((sel) => {
      sel.items.forEach((item) => {
        allItems.push({
          foodId: item.foodId,
          quantity: item.quantity,
          name: item.name
        });
      });
    });

    // Run unified server pricing service
    const calculation = await calculateDeliveredPrice({
      items: allItems,
      restaurantId: group.restaurantId,
      deliveryAddress: group.deliveryAddress
    });

    const b = calculation.breakdown;
    group.combinedPricing = {
      foodSubtotalRupees: b.foodSubtotalRupees,
      packagingFeeRupees: b.packagingFeeRupees,
      deliveryFeeRupees: b.deliveryFeeRupees,
      platformFeeRupees: b.platformFeeRupees,
      gstTaxRupees: b.gstTaxRupees,
      totalRupees: b.finalPayableRupees
    };

    // Calculate fair fee allocation using equal proportional split with host rounding adjustment
    // Total fees to split = packaging + delivery + platform fee + GST
    const totalFeesRupees = b.packagingFeeRupees + b.deliveryFeeRupees + b.platformFeeRupees + b.gstTaxRupees;
    const totalFoodSubtotal = b.foodSubtotalRupees;

    let allocatedSum = 0;
    const breakdown = group.memberSelections.map((sel, idx) => {
      const foodTotal = sel.userFoodTotalRupees;
      // Proportional fee ratio
      const ratio = totalFoodSubtotal > 0 ? foodTotal / totalFoodSubtotal : 1 / group.memberSelections.length;
      let memberFees = Math.round(totalFeesRupees * ratio);

      // Rounding adjustment on last member so sum of member shares equals exact total order cost
      if (idx === group.memberSelections.length - 1) {
        memberFees = totalFeesRupees - allocatedSum;
      } else {
        allocatedSum += memberFees;
      }

      const totalMemberShare = foodTotal + memberFees;

      return {
        userId: sel.userId.toString(),
        userName: sel.userName,
        foodTotalRupees: foodTotal,
        allocatedFeesRupees: memberFees,
        totalShareRupees: totalMemberShare
      };
    });

    group.perPersonBreakdown = breakdown;
    group.status = "locked";
    await group.save();

    res.json({
      success: true,
      message: "Group order locked! Combined bill breakdown generated.",
      combinedPricing: group.combinedPricing,
      perPersonBreakdown: group.perPersonBreakdown
    });
  } catch (error) {
    console.error("Lock Group Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to lock group order" });
  }
};

/**
 * 5. Host checks out and pays once for the locked group order (Idempotent)
 */
export const checkoutGroupOrder = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const { paymentMethod = "cod", idempotencyKey } = req.body;
    const hostUserId = req.user.id;

    const group = await groupOrderModel.findOne({ inviteCode });
    if (!group) return res.status(404).json({ success: false, message: "Group order not found" });

    if (group.hostUserId.toString() !== hostUserId) {
      return res.status(403).json({ success: false, message: "Only the host can pay and place the group order" });
    }

    if (group.status !== "locked") {
      return res.status(400).json({ success: false, message: "Order must be locked before checkout" });
    }

    // Idempotency protection against duplicate requests
    if (group.idempotencyKey && group.idempotencyKey === idempotencyKey && group.orderId) {
      return res.json({
        success: true,
        message: "Order already placed",
        orderId: group.orderId
      });
    }

    // Flatten items with participant tag
    const orderItems = [];
    group.memberSelections.forEach((sel) => {
      sel.items.forEach((item) => {
        orderItems.push({
          foodId: item.foodId,
          name: `${item.name} (${sel.userName})`,
          price: item.price,
          quantity: item.quantity,
          isVeg: item.isVeg
        });
      });
    });

    const isPaid = paymentMethod !== "cod";

    const newOrder = new orderModel({
      userId: hostUserId,
      restaurantId: group.restaurantId,
      items: orderItems,
      amount: group.combinedPricing.totalRupees,
      pricingBreakdown: {
        subtotalRupees: group.combinedPricing.foodSubtotalRupees,
        packagingFeeRupees: group.combinedPricing.packagingFeeRupees,
        deliveryFeeRupees: group.combinedPricing.deliveryFeeRupees,
        platformFeeRupees: group.combinedPricing.platformFeeRupees,
        gstTaxRupees: group.combinedPricing.gstTaxRupees,
        discountRupees: 0,
        totalPaise: group.combinedPricing.totalRupees * 100,
        totalRupees: group.combinedPricing.totalRupees
      },
      address: {
        ...group.deliveryAddress,
        notes: `[GROUP ORDER: ${group.title}] Payer: ${group.hostName} (${group.memberSelections.length} members)`
      },
      paymentMethod,
      transactionId: isPaid ? `TXN-GRP-${Date.now().toString().slice(-8)}` : "",
      paymentStatus: isPaid ? "completed" : "pending",
      payment: isPaid,
      status: "Awaiting Restaurant Acceptance",
      statusHistory: [
        {
          status: "Awaiting Restaurant Acceptance",
          changedBy: hostUserId,
          role: "customer",
          note: `Group Order placed by ${group.hostName}`
        }
      ]
    });

    await newOrder.save();

    group.status = "completed";
    group.orderId = newOrder._id;
    group.idempotencyKey = idempotencyKey || "";
    await group.save();

    notifyNewOrder(newOrder);

    res.status(201).json({
      success: true,
      message: `🎉 Group order placed successfully! Restaurant received 1 combined order for ${group.memberSelections.length} people.`,
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      amount: newOrder.amount,
      perPersonBreakdown: group.perPersonBreakdown
    });
  } catch (error) {
    console.error("Checkout Group Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to checkout group order" });
  }
};
