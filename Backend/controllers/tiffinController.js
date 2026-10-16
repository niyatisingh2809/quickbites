import tiffinPlanModel from "../models/tiffinPlanModel.js";
import tiffinSubscriptionModel from "../models/tiffinSubscriptionModel.js";
import restaurantModel from "../models/restaurantModel.js";
import { getKolkataTimeInfo } from "../services/tiffinScheduler.js";

/**
 * 1. Get all available Tiffin Plans (auto-seed if empty)
 */
export const getTiffinPlans = async (req, res) => {
  try {
    const { city } = req.query;
    const filter = { status: "active" };
    if (city) {
      filter.serviceCity = new RegExp(city.trim(), "i");
    }

    let plans = await tiffinPlanModel.find(filter).populate("restaurantId", "name cuisine address rating");

    // Auto-seed initial realistic plans if collection is empty
    if (plans.length === 0) {
      const sampleRestaurant = await restaurantModel.findOne({ verificationStatus: "approved" });
      if (sampleRestaurant) {
        const defaultPlans = [
          {
            restaurantId: sampleRestaurant._id,
            title: "Ghar Jaisa Mini Thali (Student Special)",
            description: "Homely everyday meal with 4 soft phulkas, dal tadka, seasonal dry sabzi, steamed rice, and salad. Light on the stomach and budget.",
            mealType: "lunch",
            durationDays: 7,
            priceRupees: 699, // ~₹99/meal
            deliverySlot: "12:30 PM - 01:30 PM",
            serviceCity: sampleRestaurant.address?.city || "Delhi NCR",
            servicePincodes: ["110001", "231001", "221001"],
            maxDailyCapacity: 50,
            skipCutoffHours: 3,
            skipPolicy: { type: "wallet_credit", creditPerSkipRupees: 85, maxSkips: 2 },
            weeklyMenu: [
              { dayOfWeek: "Monday", mealName: "Dal Tadka + Aloo Jeera + 4 Phulkas + Rice", isVeg: true },
              { dayOfWeek: "Tuesday", mealName: "Rajma Masala + Jeera Rice + 2 Phulkas + Salad", isVeg: true },
              { dayOfWeek: "Wednesday", mealName: "Panchmel Dal + Bhindi Do Pyaza + 4 Phulkas", isVeg: true },
              { dayOfWeek: "Thursday", mealName: "Kadhi Pakora + Steamed Rice + 2 Phulkas", isVeg: true },
              { dayOfWeek: "Friday", mealName: "Chana Masala + Pulao + 4 Phulkas + Raita", isVeg: true },
              { dayOfWeek: "Saturday", mealName: "Dal Makhani + Mix Veg + 4 Butter Phulkas", isVeg: true },
              { dayOfWeek: "Sunday", mealName: "Special Paneer Butter Masala + Peas Pulao", isVeg: true }
            ]
          },
          {
            restaurantId: sampleRestaurant._id,
            title: "Executive Office Tiffin (Wholesome Delight)",
            description: "Complete nutritious meal featuring paneer / protein sabzi, rich dal, premium basmati rice, 4 butter rotis, curd, and dessert.",
            mealType: "lunch",
            durationDays: 14,
            priceRupees: 1899, // ~₹135/meal
            deliverySlot: "01:00 PM - 02:00 PM",
            serviceCity: sampleRestaurant.address?.city || "Delhi NCR",
            servicePincodes: ["110001", "231001", "221001"],
            maxDailyCapacity: 40,
            skipCutoffHours: 3,
            skipPolicy: { type: "wallet_credit", creditPerSkipRupees: 120, maxSkips: 4 },
            weeklyMenu: [
              { dayOfWeek: "Monday", mealName: "Shahi Paneer + Yellow Dal + 4 Rotis + Pulao + Gulab Jamun", isVeg: true },
              { dayOfWeek: "Tuesday", mealName: "Dum Aloo Kashmiri + Dal Tadka + 4 Rotis + Rice + Kheer", isVeg: true },
              { dayOfWeek: "Wednesday", mealName: "Paneer Bhurji + Dal Fry + 4 Rotis + Jeera Rice", isVeg: true },
              { dayOfWeek: "Thursday", mealName: "Kadhai Paneer + Dal Panchratna + 4 Rotis + Basmati Rice", isVeg: true },
              { dayOfWeek: "Friday", mealName: "Mutter Mushroom + Dal Makhani + 4 Rotis + Boondi Raita", isVeg: true },
              { dayOfWeek: "Saturday", mealName: "Malai Kofta + Yellow Dal + 4 Butter Rotis + Pulao", isVeg: true },
              { dayOfWeek: "Sunday", mealName: "Chef's Special Shahi Thali + Moong Dal Halwa", isVeg: true }
            ]
          },
          {
            restaurantId: sampleRestaurant._id,
            title: "Monthly PG Dinner Subscription (Light & Balanced)",
            description: "Say goodbye to hostel mess food. Freshly prepared warm dinners delivered straight to your PG gate every evening.",
            mealType: "dinner",
            durationDays: 30,
            priceRupees: 3299, // ~₹110/meal
            deliverySlot: "08:00 PM - 09:00 PM",
            serviceCity: sampleRestaurant.address?.city || "Delhi NCR",
            servicePincodes: ["110001", "231001", "221001"],
            maxDailyCapacity: 60,
            skipCutoffHours: 4,
            skipPolicy: { type: "wallet_credit", creditPerSkipRupees: 95, maxSkips: 6 },
            weeklyMenu: [
              { dayOfWeek: "Monday", mealName: "Dal Tadka + Mix Veg + 4 Phulkas + Rice", isVeg: true },
              { dayOfWeek: "Tuesday", mealName: "Chole Masala + 4 Phulkas + Jeera Rice + Onion Salad", isVeg: true },
              { dayOfWeek: "Wednesday", mealName: "Moong Dal Khichdi + Kadhi + Roasted Papad", isVeg: true },
              { dayOfWeek: "Thursday", mealName: "Aloo Gobhi Matar + Dal Fry + 4 Phulkas + Rice", isVeg: true },
              { dayOfWeek: "Friday", mealName: "Paneer Butter Masala + 4 Phulkas + Steamed Rice", isVeg: true },
              { dayOfWeek: "Saturday", mealName: "Dal Palak + Aloo Shimla Mirch + 4 Phulkas", isVeg: true },
              { dayOfWeek: "Sunday", mealName: "Weekend Special Biryani Thali with Raita & Salad", isVeg: true }
            ]
          }
        ];

        await tiffinPlanModel.insertMany(defaultPlans);
        plans = await tiffinPlanModel.find(filter).populate("restaurantId", "name cuisine address rating");
      }
    }

    res.json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    console.error("Get Tiffin Plans Error:", error);
    res.status(500).json({ success: false, message: "Failed to load tiffin plans" });
  }
};

