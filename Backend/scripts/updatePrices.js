import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import { connectDB } from "../config/db.js";
import foodModel from "../models/foodModel.js";

const priceMap = {
  "Greek salad": 179,
  "Veg salad": 149,
  "Clover Salad": 169,
  "Chicken Salad": 249,

  "Veg Rolls": 149,
  "Chicken Rolls": 229,
  "Peri Peri Rolls": 189,
  "Lasagna Rolls": 219,

  "Vanilla Ice Cream": 129,
  "Jar Ice Cream": 159,
  "Fruit Ice Cream": 179,
  "Ripple Ice Cream": 149,

  "Grilled Sandwich": 169,
  "Vegan Sandwich": 159,
  "Chicken Sandwich": 229,
  "Bread Sandwich": 139,

  "Cup Cake": 119,
  "Sliced Cake": 149,
  "Butterscotch Cake": 289,
  "Vegan Cake": 249,

  "Rice Zucchini": 199,
  "Mix Veg Pulao": 219,
  "Fried Cauliflower": 189,
  "Garlic Mushroom": 239,

  "Chicken Pasta": 289,
  "Creamy Pasta": 249,
  "Tomato Pasta": 219,
  "Cheese Pasta": 239,

  "Veg Noodles": 169,
  "Butter Noodles": 189,
  "Cooked Noodles": 179,
  "Somen Noodles": 229
};

async function run() {
  await connectDB();
  console.log("Connected to MongoDB for price update...");

  for (const [name, price] of Object.entries(priceMap)) {
    const res = await foodModel.updateOne(
      { name: new RegExp(`^${name}$`, "i") },
      { $set: { price } }
    );
    console.log(`Updated ${name} -> ₹${price} (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);
  }

  const allFoods = await foodModel.find({}).sort({ price: 1 });
  console.log("\n--- Updated Menu Prices (Ascending) ---");
  allFoods.forEach((f, idx) => {
    console.log(`${idx + 1}. ${f.name} (${f.category}): ₹${f.price}`);
  });

  await mongoose.disconnect();
  console.log("\nAll prices successfully updated and MongoDB disconnected!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Price update failed:", err);
  process.exit(1);
});
