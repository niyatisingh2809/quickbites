import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import thaliTemplateModel from "../models/thaliTemplateModel.js";

/**
 * QUICKBITES DAILY - UNIFIED SERVER-SIDE PRICING SERVICE
 * All calculations are executed strictly in integer paise (₹1 = 100 paise)
 * to eliminate floating-point rounding errors.
 */

// Core Platform Configuration
export const PLATFORM_FEE_PAISE = 500; // ₹5.00
export const STANDARD_DELIVERY_FEE_PAISE = 4000; // ₹40.00
export const STANDARD_PACKAGING_FEE_PAISE = 2000; // ₹20.00
export const GST_RATE_PERCENT = 5; // 5% GST on prepared food in India

/**
 * Validate customer thali configuration and compute authoritative price in paise
 */
export const validateAndPriceThaliItem = async (item, targetRestaurantId = null) => {
  const templateId = item.thaliTemplateId || item.templateId || item._id;
  if (!templateId) {
    throw new Error("Missing thaliTemplateId for custom thali");
  }

  const template = await thaliTemplateModel.findById(templateId);
  if (!template) {
    throw new Error("Custom Thali template not found or no longer available");
  }

  if (!template.isAvailable) {
    throw new Error(`"${template.name}" is currently sold out and not available.`);
  }

  if (targetRestaurantId && template.restaurantId.toString() !== targetRestaurantId.toString()) {
    throw new Error(
      `"${template.name}" belongs to a different restaurant. QuickBites orders are strictly single-restaurant.`
    );
  }

  const config = item.thaliConfiguration || {};
  const selectedComponents = config.components || item.components || [];
  const prepInstructions = (config.preparationInstructions || item.preparationInstructions || "").slice(0, 250);

  const verifiedComponents = [];
  let extraPriceTotalRupees = 0;

  // Validate each group in the template
  for (const group of template.componentGroups) {
    const groupSelections = selectedComponents.filter(
      (c) => (c.groupId && c.groupId === group.groupId) || (c.groupName && c.groupName === group.name)
    );

    const totalSelectedCount = groupSelections.reduce((sum, c) => sum + (parseInt(c.quantity) || 1), 0);

    if (group.isRequired && totalSelectedCount < group.minSelections) {
      throw new Error(
        `Selection required: Please choose at least ${group.minSelections} item(s) in "${group.name}".`
      );
    }

    if (totalSelectedCount > group.maxSelections) {
      throw new Error(
        `Selection limit exceeded: You may choose at most ${group.maxSelections} item(s) in "${group.name}".`
      );
    }

    for (const sel of groupSelections) {
      const templateComp = group.components.find(
        (c) => (c.componentId && c.componentId === sel.componentId) || (c.name && c.name.toLowerCase() === sel.name.toLowerCase())
      );

      if (!templateComp) {
        throw new Error(`Invalid item "${sel.name}" in group "${group.name}".`);
      }

      if (!templateComp.isAvailable) {
        throw new Error(`"${templateComp.name}" is currently sold out. Please adjust your thali selection.`);
      }

      const compQty = Math.max(1, Math.min(parseInt(sel.quantity) || 1, group.maxQuantityPerSelection || 4));
      const extraPrice = templateComp.extraPriceRupees || 0;
      extraPriceTotalRupees += extraPrice * compQty;

      verifiedComponents.push({
        groupId: group.groupId,
        groupName: group.name,
        componentId: templateComp.componentId,
        name: templateComp.name,
        quantity: compQty,
        extraPriceRupees: extraPrice,
        portion: templateComp.portion || "",
        image: templateComp.image || "",
        isVeg: templateComp.isVeg !== false
      });
    }
  }

  const qty = Math.max(1, parseInt(item.quantity) || 1);
  const unitPriceRupees = template.basePriceRupees + extraPriceTotalRupees;
  const unitPricePaise = Math.round(unitPriceRupees * 100);

  return {
    isThali: true,
    thaliTemplateId: template._id,
    name: template.name,
    price: unitPriceRupees,
    unitPricePaise,
    quantity: qty,
    isVeg: template.isVeg !== false,
    restaurantId: template.restaurantId,
    thaliConfiguration: {
      templateId: template._id,
      templateName: template.name,
      basePriceRupees: template.basePriceRupees,
      components: verifiedComponents,
      preparationInstructions: prepInstructions,
      unitPriceRupees
    }
  };
};

/**
 * 1. Compute Full Delivered Price for a set of items from a restaurant to a specific address
 */
