import mongoose from "mongoose";
import thaliTemplateModel from "../models/thaliTemplateModel.js";
import restaurantModel from "../models/restaurantModel.js";
import auditLogModel from "../models/auditLogModel.js";
import { validateAndPriceThaliItem } from "../services/pricingService.js";

/**
 * Public: List active Thali Templates for a restaurant or city
 */
export const getRestaurantThalis = async (req, res) => {
  try {
    const { restaurantId, city } = req.query;
    const filter = { isAvailable: true };

    if (restaurantId && mongoose.Types.ObjectId.isValid(restaurantId)) {
      filter.restaurantId = restaurantId;
    } else if (city) {
      const trimmedCity = city.trim();
      const isNCR = /noida|delhi|gurgaon|gurugram|ghaziabad|faridabad/i.test(trimmedCity);
      const cityRegex = isNCR
        ? /delhi|ncr|noida|gurgaon|gurugram|ghaziabad|faridabad/i
        : new RegExp(trimmedCity, "i");

      let openRestaurants = await restaurantModel.find({
        "address.city": cityRegex,
        verificationStatus: "approved",
        isOpen: true
      }).select("_id");

      // Fallback: If no restaurant found in this specific city, include Central Kitchen
      if (openRestaurants.length === 0) {
        openRestaurants = await restaurantModel.find({
          $or: [
            { slug: "quickbites-central-kitchen" },
            { name: /central kitchen/i }
          ],
          isOpen: true
        }).select("_id");
      }

      if (openRestaurants.length > 0) {
        filter.restaurantId = { $in: openRestaurants.map((r) => r._id) };
      }
    }

    let templates = await thaliTemplateModel
      .find(filter)
      .populate("restaurantId", "name slug address isOpen packagingFee rating")
      .sort({ createdAt: -1 });

    // Fallback guarantee: If city filter yielded 0 templates, return all available thali templates
    if (templates.length === 0 && !restaurantId) {
      templates = await thaliTemplateModel
        .find({ isAvailable: true })
        .populate("restaurantId", "name slug address isOpen packagingFee rating")
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, count: templates.length, templates });
  } catch (error) {
    console.error("Get Thalis Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch thali templates" });
  }
};

/**
 * Public: Get a single Thali Template by ID with full component groups
 */
export const getThaliById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid Thali ID" });
    }

    const template = await thaliTemplateModel
      .findById(id)
      .populate("restaurantId", "name slug address isOpen packagingFee rating");

    if (!template) {
      return res.status(404).json({ success: false, message: "Thali template not found" });
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error("Get Thali By ID Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch thali template details" });
  }
};

/**
 * Public: Validate customer configuration and calculate authoritative price in paise
 */
