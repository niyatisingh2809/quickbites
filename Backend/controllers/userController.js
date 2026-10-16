import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Helper function to create JWT token with expiration and role
const createToken = (id, role = "customer") => {
  const secret = process.env.JWT_SECRET || "default_dev_secret_change_in_production";
  return jwt.sign({ id, role }, secret, { expiresIn: "7d" });
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact platform support."
      });
    }

    const token = createToken(user._id, user.role);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "active",
        restaurantId: user.restaurantId || null
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// Register user
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }

    // Checking if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "User already exists with this email" });
    }

    // Validating email and password
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: "customer"
    });

    const user = await newUser.save();
    const token = createToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user profile" });
  }
};

// Phase 4: Toggle Favorite Food
const toggleFavoriteFood = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { foodId } = req.body;
    if (!foodId) {
      return res.status(400).json({ success: false, message: "Food ID is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.favoriteFoods) user.favoriteFoods = [];

    const index = user.favoriteFoods.findIndex(id => id.toString() === foodId.toString());
    let isFavorite = false;
    if (index > -1) {
      user.favoriteFoods.splice(index, 1);
      isFavorite = false;
    } else {
      user.favoriteFoods.push(foodId);
      isFavorite = true;
    }

    await user.save();
    res.json({
      success: true,
      isFavorite,
      favoriteFoods: user.favoriteFoods,
      message: isFavorite ? "Added to your favorites ❤️" : "Removed from favorites"
    });
  } catch (error) {
    console.error("Toggle Favorite Food Error:", error);
    res.status(500).json({ success: false, message: "Failed to update favorite food" });
  }
};

// Phase 4: Toggle Favorite Restaurant
const toggleFavoriteRestaurant = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { restaurantId } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "Restaurant ID is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.favoriteRestaurants) user.favoriteRestaurants = [];

    const index = user.favoriteRestaurants.findIndex(id => id.toString() === restaurantId.toString());
    let isFavorite = false;
    if (index > -1) {
      user.favoriteRestaurants.splice(index, 1);
      isFavorite = false;
    } else {
      user.favoriteRestaurants.push(restaurantId);
      isFavorite = true;
    }

    await user.save();
    res.json({
      success: true,
      isFavorite,
      favoriteRestaurants: user.favoriteRestaurants,
      message: isFavorite ? "Restaurant saved to favorites ❤️" : "Restaurant removed from favorites"
    });
  } catch (error) {
    console.error("Toggle Favorite Restaurant Error:", error);
    res.status(500).json({ success: false, message: "Failed to update favorite restaurant" });
  }
};

// Phase 4: Get User Favorites
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const user = await userModel.findById(userId)
      .populate("favoriteFoods")
      .populate("favoriteRestaurants");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      favoriteFoods: user.favoriteFoods || [],
      favoriteRestaurants: user.favoriteRestaurants || []
    });
  } catch (error) {
    console.error("Get Favorites Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch favorites" });
  }
};

export {
  loginUser,
  registerUser,
  getProfile,
  toggleFavoriteFood,
  toggleFavoriteRestaurant,
  getUserFavorites
};