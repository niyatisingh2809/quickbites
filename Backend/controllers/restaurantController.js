import restaurantModel from "../models/restaurantModel.js";
import userModel from "../models/userModel.js";
import auditLogModel from "../models/auditLogModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { uploadToCloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

const createToken = (id, role = "restaurant_owner") => {
  const secret = process.env.JWT_SECRET || "default_dev_secret_change_in_production";
  return jwt.sign({ id, role }, secret, { expiresIn: "7d" });
};

// Generate clean URL-friendly slug
const generateSlug = (name) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const rand = Math.floor(100 + Math.random() * 900);
  return `${base}-${rand}`;
};

/**
 * 1. Register a new Restaurant Partner
 * Allows a new or existing user to submit their restaurant for approval
 */
export const registerRestaurant = async (req, res) => {
  try {
    const {
      // User credentials (optional if already authenticated)
      userName,
      email,
      password,
      phone: userPhone,
      // Restaurant details
      name,
      description,
      cuisine,
      street,
      city,
      state,
      pincode,
      phone,
      openingTime,
      closingTime,
      avgPrepTimeMinutes,
      fssaiLicenseNumber,
      gstin,
      accountHolderName,
      accountNumber,
      ifscCode,
      upiId,
      latitude,
      longitude
    } = req.body;

    if (!name || !street || !city || !state || !pincode || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required restaurant profile and address fields"
      });
    }

    let userId = req.user ? req.user.id : null;
    let token = null;
    let user = null;

    if (!userId) {
      // New user registering directly as restaurant partner
      if (!email || !password || !userName) {
        return res.status(400).json({
          success: false,
          message: "Account name, email and password are required for registration"
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
        name: userName.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: userPhone || phone,
        role: "restaurant_owner"
      });
      await user.save();
      userId = user._id;
      token = createToken(user._id, "restaurant_owner");
    } else {
      user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User account not found" });
      }

      // Check if user already owns a restaurant
      const existingRestaurant = await restaurantModel.findOne({ ownerId: userId });
      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message: "You have already registered a restaurant under this account",
          restaurantId: existingRestaurant._id
        });
      }

      // Promote role if current role is customer
      if (user.role === "customer") {
        user.role = "restaurant_owner";
      }
    }

    // Process uploaded restaurant image / banner if provided
    let imageUrl = "default_restaurant.png";
    if (req.file) {
      if (isCloudinaryConfigured() && req.file.buffer) {
        const cloudResult = await uploadToCloudinary(req.file.buffer, "restaurant-logos");
        imageUrl = cloudResult.secure_url;
      } else if (req.file.buffer) {
        const ext = path.extname(req.file.originalname) || ".png";
        const filename = `rest_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
        const uploadDir = path.resolve("uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        imageUrl = filename;
      }
    }

    const parsedCuisine = Array.isArray(cuisine)
      ? cuisine
      : typeof cuisine === "string"
      ? cuisine.split(",").map((c) => c.trim()).filter(Boolean)
      : ["North Indian"];

    const lat = latitude ? parseFloat(latitude) : 28.6139;
    const lng = longitude ? parseFloat(longitude) : 77.2090;

    const newRestaurant = new restaurantModel({
      name: name.trim(),
      slug: generateSlug(name.trim()),
      ownerId: userId,
      description: description ? description.trim() : "",
      cuisine: parsedCuisine,
      image: imageUrl,
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: "India",
        location: {
          type: "Point",
          coordinates: [lng, lat]
        }
      },
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : user.email,
      openingHours: {
        open: openingTime || "09:00",
        close: closingTime || "23:00"
      },
      isOpen: true,
      serviceAvailable: true,
      avgPrepTimeMinutes: avgPrepTimeMinutes ? parseInt(avgPrepTimeMinutes) : 25,
      deliveryRadiusKm: 7,
      packagingFee: 20,
      commissionRate: 15, // Standard platform commission rate (15%)
      fssaiLicenseNumber: fssaiLicenseNumber ? fssaiLicenseNumber.trim() : "",
      gstin: gstin ? gstin.trim() : "",
      verificationStatus: "pending",
      bankDetails: {
        accountHolderName: accountHolderName ? accountHolderName.trim() : "",
        accountNumber: accountNumber ? accountNumber.trim() : "",
        ifscCode: ifscCode ? ifscCode.trim().toUpperCase() : "",
        upiId: upiId ? upiId.trim() : ""
      }
    });

    const savedRestaurant = await newRestaurant.save();

    // Link restaurant to user
    user.restaurantId = savedRestaurant._id;
    await user.save();

    // Audit log
    await auditLogModel.create({
      userId: userId,
      userEmail: user.email,
      userRole: "restaurant_owner",
      action: "RESTAURANT_APPLICATION_SUBMITTED",
      entityType: "Restaurant",
      entityId: savedRestaurant._id.toString(),
      details: { name: savedRestaurant.name, city: savedRestaurant.address.city }
    });

    res.status(201).json({
      success: true,
      message: "Restaurant application submitted successfully! Pending administrator approval.",
      token: token || undefined,
      restaurant: savedRestaurant
    });
  } catch (error) {
    console.error("Register Restaurant Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to submit restaurant application" });
  }
};

/**
 * 2. Get the logged-in owner's restaurant profile
 */
export const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = req.restaurant || (await restaurantModel.findOne({ ownerId: req.user.id }));
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant found associated with your account"
      });
    }

    res.json({ success: true, restaurant });
  } catch (error) {
    console.error("Get My Restaurant Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch restaurant profile" });
  }
};

/**
 * 3. Update the logged-in owner's restaurant profile
 */
export const updateMyRestaurant = async (req, res) => {
  try {
    const restaurant = req.restaurant || (await restaurantModel.findOne({ ownerId: req.user.id }));
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const {
      description,
      cuisine,
      openingHours,
      isOpen,
      avgPrepTimeMinutes,
      packagingFee,
      phone,
      fssaiLicenseNumber,
      bankDetails
    } = req.body;

    if (description !== undefined) restaurant.description = description.trim();
    if (cuisine !== undefined) {
      restaurant.cuisine = Array.isArray(cuisine)
        ? cuisine
        : typeof cuisine === "string"
        ? cuisine.split(",").map((c) => c.trim()).filter(Boolean)
        : restaurant.cuisine;
    }
    if (openingHours) {
      if (openingHours.open) restaurant.openingHours.open = openingHours.open;
      if (openingHours.close) restaurant.openingHours.close = openingHours.close;
    }
    if (isOpen !== undefined) restaurant.isOpen = Boolean(isOpen);
    if (avgPrepTimeMinutes !== undefined) restaurant.avgPrepTimeMinutes = parseInt(avgPrepTimeMinutes);
    if (packagingFee !== undefined) {
      // Limit packaging fee to reasonable maximum (₹60) to prevent abuse
      restaurant.packagingFee = Math.min(Math.max(0, parseInt(packagingFee)), 60);
    }
    if (phone) restaurant.phone = phone.trim();
    if (fssaiLicenseNumber) restaurant.fssaiLicenseNumber = fssaiLicenseNumber.trim();
    if (bankDetails) {
      restaurant.bankDetails = { ...restaurant.bankDetails, ...bankDetails };
    }

    await restaurant.save();

    res.json({
      success: true,
      message: "Restaurant profile updated successfully",
      restaurant
    });
  } catch (error) {
    console.error("Update My Restaurant Error:", error);
    res.status(500).json({ success: false, message: "Failed to update restaurant details" });
  }
};

/**
 * 4. Upload verification document (FSSAI, GST, PAN, Bank Passbook)
 */
export const uploadRestaurantDocument = async (req, res) => {
  try {
    const restaurant = req.restaurant || (await restaurantModel.findOne({ ownerId: req.user.id }));
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const { docType } = req.body;
    if (!docType || !["FSSAI", "GST", "PAN", "BANK_PASSBOOK", "SHOP_ESTABLISHMENT"].includes(docType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type. Allowed types: FSSAI, GST, PAN, BANK_PASSBOOK, SHOP_ESTABLISHMENT"
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please attach a document file" });
    }

    let docUrl = "";
    if (isCloudinaryConfigured() && req.file.buffer) {
      const cloudResult = await uploadToCloudinary(req.file.buffer, "restaurant-kyc-docs");
      docUrl = cloudResult.secure_url;
    } else if (req.file.buffer) {
      const ext = path.extname(req.file.originalname) || ".pdf";
      const filename = `doc_${docType}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
      const uploadDir = path.resolve("uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      docUrl = filename;
    }

    // Replace if document of this type already uploaded, otherwise push
    const existingIndex = restaurant.documents.findIndex((d) => d.docType === docType);
    if (existingIndex >= 0) {
      restaurant.documents[existingIndex] = {
        docType,
        docUrl,
        uploadedAt: new Date(),
        verified: false
      };
    } else {
      restaurant.documents.push({
        docType,
        docUrl,
        uploadedAt: new Date(),
        verified: false
      });
    }

    await restaurant.save();

    res.json({
      success: true,
      message: `${docType} document uploaded successfully`,
      documents: restaurant.documents
    });
  } catch (error) {
    console.error("Upload Document Error:", error);
    res.status(500).json({ success: false, message: "Failed to upload KYC document" });
  }
};