/**
 * 2. Subscribe to a Tiffin Plan
 */
export const subscribeTiffinPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, startDate, deliverySlot, deliveryAddress, mealType, paymentTransactionId } = req.body;

    if (!planId || !startDate || !deliveryAddress || !deliveryAddress.city) {
      return res.status(400).json({
        success: false,
        message: "Please provide planId, start date, and delivery address with city"
      });
    }

    const plan = await tiffinPlanModel.findById(planId);
    if (!plan || plan.status !== "active") {
      return res.status(404).json({ success: false, message: "Tiffin plan not found or no longer active" });
    }

    const start = new Date(startDate);
    const end = new Date(start.getTime() + (plan.durationDays - 1) * 24 * 60 * 60 * 1000);

    const subscription = new tiffinSubscriptionModel({
      userId,
      restaurantId: plan.restaurantId,
      planId: plan._id,
      planSnapshot: plan.toObject(),
      startDate: start,
      endDate: end,
      mealType: mealType || plan.mealType,
      deliverySlot: deliverySlot || plan.deliverySlot,
      deliveryAddress,
      paymentStatus: "paid",
      paymentTransactionId: paymentTransactionId || `UPI-TXN-${Date.now()}`
    });

    await subscription.save();

    // Increment subscribers count on plan
    plan.activeSubscribersCount = (plan.activeSubscribersCount || 0) + 1;
    await plan.save();

    res.status(201).json({
      success: true,
      message: `🎉 Tiffin subscription activated! Your daily meals begin from ${start.toLocaleDateString("en-IN")}.`,
      subscription
    });
  } catch (error) {
    console.error("Subscribe Tiffin Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to activate subscription" });
  }
};

/**
 * 3. Get user's active & past subscriptions
 */
export const getUserTiffinSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptions = await tiffinSubscriptionModel
      .find({ userId })
      .populate("restaurantId", "name address phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error("Get User Subscriptions Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch subscriptions" });
  }
};

/**
 * 4. Skip/Pause a specific date's meal
 */
export const skipTiffinDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId, dateString } = req.body; // e.g. "2026-10-18"

    if (!subscriptionId || !dateString) {
      return res.status(400).json({ success: false, message: "Subscription ID and dateString (YYYY-MM-DD) are required" });
    }

    const sub = await tiffinSubscriptionModel.findOne({ _id: subscriptionId, userId });
    if (!sub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    if (sub.status !== "active") {
      return res.status(400).json({ success: false, message: "Only active subscriptions can be modified" });
    }

    if (sub.skippedDates && sub.skippedDates.includes(dateString)) {
      return res.status(400).json({ success: false, message: "This date is already marked as skipped" });
    }

    const maxSkips = sub.planSnapshot?.skipPolicy?.maxSkips || 3;
    if ((sub.skipsUsed || 0) >= maxSkips) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed meal skips (${maxSkips}) reached for this plan.`
      });
    }

    // Cutoff validation
    const { dateString: todayStr, currentHour } = getKolkataTimeInfo();
    if (dateString === todayStr && currentHour >= 10) {
      return res.status(400).json({
        success: false,
        message: "Same-day cutoff passed. Lunch meals must be skipped before 10:00 AM IST."
      });
    }

    const creditAmount = sub.planSnapshot?.skipPolicy?.creditPerSkipRupees || 80;

    sub.skippedDates.push(dateString);
    sub.skipsUsed = (sub.skipsUsed || 0) + 1;
    sub.creditsEarnedRupees = (sub.creditsEarnedRupees || 0) + creditAmount;

    await sub.save();

    res.json({
      success: true,
      message: `✅ Meal on ${dateString} skipped successfully! ₹${creditAmount} credit added to your QuickBites balance.`,
      subscription: sub
    });
  } catch (error) {
    console.error("Skip Tiffin Date Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to skip meal date" });
  }
};

/**
 * 5. Cancel subscription
 */
export const cancelTiffinSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;

    const sub = await tiffinSubscriptionModel.findOne({ _id: subscriptionId, userId });
    if (!sub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    sub.status = "cancelled";
    await sub.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully.",
      subscription: sub
    });
  } catch (error) {
    console.error("Cancel Tiffin Error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel subscription" });
  }
};
