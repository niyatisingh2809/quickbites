import tiffinSubscriptionModel from "../models/tiffinSubscriptionModel.js";
import orderModel from "../models/orderModel.js";
import { notifyNewOrder } from "../config/socket.js";

/**
 * Returns current date and day of week in Asia/Kolkata timezone
 */
export const getKolkataTimeInfo = () => {
  const now = new Date();
  const kolkataDateStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const kolkataDay = days[new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getDay()];
  const currentHour = parseInt(
    now.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour12: false, hour: "numeric" })
  );

  return { dateString: kolkataDateStr, dayOfWeek: kolkataDay, currentHour };
};

/**
 * Daily Tiffin Fulfilment Job (Retry-safe & Idempotent)
 * Generates delivery orders for active subscribers on today's date
 */
export const processDailyTiffinFulfilment = async () => {
  const { dateString, dayOfWeek } = getKolkataTimeInfo();

  try {
    const today = new Date(dateString);

    // Find active subscriptions covering today
    const activeSubscriptions = await tiffinSubscriptionModel.find({
      status: "active",
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    let fulfilledCount = 0;
    let skippedCount = 0;

    for (const sub of activeSubscriptions) {
      const mealType = sub.mealType || "lunch";
      const compositeKey = `${sub._id.toString()}_${dateString}_${mealType}`;

      // Idempotency check: has today's fulfilment already been processed?
      const alreadyProcessed = sub.fulfilments.some((f) => f.fulfilmentKey === compositeKey);
      if (alreadyProcessed) {
        continue;
      }

      // Check if user skipped today's meal before cutoff
      if (sub.skippedDates && sub.skippedDates.includes(dateString)) {
        sub.fulfilments.push({
          fulfilmentKey: compositeKey,
          dateString,
          mealType,
          status: "skipped",
          dishName: "Meal Skipped by Customer",
          createdAt: new Date()
        });
        await sub.save();
        skippedCount++;
        continue;
      }

      // Retrieve today's menu item from the snapshot
      const menu = sub.planSnapshot?.weeklyMenu || [];
      const todayDish = menu.find(
        (m) => m.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
      );

      const dishName = todayDish
        ? `${todayDish.mealName} (Tiffin Plan - ${sub.planSnapshot?.title})`
        : `Daily Thali - ${sub.planSnapshot?.title || "Special"}`;

      // Create kitchen fulfilment order in orderModel
      const newOrder = new orderModel({
        userId: sub.userId,
        restaurantId: sub.restaurantId,
        items: [
          {
            name: dishName,
            price: 0, // Prepaid under subscription
            quantity: 1,
            isVeg: todayDish?.isVeg !== false
          }
        ],
        amount: 0,
        pricingBreakdown: {
          subtotalRupees: 0,
          packagingFeeRupees: 0,
          deliveryFeeRupees: 0,
          platformFeeRupees: 0,
          gstTaxRupees: 0,
          discountRupees: 0,
          totalPaise: 0,
          totalRupees: 0
        },
        address: {
          ...sub.deliveryAddress,
          notes: `[TIFFIN SUBSCRIPTION ${sub.subscriptionNumber}] Slot: ${sub.deliverySlot}`
        },
        paymentMethod: "upi",
        paymentStatus: "completed",
        payment: true,
        status: "Awaiting Restaurant Acceptance",
        statusHistory: [
          {
            status: "Awaiting Restaurant Acceptance",
            changedBy: "Tiffin Auto-Scheduler",
            role: "system",
            note: `Daily fulfilment scheduled for ${dateString} (${dayOfWeek})`
          }
        ]
      });

      await newOrder.save();

      // Record fulfilment on subscription
      sub.fulfilments.push({
        fulfilmentKey: compositeKey,
        dateString,
        mealType,
        orderId: newOrder._id,
        status: "created",
        dishName,
        createdAt: new Date()
      });

      await sub.save();
      fulfilledCount++;

      // Real-time alert to kitchen
      notifyNewOrder(newOrder);
    }

    if (fulfilledCount > 0 || skippedCount > 0) {
      console.log(
        `🍱 [Tiffin Scheduler] ${dateString} (${dayOfWeek}): Generated ${fulfilledCount} fulfilment orders, ${skippedCount} skipped meals.`
      );
    }
  } catch (error) {
    console.error("❌ [Tiffin Scheduler Error]:", error.message);
  }
};

/**
 * Start persistent in-process scheduler that runs every 30 minutes
 */
export const startTiffinScheduler = () => {
  // Run once on server boot
  processDailyTiffinFulfilment();

  // Run recurring check every 30 minutes
  setInterval(() => {
    processDailyTiffinFulfilment();
  }, 30 * 60 * 1000);

  console.log("⏰ [Tiffin Scheduler] Active (Checks Asia/Kolkata daily meal fulfilments every 30 mins)");
};