export const calculateDeliveredPrice = async ({
  items,
  restaurantId,
  deliveryAddress,
  promoCode = ""
}) => {
  if (!items || items.length === 0) {
    throw new Error("Items array cannot be empty");
  }

  // 1. Fetch restaurant and check approval, operating status & service area
  let targetRestId = restaurantId;
  const foodIds = items.filter((i) => !i.isThali && !i.thaliTemplateId).map((i) => i.foodId || i._id).filter(Boolean);
  const dbFoods = await foodModel.find({ _id: { $in: foodIds } });
  const foodMap = new Map();
  dbFoods.forEach((f) => foodMap.set(f._id.toString(), f));

  if (!targetRestId && dbFoods.length > 0) {
    targetRestId = dbFoods[0].restaurantId;
  }

  if (!targetRestId) {
    const firstThali = items.find((i) => i.isThali || i.thaliTemplateId);
    if (firstThali) {
      const tId = firstThali.thaliTemplateId || firstThali.templateId || firstThali._id;
      const tDoc = await thaliTemplateModel.findById(tId);
      if (tDoc) targetRestId = tDoc.restaurantId;
    }
  }

  if (!targetRestId) {
    const central = await restaurantModel.findOne({ slug: "quickbites-central-kitchen" });
    targetRestId = central ? central._id : null;
  }

  const restaurant = await restaurantModel.findById(targetRestId);
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  if (restaurant.verificationStatus !== "approved") {
    throw new Error(`[${restaurant.name}] is not currently active on the platform`);
  }

  if (!restaurant.isOpen || !restaurant.serviceAvailable) {
    throw new Error(`[${restaurant.name}] is currently closed and not accepting orders`);
  }

  // Check delivery area if address or pincode is supplied
  if (deliveryAddress && deliveryAddress.city) {
    const restCity = (restaurant.address?.city || "").toLowerCase().trim();
    const destCity = (deliveryAddress.city || "").toLowerCase().trim();
    if (restCity && destCity && !destCity.includes(restCity) && !restCity.includes(destCity)) {
      throw new Error(
        `[${restaurant.name}] delivers only within ${restaurant.address?.city}. Delivery to ${deliveryAddress.city} is not available.`
      );
    }
  }

  // 2. Validate items, availability, and compute food subtotal in paise
  let foodSubtotalPaise = 0;
  const verifiedItems = [];

  for (const item of items) {
    if (item.isThali || item.thaliTemplateId) {
      const verifiedThali = await validateAndPriceThaliItem(item, restaurant._id);
      foodSubtotalPaise += verifiedThali.unitPricePaise * verifiedThali.quantity;
      verifiedItems.push(verifiedThali);
    } else {
      const id = (item.foodId || item._id || "").toString();
      const dbItem = foodMap.get(id);

      if (!dbItem) {
        throw new Error(`Item "${item.name || id}" is no longer available on the menu`);
      }

      if (!dbItem.isAvailable) {
        throw new Error(`"${dbItem.name}" is sold out. Please remove it from your selection.`);
      }

      // Multi-restaurant boundary check
      if (dbItem.restaurantId && dbItem.restaurantId.toString() !== restaurant._id.toString()) {
        throw new Error(
          `"${dbItem.name}" belongs to [${dbItem.restaurantId}], but current cart is from [${restaurant.name}]. Orders are single-restaurant only.`
        );
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const unitPricePaise = Math.round(dbItem.price * 100);
      foodSubtotalPaise += unitPricePaise * qty;

      verifiedItems.push({
        foodId: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        unitPricePaise,
        quantity: qty,
        isVeg: dbItem.isVeg !== false,
        variant: item.variant || "",
        addons: item.addons || []
      });
    }
  }

  // 3. Fee calculations in paise
  const packagingFeePaise = (restaurant.packagingFee ? restaurant.packagingFee * 100 : STANDARD_PACKAGING_FEE_PAISE);
  let deliveryFeePaise = STANDARD_DELIVERY_FEE_PAISE;
  const platformFeePaise = PLATFORM_FEE_PAISE;
  const gstTaxPaise = Math.round((foodSubtotalPaise * GST_RATE_PERCENT) / 100);

  // 4. Promo code discounts
  let discountPaise = 0;
  const cleanPromo = (promoCode || "").trim().toUpperCase();
  if (cleanPromo === "WELCOME50") {
    // 50% off food subtotal up to ₹100 (10000 paise)
    discountPaise = Math.min(Math.round(foodSubtotalPaise * 0.5), 10000);
  } else if (cleanPromo === "TASTY10") {
    discountPaise = Math.min(4000, foodSubtotalPaise); // ₹40 off
  } else if (cleanPromo === "FOODIE20") {
    discountPaise = Math.round(foodSubtotalPaise * 0.2); // 20% off
  } else if (cleanPromo === "FREESHIP") {
    deliveryFeePaise = 0;
  }

  const finalPayablePaise = Math.max(
    0,
    foodSubtotalPaise + packagingFeePaise + deliveryFeePaise + platformFeePaise + gstTaxPaise - discountPaise
  );

  return {
    restaurant: {
      id: restaurant._id,
      name: restaurant.name,
      slug: restaurant.slug,
      city: restaurant.address?.city,
      packagingFee: restaurant.packagingFee || 20,
      avgPrepTimeMinutes: restaurant.avgPrepTimeMinutes || 25,
      commissionRate: restaurant.commissionRate || 15
    },
    verifiedItems,
    breakdown: {
      foodSubtotalPaise,
      foodSubtotalRupees: foodSubtotalPaise / 100,
      packagingFeePaise,
      packagingFeeRupees: packagingFeePaise / 100,
      deliveryFeePaise,
      deliveryFeeRupees: deliveryFeePaise / 100,
      platformFeePaise,
      platformFeeRupees: platformFeePaise / 100,
      gstTaxPaise,
      gstTaxRupees: gstTaxPaise / 100,
      discountPaise,
      discountRupees: discountPaise / 100,
      finalPayablePaise,
      finalPayableRupees: Math.round(finalPayablePaise / 100)
    }
  };
};

/**
 * 2. Budget Meal Finder Service
 * Searches all available meals whose complete delivered price fits the customer's budget
 */
export const searchBudgetMeals = async ({
  maxBudgetRupees,
  address,
  isVeg = null,
  cuisine = null,
  promoCode = ""
}) => {
  if (!maxBudgetRupees || isNaN(maxBudgetRupees) || maxBudgetRupees <= 0) {
    throw new Error("Please enter a valid positive budget amount in ₹");
  }

  if (!address || !address.city) {
    throw new Error("Delivery city or address is required to calculate accurate delivered prices");
  }

  const maxBudgetPaise = Math.round(maxBudgetRupees * 100);

  // 1. Find all approved & open restaurants serving this city
  const restFilter = {
    verificationStatus: "approved",
    isOpen: true,
    serviceAvailable: true,
    "address.city": new RegExp(address.city.trim(), "i")
  };

  const restaurants = await restaurantModel.find(restFilter);
  if (restaurants.length === 0) {
    return {
      fitsBudget: [],
      alternatives: [],
      notice: `No active partner restaurants currently open in ${address.city}. Try searching Delhi NCR or Mirzapur.`
    };
  }

  const restaurantIds = restaurants.map((r) => r._id);
  const restMap = new Map();
  restaurants.forEach((r) => restMap.set(r._id.toString(), r));

  // 2. Query available dishes from these restaurants
  const foodFilter = {
    restaurantId: { $in: restaurantIds },
    isAvailable: true
  };

  if (isVeg === true || isVeg === "true") {
    foodFilter.isVeg = true;
  }
  if (cuisine && cuisine !== "All") {
    foodFilter.category = new RegExp(cuisine, "i");
  }

  const candidateFoods = await foodModel.find(foodFilter);

  const fitsBudget = [];
  const alternatives = [];

  // 3. For each candidate dish, evaluate the COMPLETE delivered price using the exact same calculation!
  for (const food of candidateFoods) {
    const restaurant = restMap.get(food.restaurantId.toString());
    if (!restaurant) continue;

    try {
      const calculation = await calculateDeliveredPrice({
        items: [{ foodId: food._id, quantity: 1, name: food.name }],
        restaurantId: restaurant._id,
        deliveryAddress: address,
        promoCode
      });

      const b = calculation.breakdown;
      const mealCard = {
        foodId: food._id,
        name: food.name,
        description: food.description,
        category: food.category,
        image: food.image,
        isVeg: food.isVeg !== false,
        foodPriceRupees: food.price,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          city: restaurant.address?.city,
          avgPrepTimeMinutes: restaurant.avgPrepTimeMinutes || 25
        },
        breakdown: b,
        finalPayableRupees: b.finalPayableRupees
      };

      if (b.finalPayablePaise <= maxBudgetPaise) {
        fitsBudget.push(mealCard);
      } else if (b.finalPayablePaise <= maxBudgetPaise + 3000) {
        // Close alternative within ₹30 of budget
        alternatives.push(mealCard);
      }
    } catch (err) {
      // Skip item if it violates delivery checks
      continue;
    }
  }

  // Sort by final price ascending
  fitsBudget.sort((a, b) => a.finalPayableRupees - b.finalPayableRupees);
  alternatives.sort((a, b) => a.finalPayableRupees - b.finalPayableRupees);

  return {
    maxBudgetRupees,
    deliveryCity: address.city,
    totalFound: fitsBudget.length,
    fitsBudget,
    alternatives: fitsBudget.length === 0 ? alternatives.slice(0, 6) : []
  };
};
