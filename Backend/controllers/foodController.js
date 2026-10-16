import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import fs from "fs";
import path from "path";
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

// Add food item with strict restaurant ownership check
const addFood = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isVeg,
      prepTimeMinutes,
      restaurantId,
      mealType,
      spiceLevel,
      cuisine,
      tags
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image for the food item" });
    }

    // Determine target restaurant ID based on authenticated user role
    let targetRestaurantId = null;

    if (req.user && req.user.role === "restaurant_owner") {
      const ownerRest = await restaurantModel.findOne({ ownerId: req.user.id });
      if (!ownerRest) {
        return res.status(404).json({
          success: false,
          message: "No restaurant found associated with your partner account"
        });
      }
      targetRestaurantId = ownerRest._id;
    } else if (req.user && req.user.role === "admin") {
      if (restaurantId) {
        targetRestaurantId = restaurantId;
      } else {
        // Fallback to Central Kitchen if admin didn't specify
        const centralRest = await restaurantModel.findOne({ slug: "quickbites-central-kitchen" });
        targetRestaurantId = centralRest ? centralRest._id : null;
      }
    } else {
      // Fallback if accessed via legacy route
      const centralRest = await restaurantModel.findOne({ slug: "quickbites-central-kitchen" });
      targetRestaurantId = centralRest ? centralRest._id : null;
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (isCloudinaryConfigured() && req.file.buffer) {
      const cloudResult = await uploadToCloudinary(req.file.buffer, "food-items");
      imageUrl = cloudResult.secure_url;
      imagePublicId = cloudResult.public_id;
    } else {
      if (req.file.filename) {
        imageUrl = req.file.filename;
      } else if (req.file.buffer) {
        const ext = path.extname(req.file.originalname) || ".png";
        const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
        const uploadDir = path.resolve("uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        imageUrl = filename;
      }
    }

    const food = new foodModel({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      restaurantId: targetRestaurantId,
      isVeg: isVeg !== undefined ? (isVeg === "true" || isVeg === true) : true,
      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : 20,
      mealType: mealType || "regular",
      spiceLevel: spiceLevel || "medium",
      cuisine: cuisine ? cuisine.trim() : category.trim(),
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()).filter(Boolean)) : [],
      image: imageUrl,
      imagePublicId: imagePublicId
    });

    await food.save();
    res.status(201).json({ success: true, message: "Food item added successfully", data: food });
  } catch (error) {
    console.error("Add Food Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to add food item" });
  }
};

// List food items with optional category, restaurant, veg filter, and pagination
const listFood = async (req, res) => {
  try {
    const { category, restaurantId, isVeg, page, limit } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    if (isVeg !== undefined && isVeg !== "all") {
      filter.isVeg = isVeg === "true" || isVeg === true;
    }

    let query = foodModel
      .find(filter)
      .populate("restaurantId", "name slug address isOpen packagingFee rating")
      .sort({ createdAt: -1 });

    if (limit && parseInt(limit) > 0) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit);
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const foods = await query;
    res.json({ success: true, count: foods.length, data: foods });
  } catch (error) {
    console.error("List Food Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch food items" });
  }
};

// Remove food item with ownership check
const removeFood = async (req, res) => {
  try {
    const foodId = req.body.id;
    if (!foodId) {
      return res.status(400).json({ success: false, message: "Food item ID is required" });
    }

    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    // Ownership check: if restaurant owner, verify food belongs to their restaurant
    if (req.user && req.user.role === "restaurant_owner") {
      const ownerRest = await restaurantModel.findOne({ ownerId: req.user.id });
      if (!ownerRest || food.restaurantId?.toString() !== ownerRest._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are only authorized to delete dishes from your own restaurant"
        });
      }
    }

    // Clean up image: Cloudinary asset or local file
    if (food.imagePublicId) {
      await deleteFromCloudinary(food.imagePublicId);
    } else if (food.image && !food.image.startsWith("http")) {
      const localFilePath = path.resolve("uploads", food.image);
      if (fs.existsSync(localFilePath)) {
        fs.unlink(localFilePath, (err) => {
          if (err) console.error("Error deleting local file:", err);
        });
      }
    }

    await foodModel.findByIdAndDelete(foodId);
    res.json({ success: true, message: "Food item removed successfully" });
  } catch (error) {
    console.error("Remove Food Error:", error);
    res.status(500).json({ success: false, message: "Failed to remove food item" });
  }
};

// Toggle food item availability (in stock / sold out)
const toggleAvailability = async (req, res) => {
  try {
    const { id, isAvailable } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Food ID is required" });
    }

    const food = await foodModel.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    if (req.user && req.user.role === "restaurant_owner") {
      const ownerRest = await restaurantModel.findOne({ ownerId: req.user.id });
      if (!ownerRest || food.restaurantId?.toString() !== ownerRest._id.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    food.isAvailable = isAvailable !== undefined ? Boolean(isAvailable) : !food.isAvailable;
    await food.save();

    res.json({
      success: true,
      message: `Dish is now ${food.isAvailable ? "In Stock" : "Sold Out"}`,
      isAvailable: food.isAvailable
    });
  } catch (error) {
    console.error("Toggle Availability Error:", error);
    res.status(500).json({ success: false, message: "Failed to update availability" });
  }
};

export { addFood, listFood, removeFood, toggleAvailability };