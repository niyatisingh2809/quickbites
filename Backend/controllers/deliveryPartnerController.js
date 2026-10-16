import deliveryPartnerModel from "../models/deliveryPartnerModel.js";
import userModel from "../models/userModel.js";
import auditLogModel from "../models/auditLogModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

const createToken = (id, role = "delivery_partner") => {
  const secret = process.env.JWT_SECRET || "default_dev_secret_change_in_production";
  return jwt.sign({ id, role }, secret, { expiresIn: "7d" });
};

/**
 * 1. Register as a Delivery Partner
 */
export const registerDeliveryPartner = async (req, res) => {
  try {
    const {
      // User account details (if new applicant)
      userName,
      email,
      password,
      phone: userPhone,
      // Rider details
      fullName,
      phone,
      vehicleType,
      vehicleNumber,
      drivingLicenseNumber,
      aadhaarNumber,
      city,
      accountHolderName,
      accountNumber,
      ifscCode,
      upiId
    } = req.body;

    if (!fullName || !phone || !vehicleType || !city) {
      return res.status(400).json({
        success: false,
        message: "Please provide full name, contact phone, vehicle type, and city"
      });
    }

    let userId = req.user ? req.user.id : null;
    let token = null;
    let user = null;

    if (!userId) {
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required to create a delivery partner account"
        });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address" });
      }

      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please log in first."
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new userModel({
        name: (userName || fullName).trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: userPhone || phone,
        role: "delivery_partner"
      });
      await user.save();
      userId = user._id;
      token = createToken(user._id, "delivery_partner");
    } else {
      user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User account not found" });
      }

      const existingRider = await deliveryPartnerModel.findOne({ userId });
      if (existingRider) {
        return res.status(400).json({
          success: false,
          message: "You have already applied as a delivery partner under this account"
        });
      }

      if (user.role === "customer") {
        user.role = "delivery_partner";
      }
    }

    const newRider = new deliveryPartnerModel({
      userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : user.email,
      vehicleType: vehicleType || "bike",
      vehicleNumber: vehicleNumber ? vehicleNumber.trim().toUpperCase() : "",
      drivingLicenseNumber: drivingLicenseNumber ? drivingLicenseNumber.trim().toUpperCase() : "",
      aadhaarNumber: aadhaarNumber ? aadhaarNumber.trim() : "",
      city: city.trim(),
      status: "pending",
      isAvailable: false,
      bankDetails: {
        accountHolderName: accountHolderName ? accountHolderName.trim() : "",
        accountNumber: accountNumber ? accountNumber.trim() : "",
        ifscCode: ifscCode ? ifscCode.trim().toUpperCase() : "",
        upiId: upiId ? upiId.trim() : ""
      }
    });

    const savedRider = await newRider.save();

    user.deliveryPartnerId = savedRider._id;
    await user.save();

    await auditLogModel.create({
      userId,
      userEmail: user.email,
      userRole: "delivery_partner",
      action: "RIDER_APPLICATION_SUBMITTED",
      entityType: "DeliveryPartner",
      entityId: savedRider._id.toString(),
      details: { fullName: savedRider.fullName, city: savedRider.city, vehicleType: savedRider.vehicleType }
    });

    res.status(201).json({
      success: true,
      message: "Delivery partner application submitted successfully! Pending admin approval.",
      token: token || undefined,
      rider: savedRider
    });
  } catch (error) {
    console.error("Register Delivery Partner Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to register delivery partner" });
  }
};

/**
 * 2. Get logged-in Rider Profile
 */
export const getMyDeliveryProfile = async (req, res) => {
  try {
    const rider = await deliveryPartnerModel.findOne({ userId: req.user.id });
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "No delivery partner profile found for this account"
      });
    }

    res.json({ success: true, rider });
  } catch (error) {
    console.error("Get Rider Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch delivery profile" });
  }
};

/**
 * 3. Toggle Online Duty Availability
 */
export const toggleAvailability = async (req, res) => {
  try {
    const rider = await deliveryPartnerModel.findOne({ userId: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: "Rider profile not found" });
    }

    if (rider.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: `Your partner account is currently [${rider.status.toUpperCase()}]. Only approved riders can go online.`
      });
    }

    const { isAvailable } = req.body;
    rider.isAvailable = isAvailable !== undefined ? Boolean(isAvailable) : !rider.isAvailable;
    await rider.save();

    res.json({
      success: true,
      message: `You are now ${rider.isAvailable ? "🟢 ONLINE (Ready for deliveries)" : "⚪ OFFLINE"}`,
      isAvailable: rider.isAvailable
    });
  } catch (error) {
    console.error("Toggle Availability Error:", error);
    res.status(500).json({ success: false, message: "Failed to update availability" });
  }
};

/**
 * 4. Update Honest Check-in Location
 */
export const updateCurrentLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    const rider = await deliveryPartnerModel.findOne({ userId: req.user.id });
    if (!rider) {
      return res.status(404).json({ success: false, message: "Rider profile not found" });
    }

    rider.currentLocation = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
      updatedAt: new Date()
    };

    await rider.save();

    res.json({ success: true, message: "Location updated successfully" });
  } catch (error) {
    console.error("Update Location Error:", error);
    res.status(500).json({ success: false, message: "Failed to update location" });
  }
};

/**
 * 5. Platform Admin: List delivery partners
 */
export const listAdminDeliveryPartners = async (req, res) => {
  try {
    const { status, city, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }
    if (city && city !== "all") {
      filter.city = new RegExp(city, "i");
    }
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { vehicleNumber: new RegExp(search, "i") }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = await deliveryPartnerModel.countDocuments(filter);

    const riders = await deliveryPartnerModel
      .find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      riders
    });
  } catch (error) {
    console.error("List Admin Riders Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch delivery partners" });
  }
};

/**
 * 6. Platform Admin: Approve, Reject, or Suspend a Delivery Partner
 */
export const updateDeliveryPartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected", "suspended", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const rider = await deliveryPartnerModel.findById(id);
    if (!rider) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    const previousStatus = rider.status;
    rider.status = status;

    if (status === "rejected") {
      rider.rejectionReason = rejectionReason || "Document verification failed";
      rider.isAvailable = false;
    } else if (status === "approved") {
      rider.rejectionReason = "";
    } else if (status === "suspended") {
      rider.isAvailable = false;
      rider.rejectionReason = rejectionReason || "Suspended by platform administrator";
    }

    await rider.save();

    await auditLogModel.create({
      userId: req.user.id,
      userRole: "admin",
      action: `RIDER_${status.toUpperCase()}`,
      entityType: "DeliveryPartner",
      entityId: rider._id.toString(),
      details: { fullName: rider.fullName, previousStatus, newStatus: status, rejectionReason: rider.rejectionReason }
    });

    res.json({
      success: true,
      message: `Delivery partner status updated to [${status.toUpperCase()}] successfully`,
      rider
    });
  } catch (error) {
    console.error("Update Rider Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update rider status" });
  }
};
