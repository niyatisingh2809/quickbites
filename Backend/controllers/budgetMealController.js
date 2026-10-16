import { searchBudgetMeals, calculateDeliveredPrice } from "../services/pricingService.js";

/**
 * Budget Meal Finder Endpoint
 * Returns all meals where COMPLETE delivered cost (Food + Packaging + Delivery + Platform Fee + GST - Discount) <= Budget
 */
export const searchMealsByBudget = async (req, res) => {
  try {
    const { maxBudgetRupees, address, isVeg, cuisine, promoCode } = req.body;

    if (!maxBudgetRupees) {
      return res.status(400).json({
        success: false,
        message: "Please specify your maximum delivered budget in ₹ (e.g. ₹120 or ₹150)"
      });
    }

    if (!address || !address.city) {
      return res.status(400).json({
        success: false,
        message: "Delivery city/location is required so we can compute actual delivery, taxes, and packaging fees"
      });
    }

    const results = await searchBudgetMeals({
      maxBudgetRupees: parseFloat(maxBudgetRupees),
      address,
      isVeg,
      cuisine,
      promoCode
    });

    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error("Budget Meal Search Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to search budget meals"
    });
  }
};

/**
 * Revalidate Budget Meal at Checkout
 * Explains price changes and asks customer to review if price or availability changed
 */
export const validateBudgetMealCheckout = async (req, res) => {
  try {
    const { foodId, quantity, restaurantId, address, promoCode, expectedTotalRupees } = req.body;

    const calculation = await calculateDeliveredPrice({
      items: [{ foodId, quantity: quantity || 1 }],
      restaurantId,
      deliveryAddress: address,
      promoCode
    });

    const currentTotalRupees = calculation.breakdown.finalPayableRupees;
    let priceChanged = false;

    if (expectedTotalRupees !== undefined && Number(expectedTotalRupees) !== currentTotalRupees) {
      priceChanged = true;
    }

    res.json({
      success: true,
      priceChanged,
      expectedTotalRupees,
      currentTotalRupees,
      breakdown: calculation.breakdown,
      restaurant: calculation.restaurant,
      verifiedItems: calculation.verifiedItems,
      message: priceChanged
        ? `Note: The delivered price has updated from ₹${expectedTotalRupees} to ₹${currentTotalRupees}. Please review before paying.`
        : "Delivered price verified"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Unable to validate meal checkout"
    });
  }
};