/**
 * 5. Platform Admin: List all restaurants with filter and search
 */
export const listAdminRestaurants = async (req, res) => {
  try {
    const { status, city, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.verificationStatus = status;
    }
    if (city && city !== "all") {
      filter["address.city"] = new RegExp(city, "i");
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { fssaiLicenseNumber: new RegExp(search, "i") }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = await restaurantModel.countDocuments(filter);

    const restaurants = await restaurantModel
      .find(filter)
      .populate("ownerId", "name email phone")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      restaurants
    });
  } catch (error) {
    console.error("List Admin Restaurants Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch restaurants" });
  }
};

/**
 * 6. Platform Admin: Approve, Reject, or Suspend a Restaurant
 */
export const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected", "suspended", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const restaurant = await restaurantModel.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    const previousStatus = restaurant.verificationStatus;
    restaurant.verificationStatus = status;

    if (status === "rejected") {
      restaurant.rejectionReason = rejectionReason || "Incomplete documentation or verification failed";
    } else if (status === "approved") {
      restaurant.rejectionReason = "";
      restaurant.serviceAvailable = true;
    } else if (status === "suspended") {
      restaurant.serviceAvailable = false;
      restaurant.rejectionReason = rejectionReason || "Suspended by platform administrator";
    }

    await restaurant.save();

    // Log the audit event
    await auditLogModel.create({
      userId: req.user.id,
      userEmail: req.user.email || "admin@quickbites.com",
      userRole: "admin",
      action: `RESTAURANT_${status.toUpperCase()}`,
      entityType: "Restaurant",
      entityId: restaurant._id.toString(),
      details: {
        restaurantName: restaurant.name,
        previousStatus,
        newStatus: status,
        rejectionReason: restaurant.rejectionReason
      }
    });

    res.json({
      success: true,
      message: `Restaurant status updated to [${status.toUpperCase()}] successfully`,
      restaurant
    });
  } catch (error) {
    console.error("Update Restaurant Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update restaurant status" });
  }
};

