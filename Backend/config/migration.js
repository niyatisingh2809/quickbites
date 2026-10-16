import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import restaurantModel from "../models/restaurantModel.js";
import foodModel from "../models/foodModel.js";
import { seedThaliTemplateItems } from "./seedThaliItems.js";
import { seedMissingCatalogFoods } from "./seedCatalog.js";

export const runInitialMigrations = async () => {
  try {
    // 1. Ensure Default Platform Admin exists
    let admin = await userModel.findOne({ role: "admin" });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin@12345", salt);
      admin = new userModel({
        name: "Platform Super Admin",
        email: "admin@quickbites.com",
        password: hashedPassword,
        role: "admin",
        phone: "9876543210"
      });
      await admin.save();
      console.log("✅ [Migration] Default Platform Admin created: admin@quickbites.com (Pass: Admin@12345)");
    }

    // 2. Ensure Central Kitchen Restaurant exists
    let centralRestaurant = await restaurantModel.findOne({ slug: "quickbites-central-kitchen" });
    if (!centralRestaurant) {
      centralRestaurant = new restaurantModel({
        name: "QuickBites Central Kitchen",
        slug: "quickbites-central-kitchen",
        ownerId: admin._id,
        description: "Official QuickBites dark kitchen preparing top-quality meals, rolls, salads and desserts.",
        cuisine: ["North Indian", "Fast Food", "Salad", "Rolls", "Desserts"],
        image: "header_img.png",
        bannerImage: "header_img.png",
        address: {
          street: "Inner Circle, Connaught Place",
          city: "Delhi NCR",
          state: "Delhi",
          pincode: "110001",
          country: "India",
          location: { type: "Point", coordinates: [77.2090, 28.6139] }
        },
        phone: "9876543210",
        email: "central@quickbites.com",
        openingHours: { open: "08:00", close: "23:30" },
        isOpen: true,
        serviceAvailable: true,
        avgPrepTimeMinutes: 20,
        deliveryRadiusKm: 10,
        packagingFee: 20,
        commissionRate: 15,
        fssaiLicenseNumber: "10019011000123",
        verificationStatus: "approved",
        rating: 4.8,
        reviewsCount: 1420
      });
      await centralRestaurant.save();
      console.log("✅ [Migration] Default Central Kitchen Restaurant registered and approved");
    }

    // 2.1 Seed any missing catalog dishes (Chaap, Continental, Italian, Biryani, Street Food, Non-Veg Specials)
    await seedMissingCatalogFoods(centralRestaurant._id);

    // 3. Migrate legacy food items without a restaurantId
    const unlinkedCount = await foodModel.countDocuments({
      $or: [{ restaurantId: { $exists: false } }, { restaurantId: null }]
    });

    if (unlinkedCount > 0) {
      await foodModel.updateMany(
        { $or: [{ restaurantId: { $exists: false } }, { restaurantId: null }] },
        {
          $set: {
            restaurantId: centralRestaurant._id,
            isVeg: true,
            prepTimeMinutes: 20
          }
        }
      );
      console.log(`✅ [Migration] Linked ${unlinkedCount} legacy food items to QuickBites Central Kitchen`);
    }

    // 4. Seed Pilot Partner Restaurants if only 1 restaurant exists
    const totalRestaurants = await restaurantModel.countDocuments();
    if (totalRestaurants < 2) {
      // Create partner owner 1
      const salt = await bcrypt.genSalt(10);
      const hash1 = await bcrypt.hash("Partner@123", salt);

      const partnerUser1 = new userModel({
        name: "Chef Rajesh Sharma",
        email: "rajesh@royalbiryani.com",
        password: hash1,
        role: "restaurant_owner",
        phone: "9811223344"
      });
      await partnerUser1.save();

      const rest1 = new restaurantModel({
        name: "Royal Biryani & Kebabs",
        slug: "royal-biryani-kebabs",
        ownerId: partnerUser1._id,
        description: "Authentic Dum Biryani, Galouti Kebabs, and Mughlai curries slow-cooked with royal spices.",
        cuisine: ["Biryani", "Mughlai", "North Indian"],
        image: "default_restaurant.png",
        address: {
          street: "Civil Lines, Near Clock Tower",
          city: "Mirzapur",
          state: "Uttar Pradesh",
          pincode: "231001",
          country: "India",
          location: { type: "Point", coordinates: [82.5644, 25.1337] }
        },
        phone: "9811223344",
        email: "contact@royalbiryani.com",
        openingHours: { open: "11:00", close: "23:00" },
        isOpen: true,
        serviceAvailable: true,
        avgPrepTimeMinutes: 30,
        deliveryRadiusKm: 8,
        packagingFee: 25,
        commissionRate: 15,
        fssaiLicenseNumber: "12720011000456",
        verificationStatus: "approved",
        rating: 4.7,
        reviewsCount: 380
      });
      await rest1.save();
      partnerUser1.restaurantId = rest1._id;
      await partnerUser1.save();

      // Create partner owner 2 (Pending approval demonstration)
      const hash2 = await bcrypt.hash("Partner@123", salt);
      const partnerUser2 = new userModel({
        name: "Pooja Verma",
        email: "pooja@delhisweets.com",
        password: hash2,
        role: "restaurant_owner",
        phone: "9822334455"
      });
      await partnerUser2.save();

      const rest2 = new restaurantModel({
        name: "Delhi Sweets & Chaat Bhandar",
        slug: "delhi-sweets-chaat",
        ownerId: partnerUser2._id,
        description: "Fresh Rasgullas, Kaju Katli, crispy Golgappas, and Raj Kachori.",
        cuisine: ["Desserts", "Street Food", "Pure Veg"],
        image: "default_restaurant.png",
        address: {
          street: "Main Market, Sector 18",
          city: "Delhi NCR",
          state: "Delhi",
          pincode: "110001",
          country: "India",
          location: { type: "Point", coordinates: [77.2090, 28.6139] }
        },
        phone: "9822334455",
        email: "orders@delhisweets.com",
        openingHours: { open: "09:00", close: "22:00" },
        isOpen: true,
        serviceAvailable: true,
        avgPrepTimeMinutes: 15,
        deliveryRadiusKm: 6,
        packagingFee: 15,
        commissionRate: 12,
        fssaiLicenseNumber: "10021011000789",
        verificationStatus: "pending", // Waiting for admin review!
        rating: 4.4,
        reviewsCount: 95
      });
      await rest2.save();
      partnerUser2.restaurantId = rest2._id;
      await partnerUser2.save();

      console.log("✅ [Migration] Seeded 2 pilot partner restaurants (1 Approved, 1 Pending Admin Review)");
    }

    // 5. Seed and update all verified Thali Templates
    await seedThaliTemplateItems();

    // 6. Enrich legacy food items with mealType and spiceLevel for Aaj Kya Khau?
    await foodModel.updateMany(
      { mealType: { $exists: false } },
      { $set: { mealType: "regular", spiceLevel: "medium", cuisine: "North Indian" } }
    );

    // Set light bite items for salads and snacks
    await foodModel.updateMany(
      { category: { $in: ["Salad", "Sandwich", "Dessert"] } },
      { $set: { mealType: "light", spiceLevel: "mild" } }
    );

    // Set filling items for rolls and main dishes
    await foodModel.updateMany(
      { category: { $in: ["Rolls", "Pasta", "Noodles"] } },
      { $set: { mealType: "filling", spiceLevel: "medium" } }
    );

    // 7. Explicitly classify dietary classification in foodModel (veg vs non-veg)
    await foodModel.updateMany(
      {
        $or: [
          { name: { $regex: /chicken|egg|fish|mutton|meat|prawn|keema/i } },
          { description: { $regex: /chicken|egg|fish|mutton|meat|prawn|keema/i } }
        ]
      },
      { $set: { isVeg: false } }
    );
    await foodModel.updateMany(
      {
        isVeg: { $ne: false },
        name: { $not: { $regex: /chicken|egg|fish|mutton|meat|prawn|keema/i } }
      },
      { $set: { isVeg: true } }
    );
    console.log("✅ [Migration] Explicit dietary classification verified across all menu items");
    await seedThaliTemplateItems();
  } catch (error) {
    console.warn("⚠️ [Migration] Notice during initial migration:", error.message);
  }
};
