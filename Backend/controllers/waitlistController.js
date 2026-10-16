import waitlistModel from "../models/waitlistModel.js";
import validator from "validator";

/**
 * Phase 7: Customer Join Waitlist (Pincode & City Demand Capture)
 */
export const joinWaitlist = async (req, res) => {
  try {
    const { email, phone, pincode, city, area } = req.body;
    const userId = req.user?.id || null;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    if (!pincode || pincode.trim().length < 6) {
      return res.status(400).json({ success: false, message: "Please provide a valid 6-digit Indian pincode." });
    }

    const cleanPincode = pincode.trim();
    const cleanCity = (city || "My City").trim();
    const cleanArea = (area || "").trim();

    // Upsert to handle repeat interest gracefully
    const entry = await waitlistModel.findOneAndUpdate(
      { email: email.toLowerCase().trim(), pincode: cleanPincode },
      {
        phone: phone || "",
        city: cleanCity,
        area: cleanArea,
        userId,
        status: "pending"
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: `🎉 You're on the priority waitlist for ${cleanPincode} (${cleanCity})! We'll notify you the moment QuickBites launches in your area.`,
      entry
    });
  } catch (error) {
    console.error("Join Waitlist Error:", error);
    res.status(500).json({ success: false, message: "Failed to join waitlist. Please try again." });
  }
};

/**
 * Phase 7: Admin Waitlist Demand Summary
 */
export const getWaitlistSummary = async (req, res) => {
  try {
    const totalEntries = await waitlistModel.countDocuments();

    // Group by city and pincode to view hotspots of customer demand
    const hotspotAggregation = await waitlistModel.aggregate([
      {
        $group: {
          _id: { pincode: "$pincode", city: "$city" },
          count: { $sum: 1 },
          lastRequested: { $max: "$createdAt" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const recentRequests = await waitlistModel.find()
      .sort({ createdAt: -1 })
      .limit(25);

    res.json({
      success: true,
      totalWaitlistCount: totalEntries,
      hotspots: hotspotAggregation.map(h => ({
        pincode: h._id.pincode,
        city: h._id.city,
        demandCount: h.count,
        lastRequested: h.lastRequested
      })),
      recentRequests
    });
  } catch (error) {
    console.error("Waitlist Summary Error:", error);
    res.status(500).json({ success: false, message: "Failed to load waitlist summary." });
  }
};
