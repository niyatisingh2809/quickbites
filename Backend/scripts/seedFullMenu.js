import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import { connectDB } from "../config/db.js";
import foodModel from "../models/foodModel.js";

const fullMenu = [
  // --- SALAD (5) ---
  {
    name: "Veg salad",
    category: "Salad",
    price: 145,
    description: "Crispy garden-fresh cucumbers, ripe tomatoes, carrots, and sweet bell peppers drizzled with extra virgin lemon olive oil.",
    image: "food_2.png"
  },
  {
    name: "Clover Salad",
    category: "Salad",
    price: 166,
    description: "Tender clover sprouts, baby spinach, tossed walnuts, and feta cheese drizzled with honey balsamic dressing.",
    image: "food_3.png"
  },
  {
    name: "Caesar Salad",
    category: "Salad",
    price: 216,
    description: "Crisp romaine hearts, toasted garlic herb croutons, parmesan shavings, and creamy Italian Caesar dressing.",
    image: "food_caesar_salad.jpg"
  },
  {
    name: "Greek salad",
    category: "Salad",
    price: 258,
    description: "Traditional Mediterranean salad with plump Kalamata olives, juicy tomatoes, crisp cucumber, and crumbly Greek feta.",
    image: "food_1.png"
  },
  {
    name: "Chicken Salad",
    category: "Salad",
    price: 294,
    description: "Tender grilled herb chicken breast slices tossed with organic greens, sweet corn, and creamy honey mustard dressing.",
    image: "food_4.png"
  },

  // --- ROLLS (5) ---
  {
    name: "Veg Rolls",
    category: "Rolls",
    price: 149,
    description: "Crunchy stir-fried spiced vegetables and paneer wrapped in a golden toasted crispy paratha.",
    image: "food_8.png"
  },
  {
    name: "Peri Peri Rolls",
    category: "Rolls",
    price: 189,
    description: "Fiery peri-peri seasoned crispy fillings rolled in a flakey paratha with cooling mint mayonnaise.",
    image: "food_6.png"
  },
  {
    name: "Paneer Kathi Roll",
    category: "Rolls",
    price: 196,
    description: "Marinated tandoori paneer tikka chunks wrapped with pickled onions, bell peppers, and signature green chutney.",
    image: "food_paneer_roll.jpg"
  },
  {
    name: "Lasagna Rolls",
    category: "Rolls",
    price: 219,
    description: "Gourmet baked pasta sheets rolled with seasoned ricotta, mozzarella, and savory marinara sauce.",
    image: "food_5.png"
  },
  {
    name: "Chicken Rolls",
    category: "Rolls",
    price: 228,
    description: "Juicy smoked shredded chicken tikka wrapped with spicy masala onions and rich garlic mayo in a crisp roti.",
    image: "food_7.png"
  },

  // --- DESERTS (5) ---
  {
    name: "Vanilla Ice Cream",
    category: "Deserts",
    price: 125,
    description: "Classic rich and velvety Madagascar vanilla bean ice cream served with a crisp waffle crunch.",
    image: "food_12.png"
  },
  {
    name: "Ripple Ice Cream",
    category: "Deserts",
    price: 135,
    description: "Creamy vanilla gelato swirled with tart raspberry and sweet strawberry ribbons.",
    image: "food_9.png"
  },
  {
    name: "Jar Ice Cream",
    category: "Deserts",
    price: 158,
    description: "Artisanal layered dessert jar packed with rich chocolate ganache, cookie crumbles, and creamy soft serve.",
    image: "food_11.png"
  },
  {
    name: "Fruit Ice Cream",
    category: "Deserts",
    price: 178,
    description: "Exotic tropical fruit sundae loaded with fresh mango chunks, kiwi, berries, and sweetened cream.",
    image: "food_10.png"
  },
  {
    name: "Sizzling Brownie",
    category: "Deserts",
    price: 209,
    description: "Warm gooey chocolate fudge brownie topped with melting vanilla ice cream and drizzled hot chocolate sauce.",
    image: "food_chocolate_brownie.jpg"
  },

  // --- SANDWICH (4) ---
  {
    name: "Bread Sandwich",
    category: "Sandwich",
    price: 139,
    description: "Classic street-style double-layer sandwich stuffed with spiced potatoes, cucumbers, tomatoes, and tangy chutney.",
    image: "food_16.png"
  },
  {
    name: "Vegan Sandwich",
    category: "Sandwich",
    price: 162,
    description: "Wholesome multigrain bread filled with creamy avocado spread, crisp cucumbers, tomatoes, and organic baby greens.",
    image: "food_14.png"
  },
  {
    name: "Chicken Sandwich",
    category: "Sandwich",
    price: 232,
    description: "Juicy shredded roasted chicken with melted cheddar, black pepper mayo, and fresh lettuce in toasted brioche.",
    image: "food_13.png"
  },
  {
    name: "Grilled Sandwich",
    category: "Sandwich",
    price: 299,
    description: "Jumbo triple-layered grilled sandwich loaded with melted mozzarella, sweet corn, bell peppers, and chipotle mayo.",
    image: "food_15.png"
  },

  // --- CAKE (5) ---
  {
    name: "Cup Cake",
    category: "Cake",
    price: 115,
    description: "Moist freshly baked vanilla cupcake with a swirl of buttery pastel frosting and rainbow sprinkles.",
    image: "food_17.png"
  },
  {
    name: "Sliced Cake",
    category: "Cake",
    price: 174,
    description: "Traditional moist English tea cake slice infused with aromatic cardamom and candied dried fruit peel.",
    image: "food_20.png"
  },
  {
    name: "Vegan Cake",
    category: "Cake",
    price: 254,
    description: "100% plant-based moist dark chocolate truffle cake made with almond milk and premium cocoa.",
    image: "food_18.png"
  },
  {
    name: "Red Velvet Cake",
    category: "Cake",
    price: 310,
    description: "Luxurious deep red sponge cake layered with silky cream cheese frosting and dusted with red velvet crumbs.",
    image: "food_red_velvet_cake.jpg"
  },
  {
    name: "Butterscotch Cake",
    category: "Cake",
    price: 349,
    description: "Rich butterscotch sponge layered with caramel glaze, crunchy caramelized cashew praline, and fluffy cream.",
    image: "food_19.png"
  },

  // --- PURE VEG (5) ---
  {
    name: "Fried Cauliflower",
    category: "Pure Veg",
    price: 192,
    description: "Crispy golden battered cauliflower florets tossed with toasted sesame, ginger, garlic, and scallions.",
    image: "food_22.png"
  },
  {
    name: "Rice Zucchini",
    category: "Pure Veg",
    price: 199,
    description: "Aromatic basmati rice cooked with fresh zucchini ribbons, garden herbs, and toasted pine nuts in virgin olive oil.",
    image: "food_24.png"
  },
  {
    name: "Garlic Mushroom",
    category: "Pure Veg",
    price: 245,
    description: "Plump button mushrooms sautéed in garlic-herb butter, crushed black pepper, and fresh parsley.",
    image: "food_21.png"
  },
  {
    name: "Paneer Tikka",
    category: "Pure Veg",
    price: 264,
    description: "Cottage cheese cubes marinated in yogurt and aromatic Indian tandoori spices, char-grilled to perfection.",
    image: "food_paneer_tikka.jpg"
  },
  {
    name: "Mix Veg Pulao",
    category: "Pure Veg",
    price: 288,
    description: "Fragrant long-grain basmati rice gently simmered with whole spices, green peas, carrots, beans, and fried cashews.",
    image: "food_23.png"
  },

  // --- PASTA (5) ---
  {
    name: "Tomato Pasta",
    category: "Pasta",
    price: 224,
    description: "Al dente penne pasta tossed in slow-simmered San Marzano tomato sauce, fresh basil, and extra virgin olive oil.",
    image: "food_26.png"
  },
  {
    name: "Cheese Pasta",
    category: "Pasta",
    price: 236,
    description: "Creamy macaroni and penne loaded with rich cheddar and mozzarella cheese sauce, baked golden on top.",
    image: "food_25.png"
  },
  {
    name: "Creamy Pasta",
    category: "Pasta",
    price: 249,
    description: "Silky fettuccine smothered in rich white garlic cream sauce with sautéed mushrooms and fresh parmesan.",
    image: "food_27.png"
  },
  {
    name: "Penne Arrabbiata",
    category: "Pasta",
    price: 269,
    description: "Spicy Italian penne pasta tossed in fiery red chili tomato sauce, fragrant garlic, fresh basil, and parmesan.",
    image: "food_penne_arrabbiata.jpg"
  },
  {
    name: "Chicken Pasta",
    category: "Pasta",
    price: 335,
    description: "Juicy herb-grilled chicken slices with tender pasta tossed in a velvety pink tomato-cream sauce.",
    image: "food_28.png"
  },

  // --- NOODLES (5) ---
  {
    name: "Veg Noodles",
    category: "Noodles",
    price: 182,
    description: "Street-style Hakka noodles stir-fried with crunchy cabbage, capsicum, carrots, and savory dark soy sauce.",
    image: "food_30.png"
  },
  {
    name: "Cooked Noodles",
    category: "Noodles",
    price: 212,
    description: "Classic Chinese wok-tossed noodles with farm vegetables, mild spices, and a touch of roasted sesame oil.",
    image: "food_32.png"
  },
  {
    name: "Chilli Garlic Noodles",
    category: "Noodles",
    price: 205,
    description: "Fiery wok-tossed noodles loaded with crushed garlic, bird eye chili, spring onions, and spicy Schezwan sauce.",
    image: "food_chilli_garlic_noodles.jpg"
  },
  {
    name: "Butter Noodles",
    category: "Noodles",
    price: 240,
    description: "Silky egg noodles tossed in melted butter, mild garlic, fresh parsley, and cracked black pepper.",
    image: "food_29.png"
  },
  {
    name: "Somen Noodles",
    category: "Noodles",
    price: 279,
    description: "Delicate thin Japanese wheat noodles served in a savory seasoned broth with scallions and toasted sesame.",
    image: "food_31.png"
  },

  // --- COFFEE (3) ---
  {
    name: "Hot Cappuccino",
    category: "Coffee",
    price: 142,
    description: "Freshly brewed double espresso topped with thick velvety steamed milk foam and dusted with chocolate powder.",
    image: "food_coffee_latte.jpg"
  },
  {
    name: "Iced Cold Coffee",
    category: "Coffee",
    price: 170,
    description: "Chilled blended espresso with creamy milk, vanilla ice cream, and chocolate syrup topped with whipped cream.",
    image: "food_coffee_latte.jpg"
  },
  {
    name: "Caramel Frappe",
    category: "Coffee",
    price: 284,
    description: "Thick ice-blended coffee frappuccino swirled with rich golden buttery caramel drizzle and sweet whipped topping.",
    image: "food_coffee_latte.jpg"
  },

  // --- SHAKES (3) ---
  {
    name: "Strawberry Cream Shake",
    category: "Shakes",
    price: 185,
    description: "Luscious creamy milkshake blended with ripe strawberries, vanilla ice cream, and topped with berry drizzle.",
    image: "food_chocolate_shake.jpg"
  },
  {
    name: "Oreo Thickshake",
    category: "Shakes",
    price: 274,
    description: "Ultra-thick milkshake loaded with crunchy crushed Oreo cookies, chocolate sauce, and a mountain of whipped cream.",
    image: "food_chocolate_shake.jpg"
  },
  {
    name: "Belgian Chocolate Shake",
    category: "Shakes",
    price: 325,
    description: "Decadent gourmet thickshake crafted with 70% pure Belgian dark chocolate, rich cream, and dark chocolate flakes.",
    image: "food_chocolate_shake.jpg"
  },

  // --- JUICE (3) ---
  {
    name: "Watermelon Mint Juice",
    category: "Juice",
    price: 120,
    description: "100% cold-pressed hydrating watermelon juice infused with fresh crushed mint and a splash of black salt.",
    image: "food_fresh_juice.jpg"
  },
  {
    name: "Fresh Orange Juice",
    category: "Juice",
    price: 130,
    description: "Freshly squeezed sweet Nagpur oranges, cold-pressed to preserve natural vitamins with zero added sugar.",
    image: "food_fresh_juice.jpg"
  },
  {
    name: "Alphonso Mango Juice",
    category: "Juice",
    price: 154,
    description: "Pure rich and pulpy Alphonso mango nectar served chilled, bursting with natural tropical sweetness.",
    image: "food_fresh_juice.jpg"
  }
];

async function seed() {
  // Validate price uniqueness!
  const prices = fullMenu.map(f => f.price);
  const priceSet = new Set(prices);
  if (priceSet.size !== fullMenu.length) {
    console.error("FATAL ERROR: Duplicate prices detected!");
    const seen = new Set();
    prices.forEach(p => {
      if (seen.has(p)) console.error("Duplicate price:", p);
      seen.add(p);
    });
    process.exit(1);
  }

  const below100 = fullMenu.filter(f => f.price < 100);
  if (below100.length > 0) {
    console.error("FATAL ERROR: Prices below 100 detected!", below100);
    process.exit(1);
  }

  console.log(`✅ Validation Passed: All ${fullMenu.length} dishes have STRICTLY UNIQUE prices!`);
  console.log(`Min Price: ₹${Math.min(...prices)}, Max Price: ₹${Math.max(...prices)}`);

  await connectDB();
  console.log("Connected to MongoDB. Resetting food collection...");

  await foodModel.deleteMany({});
  const inserted = await foodModel.insertMany(fullMenu);
  console.log(`Successfully seeded ${inserted.length} foods into MongoDB Atlas!`);

  const categories = await foodModel.distinct("category");
  console.log("Categories in DB:", categories);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
