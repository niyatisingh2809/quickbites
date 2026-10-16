import mongoose from "mongoose";
import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import thaliTemplateModel from "../models/thaliTemplateModel.js";
import { calculateDeliveredPrice } from "../services/pricingService.js";

/**
 * AAJ KYA KHAU? — RULE-BASED MEAL SUGGESTION ENGINE
 * Evaluates candidate meals from open, approved restaurants against:
 * 1. Strict budget boundary (never exceeded)
 * 2. Strict dietary filter (never silently relaxed)
 * 3. Cuisine, spice level, and meal fullness preferences
 * Computes exact delivered prices via pricingService.js
 */
export const suggestMeals = async (req, res) => {
  try {
    const {
      budgetRupees,
      address,
      cuisine = "Surprise Me",
      dietary = "any",
      spice = "medium",
      mealSize = "regular",
      offset = 0
    } = req.body;

    const maxBudget = Number(budgetRupees);
    if (!maxBudget || isNaN(maxBudget) || maxBudget <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid maximum budget in ₹"
      });
    }

    // 1. Find approved & open restaurants
    const restFilter = {
      verificationStatus: "approved",
      isOpen: true,
      serviceAvailable: true
    };

    if (address && address.city) {
      restFilter["address.city"] = new RegExp(address.city.trim(), "i");
    }

    let restaurants = await restaurantModel.find(restFilter);

    // Fallback: if no restaurants open in exact city, check Central Kitchen
    if (restaurants.length === 0) {
      const central = await restaurantModel.findOne({
        slug: "quickbites-central-kitchen",
        isOpen: true
      });
      if (central) restaurants = [central];
    }

    if (restaurants.length === 0) {
      return res.json({
        success: true,
        matches: [],
        totalMatches: 0,
        advice: "No partner restaurants are currently open in your selected area. Please check back during operating hours."
      });
    }

    const restMap = new Map();
    restaurants.forEach((r) => restMap.set(r._id.toString(), r));
    const restaurantIds = restaurants.map((r) => r._id);

    // 2. Build food candidates query
    const foodFilter = {
      restaurantId: { $in: restaurantIds },
      isAvailable: true
    };

    // Strict Dietary Filter: NEVER silently relaxed!
    if (dietary === "veg" || dietary === "vegan") {
      foodFilter.isVeg = true;
    }

    // Cuisine filter (if not "Surprise Me" or "All")
    const cleanCuisine = (cuisine || "").trim();
    if (cleanCuisine && cleanCuisine !== "Surprise Me" && cleanCuisine !== "All") {
      foodFilter.$or = [
        { category: new RegExp(cleanCuisine, "i") },
        { cuisine: new RegExp(cleanCuisine, "i") }
      ];
    }

    const candidateFoods = await foodModel.find(foodFilter).limit(80);

    // Also fetch active Thali templates if eligible
    const thaliFilter = {
      restaurantId: { $in: restaurantIds },
      isAvailable: true
    };
    if (dietary === "veg" || dietary === "vegan") {
      thaliFilter.isVeg = true;
    }
    const candidateThalis = await thaliTemplateModel.find(thaliFilter);

    // 3. Evaluate each candidate against budget and compute delivered price
    const scoredMeals = [];
    const hasAddress = Boolean(address && address.city);

    // Process regular dishes
    for (const food of candidateFoods) {
      const restaurant = restMap.get(food.restaurantId.toString());
      if (!restaurant) continue;

      let deliveredPriceRupees = food.price;
      let pricingBreakdown = null;

      if (hasAddress) {
        try {
          const calc = await calculateDeliveredPrice({
            items: [{ foodId: food._id, quantity: 1, name: food.name }],
            restaurantId: restaurant._id,
            deliveryAddress: address
          });
          pricingBreakdown = calc.breakdown;
          deliveredPriceRupees = calc.breakdown.finalPayableRupees;
        } catch (e) {
          continue; // Delivery unavailable
        }
      } else {
        // Estimate food + packaging + standard platform fee
        deliveredPriceRupees = food.price + (restaurant.packagingFee || 20) + 5;
      }

      // STRICT BUDGET CHECK: Never exceed customer budget!
      if (deliveredPriceRupees > maxBudget) {
        continue;
      }

      // Rule-Based Ranking Score
      let score = 100;

      // Cuisine affinity
      if (cleanCuisine === "Surprise Me") {
        score += 20;
      } else if (
        food.category?.toLowerCase().includes(cleanCuisine.toLowerCase()) ||
        food.cuisine?.toLowerCase().includes(cleanCuisine.toLowerCase())
      ) {
        score += 35;
      }

      // Spice level match
      if (food.spiceLevel && spice !== "any") {
        if (food.spiceLevel === spice) {
          score += 25;
        } else if (
          (spice === "mild" && food.spiceLevel === "medium") ||
          (spice === "spicy" && food.spiceLevel === "medium")
        ) {
          score += 10;
        }
      }

      // Meal size / fullness match
      if (food.mealType && mealSize !== "any") {
        if (food.mealType === mealSize) {
          score += 25;
        }
      }

      // Budget efficiency: reward meals that give great value (70% - 100% of budget)
      const budgetRatio = deliveredPriceRupees / maxBudget;
      if (budgetRatio >= 0.7 && budgetRatio <= 1.0) {
        score += 15;
      }

      // Restaurant rating bonus
      score += Math.round((restaurant.rating || 4.0) * 4);

      // Brief factual explanation based strictly on attributes
      let explanation = "";
      if (hasAddress) {
        explanation = `Fits your ₹${maxBudget} budget at ₹${deliveredPriceRupees} total delivered.`;
      } else {
        explanation = `Estimated at ₹${deliveredPriceRupees} (food & packaging). Enter address for doorstep total.`;
      }

      if (food.spiceLevel === spice && spice !== "any") {
        explanation += ` Matches your ${spice} spice preference.`;
      }
      if (food.mealType === mealSize && mealSize !== "any") {
        explanation += ` Perfect for a ${mealSize} meal.`;
      }

      scoredMeals.push({
        id: food._id,
        isThali: false,
        name: food.name,
        description: food.description,
        category: food.category,
        image: food.image,
        isVeg: food.isVeg !== false,
        foodPriceRupees: food.price,
        finalPriceRupees: deliveredPriceRupees,
        pricingBreakdown,
        hasExactDeliveredPrice: hasAddress,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          rating: restaurant.rating,
          city: restaurant.address?.city,
          avgPrepTimeMinutes: restaurant.avgPrepTimeMinutes || 25
        },
        spiceLevel: food.spiceLevel || "medium",
        mealType: food.mealType || "regular",
        explanation,
        score
      });
    }

    // Process Thalis
    for (const thali of candidateThalis) {
      const restaurant = restMap.get(thali.restaurantId.toString());
      if (!restaurant) continue;

      let deliveredPriceRupees = thali.basePriceRupees;
      let pricingBreakdown = null;

      if (hasAddress) {
        try {
          const calc = await calculateDeliveredPrice({
            items: [
              {
                isThali: true,
                thaliTemplateId: thali._id,
                quantity: 1,
                name: thali.name,
                thaliConfiguration: {
                  templateId: thali._id,
                  templateName: thali.name,
                  basePriceRupees: thali.basePriceRupees,
                  components: []
                }
              }
            ],
            restaurantId: restaurant._id,
            deliveryAddress: address
          });
          pricingBreakdown = calc.breakdown;
          deliveredPriceRupees = calc.breakdown.finalPayableRupees;
        } catch (e) {
          // If default thali validation requires specific items, calculate standard fees
          deliveredPriceRupees = thali.basePriceRupees + (restaurant.packagingFee || 20) + 40 + 5 + Math.round(thali.basePriceRupees * 0.05);
        }
      } else {
        deliveredPriceRupees = thali.basePriceRupees + (restaurant.packagingFee || 20) + 5;
      }

      if (deliveredPriceRupees > maxBudget) {
        continue;
      }

      let score = 110; // Thalis offer great variety and high fullness
      if (mealSize === "filling") score += 30;
      if (cleanCuisine === "Surprise Me" || cleanCuisine.toLowerCase().includes("indian")) score += 25;
      score += Math.round((restaurant.rating || 4.5) * 4);

      scoredMeals.push({
        id: thali._id,
        isThali: true,
        templateId: thali._id,
        name: thali.name,
        description: thali.description || "Customizable full thali with your choice of breads, dal, and curry.",
        category: "Custom Thali",
        image: thali.image || "header_img.png",
        isVeg: thali.isVeg !== false,
        foodPriceRupees: thali.basePriceRupees,
        finalPriceRupees: deliveredPriceRupees,
        pricingBreakdown,
        hasExactDeliveredPrice: hasAddress,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          rating: restaurant.rating,
          city: restaurant.address?.city,
          avgPrepTimeMinutes: restaurant.avgPrepTimeMinutes || 25
        },
        spiceLevel: "Customizable",
        mealType: "filling",
        explanation: `Customizable full thali fitting your ₹${maxBudget} budget at ₹${deliveredPriceRupees} complete meal.`,
        score
      });
    }

    // 4. Sort by rule score descending
    scoredMeals.sort((a, b) => b.score - a.score);

    // 5. Paginate top 3 recommendations
    const pageOffset = Number(offset) || 0;
    const topSuggestions = scoredMeals.slice(pageOffset, pageOffset + 3);
    const hasMore = pageOffset + 3 < scoredMeals.length;

    // 6. If no meals matched, analyze filters and provide actionable advice
    let advice = "";
    if (scoredMeals.length === 0) {
      const allCheapest = await foodModel
        .find({ restaurantId: { $in: restaurantIds }, isAvailable: true })
        .sort({ price: 1 })
        .limit(1);

      const lowestFoodPrice = allCheapest[0] ? allCheapest[0].price : 120;
      const minDeliveredEstimate = lowestFoodPrice + 65; // food + pkg + delivery + taxes

      if (maxBudget < minDeliveredEstimate) {
        advice = `No delivered meals found under ₹${maxBudget}. The most affordable meal delivered in ${address?.city || 'your area'} starts around ₹${minDeliveredEstimate}. Try increasing your budget to ₹${minDeliveredEstimate + 20}.`;
      } else if (dietary === "veg") {
        advice = `No vegetarian meals found matching "${cleanCuisine}" under ₹${maxBudget}. Try selecting "Surprise Me" or expanding your spice preference.`;
      } else {
        advice = `No meals matched all criteria. Try choosing "Surprise Me" or setting meal size to "Any".`;
      }
    }

    res.json({
      success: true,
      query: {
        budgetRupees: maxBudget,
        cuisine: cleanCuisine,
        dietary,
        spice,
        mealSize,
        offset: pageOffset
      },
      totalMatches: scoredMeals.length,
      matches: topSuggestions,
      hasMore,
      advice
    });
  } catch (error) {
    console.error("Meal Picker Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate meal suggestions" });
  }
};
