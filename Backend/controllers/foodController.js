import foodModel from "../models/foodModel.js";
import fs from "fs";
import path from "path";
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

// Add food item
const addFood = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image for the food item" });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (isCloudinaryConfigured() && req.file.buffer) {
      // Cloudinary cloud upload
      const cloudResult = await uploadToCloudinary(req.file.buffer, "food-items");
      imageUrl = cloudResult.secure_url;
      imagePublicId = cloudResult.public_id;
    } else {
      // Local storage fallback
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

// All food list (with optional category filter and pagination)
const listFood = async (req, res) => {
  try {
    const { category, page, limit } = req.query;
    const filter = category && category !== "All" ? { category } : {};

    let query = foodModel.find(filter).sort({ createdAt: -1 });
    if (limit && parseInt(limit) > 0) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit);
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const foods = await query;
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("List Food Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch food items" });
  }
};


// Remove food item
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

export { addFood, listFood, removeFood };