export const validateCustomerThali = async (req, res) => {
  try {
    const { thaliTemplateId, components, quantity, preparationInstructions } = req.body;
    if (!thaliTemplateId) {
      return res.status(400).json({ success: false, message: "Missing thaliTemplateId" });
    }

    const verified = await validateAndPriceThaliItem({
      thaliTemplateId,
      components,
      quantity: quantity || 1,
      preparationInstructions: preparationInstructions || ""
    });

    res.json({
      success: true,
      verifiedThali: verified,
      authoritativeUnitPriceRupees: verified.price,
      totalPaise: verified.unitPricePaise * verified.quantity,
      totalRupees: verified.price * verified.quantity
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Admin / Restaurant Owner: Create new Thali Template
 */
export const createThaliTemplate = async (req, res) => {
  try {
    const {
      restaurantId,
      name,
      description,
      image,
      basePriceRupees,
      isVeg,
      isAvailable,
      allowedPreparationNotes,
      componentGroups
    } = req.body;

    if (!name || basePriceRupees === undefined) {
      return res.status(400).json({ success: false, message: "Thali name and base price are required" });
    }

    // Role check & Restaurant ownership enforcement
    let targetRestId = restaurantId;
    if (req.user.role === "restaurant_owner") {
      const myRest = await restaurantModel.findOne({ ownerId: req.user.id });
      if (!myRest) {
        return res.status(403).json({ success: false, message: "No restaurant profile associated with this account" });
      }
      targetRestId = myRest._id;
    }

    if (!targetRestId) {
      const central = await restaurantModel.findOne({ slug: "quickbites-central-kitchen" });
      targetRestId = central ? central._id : null;
    }

    // Format and sanitize component groups with unique IDs
    const formattedGroups = (componentGroups || []).map((grp, gIdx) => ({
      groupId: grp.groupId || `grp_${Date.now()}_${gIdx}`,
      name: grp.name || `Group ${gIdx + 1}`,
      isRequired: grp.isRequired !== false,
      minSelections: grp.minSelections !== undefined ? Number(grp.minSelections) : 1,
      maxSelections: grp.maxSelections !== undefined ? Number(grp.maxSelections) : 1,
      maxQuantityPerSelection: grp.maxQuantityPerSelection !== undefined ? Number(grp.maxQuantityPerSelection) : 4,
      components: (grp.components || []).map((c, cIdx) => ({
        componentId: c.componentId || `comp_${Date.now()}_${gIdx}_${cIdx}`,
        name: c.name,
        isIncluded: c.isIncluded !== false,
        extraPriceRupees: Number(c.extraPriceRupees) || 0,
        isVeg: c.isVeg !== false,
        isAvailable: c.isAvailable !== false,
        portion: c.portion || "",
        image: c.image || "",
        description: c.description || ""
      }))
    }));

    const newTemplate = new thaliTemplateModel({
      restaurantId: targetRestId,
      name,
      description: description || "",
      image: image || "default_thali.png",
      basePriceRupees: Number(basePriceRupees),
      isVeg: isVeg !== false,
      isAvailable: isAvailable !== false,
      allowedPreparationNotes: allowedPreparationNotes || [
        "Less Spicy",
        "Medium Spicy",
        "Extra Spicy",
        "No Onion & Garlic",
        "Extra Butter on Breads"
      ],
      componentGroups: formattedGroups
    });

    await newTemplate.save();

    await auditLogModel.create({
      userId: req.user.id,
      userRole: req.user.role,
      action: "THALI_TEMPLATE_CREATED",
      entityType: "ThaliTemplate",
      entityId: newTemplate._id,
      details: { name, basePriceRupees, restaurantId: targetRestId }
    });

    res.status(201).json({
      success: true,
      message: `Thali template "${name}" created successfully!`,
      template: newTemplate
    });
  } catch (error) {
    console.error("Create Thali Error:", error);
    res.status(500).json({ success: false, message: "Failed to create thali template" });
  }
};

/**
 * Admin / Restaurant Owner: Update Thali Template
 */
export const updateThaliTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await thaliTemplateModel.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Thali template not found" });
    }

    // Restaurant ownership enforcement
    if (req.user.role === "restaurant_owner") {
      const myRest = await restaurantModel.findOne({ ownerId: req.user.id });
      if (!myRest || template.restaurantId.toString() !== myRest._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized: You do not own this restaurant" });
      }
    }

    const updates = { ...req.body };
    if (updates.componentGroups) {
      updates.componentGroups = updates.componentGroups.map((grp, gIdx) => ({
        groupId: grp.groupId || `grp_${Date.now()}_${gIdx}`,
        name: grp.name,
        isRequired: grp.isRequired !== false,
        minSelections: Number(grp.minSelections) || 0,
        maxSelections: Number(grp.maxSelections) || 1,
        maxQuantityPerSelection: Number(grp.maxQuantityPerSelection) || 4,
        components: (grp.components || []).map((c, cIdx) => ({
          componentId: c.componentId || `comp_${Date.now()}_${gIdx}_${cIdx}`,
          name: c.name,
          isIncluded: c.isIncluded !== false,
          extraPriceRupees: Number(c.extraPriceRupees) || 0,
          isVeg: c.isVeg !== false,
          isAvailable: c.isAvailable !== false,
          portion: c.portion || "",
          image: c.image || "",
          description: c.description || ""
        }))
      }));
    }

    const updatedTemplate = await thaliTemplateModel.findByIdAndUpdate(id, updates, { new: true });

    res.json({
      success: true,
      message: "Thali template updated successfully",
      template: updatedTemplate
    });
  } catch (error) {
    console.error("Update Thali Error:", error);
    res.status(500).json({ success: false, message: "Failed to update thali template" });
  }
};

/**
 * Kitchen: Quick Component Availability Toggle
 */
export const toggleComponentAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupId, componentId, isAvailable } = req.body;

    const template = await thaliTemplateModel.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Thali template not found" });
    }

    if (req.user.role === "restaurant_owner") {
      const myRest = await restaurantModel.findOne({ ownerId: req.user.id });
      if (!myRest || template.restaurantId.toString() !== myRest._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized: You do not own this restaurant" });
      }
    }

    let itemUpdated = false;
    for (const grp of template.componentGroups) {
      if (!groupId || grp.groupId === groupId) {
        const comp = grp.components.find((c) => c.componentId === componentId);
        if (comp) {
          comp.isAvailable = Boolean(isAvailable);
          itemUpdated = true;
          break;
        }
      }
    }

    if (!itemUpdated) {
      return res.status(404).json({ success: false, message: "Component not found in template" });
    }

    await template.save();

    res.json({
      success: true,
      message: `Component availability toggled to ${isAvailable ? "Available" : "Sold Out"}`,
      template
    });
  } catch (error) {
    console.error("Toggle Component Error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle component availability" });
  }
};

/**
 * Admin / Restaurant Owner: Delete or Archive Thali Template
 */
export const deleteThaliTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await thaliTemplateModel.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Thali template not found" });
    }

    if (req.user.role === "restaurant_owner") {
      const myRest = await restaurantModel.findOne({ ownerId: req.user.id });
      if (!myRest || template.restaurantId.toString() !== myRest._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized: You do not own this restaurant" });
      }
    }

    await thaliTemplateModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Thali template removed" });
  } catch (error) {
    console.error("Delete Thali Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete thali template" });
  }
};