/**
 * 7. Platform Admin: Update Commission Rate, Delivery Radius, Delivery Mode
 */
export const updateRestaurantSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionRate, deliveryRadiusKm, packagingFee, deliveryMode } = req.body;

    const restaurant = await restaurantModel.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    if (commissionRate !== undefined) restaurant.commissionRate = Math.min(Math.max(0, parseFloat(commissionRate)), 50);
    if (deliveryRadiusKm !== undefined) restaurant.deliveryRadiusKm = Math.min(Math.max(1, parseFloat(deliveryRadiusKm)), 30);
    if (packagingFee !== undefined) restaurant.packagingFee = Math.max(0, parseInt(packagingFee));
    if (deliveryMode && ["platform", "restaurant_managed", "both"].includes(deliveryMode)) {
      restaurant.deliveryMode = deliveryMode;
    }

    await restaurant.save();

    await auditLogModel.create({
      userId: req.user.id,
      userRole: "admin",
      action: "RESTAURANT_SETTINGS_UPDATED",
      entityType: "Restaurant",
      entityId: restaurant._id.toString(),
      details: { commissionRate, deliveryRadiusKm, packagingFee, deliveryMode }
    });

    res.json({
      success: true,
      message: "Restaurant platform settings updated successfully",
      restaurant
    });
  } catch (error) {
    console.error("Update Restaurant Settings Error:", error);
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
};

/**
 * 8. Customer Discovery: List approved and live restaurants in user's area
 */
export const getPublicRestaurants = async (req, res) => {
  try {
    const { city, pincode, cuisine, search } = req.query;

    const filter = {
      verificationStatus: "approved",
      serviceAvailable: true
    };

    if (city) {
      filter["address.city"] = new RegExp(city, "i");
    }
    if (pincode) {
      filter["address.pincode"] = pincode;
    }
    if (cuisine && cuisine !== "All") {
      filter.cuisine = { $in: [cuisine] };
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { cuisine: { $in: [new RegExp(search, "i")] } }
      ];
    }

    const restaurants = await restaurantModel
      .find(filter)
      .select("-bankDetails -documents -ownerId")
      .sort({ isOpen: -1, rating: -1, createdAt: -1 });

    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    console.error("Public Restaurants Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch restaurants" });
  }
};

/**
 * 9. Customer: Get single public restaurant profile by ID or slug
 */
export const getPublicRestaurantById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug.toLowerCase() };

    const restaurant = await restaurantModel
      .findOne({ ...query, verificationStatus: "approved" })
      .select("-bankDetails -documents -ownerId");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or is currently not active on the platform"
      });
    }

    res.json({ success: true, restaurant });
  } catch (error) {
    console.error("Get Restaurant Detail Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch restaurant details" });
  }
};

/**
 * 10. Restaurant & Admin: Toggle Kitchen Rush Mode (Auto-pause with optional countdown)
 */
export const toggleRushMode = async (req, res) => {
  try {
    const { restaurantId, isPaused, durationMinutes = 30, pauseReason = "Kitchen Peak Rush", manualEstimatedPrepTime } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    let targetRestaurant = null;
    if (userRole === "admin" && restaurantId) {
      targetRestaurant = await restaurantModel.findById(restaurantId);
    } else {
      targetRestaurant = await restaurantModel.findOne({ ownerId: userId });
    }

    if (!targetRestaurant) {
      return res.status(404).json({ success: false, message: "Restaurant profile not found." });
    }

    const pauseStatus = Boolean(isPaused);
    let pausedUntil = null;
    if (pauseStatus && durationMinutes && Number(durationMinutes) > 0) {
      pausedUntil = new Date(Date.now() + Number(durationMinutes) * 60 * 1000);
    }

    targetRestaurant.rushMode = {
      isPaused: pauseStatus,
      pausedUntil: pauseStatus ? pausedUntil : null,
      pauseReason: pauseStatus ? (pauseReason || "Kitchen Peak Rush") : "",
      pausedAt: pauseStatus ? new Date() : null,
      manualEstimatedPrepTime: manualEstimatedPrepTime ? Number(manualEstimatedPrepTime) : targetRestaurant.avgPrepTimeMinutes
    };

    await targetRestaurant.save();

    // Log audit trail
    await auditLogModel.create({
      actorId: userId,
      actorRole: userRole,
      action: pauseStatus ? "RESTAURANT_RUSH_MODE_PAUSED" : "RESTAURANT_RUSH_MODE_RESUMED",
      targetEntity: "restaurant",
      targetId: targetRestaurant._id,
      details: {
        isPaused: pauseStatus,
        pausedUntil,
        pauseReason
      }
    });

    res.json({
      success: true,
      message: pauseStatus
        ? `⏸️ Kitchen Rush Mode activated. New orders paused temporarily.`
        : "▶️ Kitchen Rush Mode deactivated. Normal ordering resumed.",
      rushMode: targetRestaurant.rushMode
    });
  } catch (error) {
    console.error("Toggle Rush Mode Error:", error);
    res.status(500).json({ success: false, message: "Failed to update rush mode status." });
  }
};

