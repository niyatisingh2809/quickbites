import mongoose from "mongoose";
import thaliTemplateModel from "../models/thaliTemplateModel.js";
import restaurantModel from "../models/restaurantModel.js";

/**
 * Idempotently seeds or updates all QuickBites Thali templates
 * with authentic images, portions, categories, and items.
 */
export const seedThaliTemplateItems = async () => {
  try {
    let centralRestaurant = await restaurantModel.findOne({ slug: "quickbites-central-kitchen" });
    if (!centralRestaurant) {
      centralRestaurant = await restaurantModel.findOne({ verificationStatus: "approved" });
    }
    if (!centralRestaurant) {
      console.warn("⚠️ [Thali Seed] No restaurant found to associate thali template.");
      return;
    }

    const thalisToSeed = [
      // 1. QuickBites Homestyle Vegetarian Thali (₹180)
      {
        restaurantId: centralRestaurant._id,
        name: "QuickBites Homestyle Vegetarian Thali",
        description: "Wholesome 100% vegetarian Indian thali crafted fresh to order. Customize your breads, rice, dal, sabzi, paneer, sides, and sweet desserts.",
        image: "food_veg_thali.jpg",
        basePriceRupees: 180,
        isVeg: true,
        isAvailable: true,
        isSample: true,
        allowedPreparationNotes: [
          "Less Spicy",
          "Medium Spicy",
          "Extra Spicy",
          "No Onion & Garlic",
          "Extra Butter on Breads",
          "Pack Dal Separately"
        ],
        componentGroups: [
          {
            groupId: "grp_breads",
            name: "Breads",
            isRequired: true,
            minSelections: 1,
            maxSelections: 2,
            maxQuantityPerSelection: 4,
            components: [
              { componentId: "c_tawa_roti", name: "Tawa Roti", portion: "4 pcs", isIncluded: true, extraPriceRupees: 0, image: "food_tawa_roti.jpg", isVeg: true, isAvailable: true, description: "Freshly puffed whole wheat tawa rotis" },
              { componentId: "c_butter_roti", name: "Butter Roti", portion: "4 pcs", isIncluded: false, extraPriceRupees: 15, image: "food_butter_roti.jpg", isVeg: true, isAvailable: true, description: "Soft whole wheat rotis brushed with fresh golden butter" },
              { componentId: "c_plain_naan", name: "Plain Naan", portion: "2 pcs", isIncluded: false, extraPriceRupees: 20, image: "food_plain_naan.jpg", isVeg: true, isAvailable: true, description: "Traditional clay-oven baked soft tandoori naan" },
              { componentId: "c_butter_naan", name: "Butter Naan", portion: "2 pcs", isIncluded: false, extraPriceRupees: 30, image: "food_butter_naan.jpg", isVeg: true, isAvailable: true, description: "Crisp tandoori naan glazed with rich melting butter" }
            ]
          },
          {
            groupId: "grp_rice",
            name: "Rice",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_steamed_rice", name: "Steamed Rice", portion: "1 Bowl (300g)", isIncluded: true, extraPriceRupees: 0, image: "food_steamed_rice.jpg", isVeg: true, isAvailable: true, description: "Aromatic long-grain steamed Basmati rice" },
              { componentId: "c_jeera_rice", name: "Jeera Rice", portion: "1 Bowl (300g)", isIncluded: false, extraPriceRupees: 20, image: "food_jeera_rice.jpg", isVeg: true, isAvailable: true, description: "Basmati rice tempered with golden roasted cumin seeds" }
            ]
          },
          {
            groupId: "grp_dal",
            name: "Dal",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_dal_tadka", name: "Dal Tadka", portion: "1 Bowl (250ml)", isIncluded: true, extraPriceRupees: 0, image: "food_dal_tadka.jpg", isVeg: true, isAvailable: true, description: "Yellow lentils tempered with garlic, cumin, and red chilies" },
              { componentId: "c_dal_fry", name: "Dal Fry", portion: "1 Bowl (250ml)", isIncluded: false, extraPriceRupees: 15, image: "food_dal_fry.jpg", isVeg: true, isAvailable: true, description: "Thick spiced lentils cooked with sautéed onions, tomatoes & ginger" },
              { componentId: "c_dal_makhani", name: "Dal Makhani", portion: "1 Bowl (250ml)", isIncluded: false, extraPriceRupees: 30, image: "food_dal_makhani.jpg", isVeg: true, isAvailable: true, description: "Slow-cooked black lentils in butter & fresh cream" }
            ]
          },
          {
            groupId: "grp_sabzi",
            name: "Sabzi",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_mix_veg", name: "Mix Veg", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_mix_veg.jpg", isVeg: true, isAvailable: true, description: "Carrots, peas, beans, and cauliflower in spiced gravy" },
              { componentId: "c_aloo_gobi", name: "Aloo Gobi", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_aloo_gobi.jpg", isVeg: true, isAvailable: true, description: "Dry-spiced tender potatoes and cauliflower with fresh ginger" },
              { componentId: "c_bhindi_masala", name: "Bhindi Masala", portion: "1 Bowl (200g)", isIncluded: false, extraPriceRupees: 25, image: "food_bhindi_masala.jpg", isVeg: true, isAvailable: true, description: "Crisp pan-tossed okra cooked with sautéed onions" }
            ]
          },
          {
            groupId: "grp_paneer",
            name: "Paneer",
            isRequired: false,
            minSelections: 0,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_shahi_paneer", name: "Shahi Paneer", portion: "1 Bowl (200g)", isIncluded: false, extraPriceRupees: 45, image: "food_shahi_paneer.jpg", isVeg: true, isAvailable: true, description: "Soft paneer cubes in creamy royal cashew-tomato gravy" },
              { componentId: "c_kadai_paneer", name: "Kadai Paneer", portion: "1 Bowl (200g)", isIncluded: false, extraPriceRupees: 40, image: "food_kadhai_paneer.jpg", isVeg: true, isAvailable: true, description: "Paneer and bell peppers tossed in fresh-ground kadai masala" },
              { componentId: "c_palak_paneer", name: "Palak Paneer", portion: "1 Bowl (200g)", isIncluded: false, extraPriceRupees: 40, image: "food_palak_paneer.jpg", isVeg: true, isAvailable: true, description: "Fresh cottage cheese cubes in smooth spiced spinach purée" }
            ]
          },
          {
            groupId: "grp_sides",
            name: "Sides",
            isRequired: false,
            minSelections: 0,
            maxSelections: 3,
            maxQuantityPerSelection: 2,
            components: [
              { componentId: "c_curd", name: "Curd", portion: "1 Cup (100g)", isIncluded: true, extraPriceRupees: 0, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Fresh homemade thick set curd" },
              { componentId: "c_boondi_raita", name: "Boondi Raita", portion: "1 Cup (150ml)", isIncluded: false, extraPriceRupees: 20, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Chilled whisked yogurt with crispy boondi and roasted cumin" },
              { componentId: "c_salad", name: "Salad", portion: "Green Salad Plate", isIncluded: true, extraPriceRupees: 0, image: "food_rainbow_salad.jpg", isVeg: true, isAvailable: true, description: "Fresh sliced cucumber, tomatoes, onions and lemon wedges" },
              { componentId: "c_papad", name: "Papad", portion: "2 Roasted Papads", isIncluded: true, extraPriceRupees: 0, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Crispy roasted urad dal papad with spices" },
              { componentId: "c_pickle", name: "Pickle", portion: "Mango & Lime Pickle", isIncluded: true, extraPriceRupees: 0, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Traditional spicy tangy Indian pickle" }
            ]
          },
          {
            groupId: "grp_desserts",
            name: "Desserts",
            isRequired: false,
            minSelections: 0,
            maxSelections: 1,
            maxQuantityPerSelection: 2,
            components: [
              { componentId: "c_gulab_jamun", name: "Gulab Jamun", portion: "2 pcs", isIncluded: false, extraPriceRupees: 35, image: "food_gulab_jamun.jpg", isVeg: true, isAvailable: true, description: "Warm soft khoya dumplings soaked in fragrant cardamom syrup" },
              { componentId: "c_kheer", name: "Kheer", portion: "1 Cup (150ml)", isIncluded: false, extraPriceRupees: 40, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Traditional slow-simmered basmati rice pudding with nuts" }
            ]
          }
        ]
      },

      // 2. QuickBites Maharaja Royal Thali (₹260) - Authentic Royal Platter
      {
        restaurantId: centralRestaurant._id,
        name: "QuickBites Maharaja Royal Thali",
        description: "A grand imperial feast with fresh tandoori breads, fragrant basmati pulao, creamy dal makhani, rich shahi paneer, refreshing raita, papad, and hot gulab jamun.",
        image: "thali_maharaja_royal.jpg",
        basePriceRupees: 260,
        isVeg: true,
        isAvailable: true,
        isSample: true,
        allowedPreparationNotes: [
          "Less Spicy",
          "Medium Spicy",
          "Extra Spicy",
          "No Onion & Garlic",
          "Extra Butter on Breads",
          "Pack Dal Separately"
        ],
        componentGroups: [
          {
            groupId: "grp_mr_breads",
            name: "Imperial Tandoori Breads",
            isRequired: true,
            minSelections: 1,
            maxSelections: 2,
            maxQuantityPerSelection: 4,
            components: [
              { componentId: "c_mr_butter_naan", name: "Butter Naan", portion: "2 pcs", isIncluded: true, extraPriceRupees: 0, image: "food_butter_naan.jpg", isVeg: true, isAvailable: true, description: "Soft tandoori naan glazed with rich melting butter" },
              { componentId: "c_mr_garlic_naan", name: "Garlic Butter Naan", portion: "2 pcs", isIncluded: false, extraPriceRupees: 25, image: "food_butter_naan.jpg", isVeg: true, isAvailable: true, description: "Tandoori naan infused with minced roasted garlic" },
              { componentId: "c_mr_tawa_roti", name: "Tawa Butter Roti", portion: "4 pcs", isIncluded: true, extraPriceRupees: 0, image: "food_butter_roti.jpg", isVeg: true, isAvailable: true, description: "Whole wheat rotis topped with desi ghee" },
              { componentId: "c_mr_plain_naan", name: "Plain Naan", portion: "2 pcs", isIncluded: true, extraPriceRupees: 0, image: "food_plain_naan.jpg", isVeg: true, isAvailable: true, description: "Crisp clay oven baked naan" }
            ]
          },
          {
            groupId: "grp_mr_rice",
            name: "Royal Rice & Pulao",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_mr_jeera_rice", name: "Jeera Pulao Rice", portion: "1 Bowl (300g)", isIncluded: true, extraPriceRupees: 0, image: "food_jeera_rice.jpg", isVeg: true, isAvailable: true, description: "Aromatic Basmati rice tossed with roasted cumin and ghee" },
              { componentId: "c_mr_steamed_rice", name: "Steamed Basmati Rice", portion: "1 Bowl (300g)", isIncluded: true, extraPriceRupees: 0, image: "food_steamed_rice.jpg", isVeg: true, isAvailable: true, description: "Fluffy fragrant long-grain steamed rice" }
            ]
          },
          {
            groupId: "grp_mr_dal",
            name: "Imperial Dal",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_mr_dal_makhani", name: "Dal Makhani", portion: "1 Bowl (250ml)", isIncluded: true, extraPriceRupees: 0, image: "food_dal_makhani.jpg", isVeg: true, isAvailable: true, description: "Slow-simmered whole black lentils with fresh cream & white butter" },
              { componentId: "c_mr_dal_tadka", name: "Yellow Dal Tadka", portion: "1 Bowl (250ml)", isIncluded: true, extraPriceRupees: 0, image: "food_dal_tadka.jpg", isVeg: true, isAvailable: true, description: "Golden lentils tempered with desi ghee and garlic" }
            ]
          },
          {
            groupId: "grp_mr_paneer",
            name: "Shahi Sabzi & Paneer",
            isRequired: true,
            minSelections: 1,
            maxSelections: 2,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_mr_shahi_paneer", name: "Shahi Paneer", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_shahi_paneer.jpg", isVeg: true, isAvailable: true, description: "Soft malai paneer in cashew nut saffron gravy" },
              { componentId: "c_mr_kadai_paneer", name: "Kadai Paneer", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_kadhai_paneer.jpg", isVeg: true, isAvailable: true, description: "Tossed paneer with crisp bell peppers in kadai masala" },
              { componentId: "c_mr_mix_veg", name: "Subz Navratan Mix Veg", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_mix_veg.jpg", isVeg: true, isAvailable: true, description: "Delicate seasonal vegetables cooked in aromatic gravy" }
            ]
          },
          {
            groupId: "grp_mr_sides",
            name: "Raita, Sides & Sweets",
            isRequired: false,
            minSelections: 0,
            maxSelections: 3,
            maxQuantityPerSelection: 2,
            components: [
              { componentId: "c_mr_boondi_raita", name: "Boondi Raita", portion: "1 Cup (150ml)", isIncluded: true, extraPriceRupees: 0, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Thick chilled spiced yogurt with crispy boondi" },
              { componentId: "c_mr_salad_papad", name: "Royal Green Salad & Roasted Papad", portion: "Platter Portion", isIncluded: true, extraPriceRupees: 0, image: "food_rainbow_salad.jpg", isVeg: true, isAvailable: true, description: "Crisp papad and garden fresh salad" },
              { componentId: "c_mr_gulab_jamun", name: "Hot Gulab Jamun", portion: "2 pcs", isIncluded: true, extraPriceRupees: 0, image: "food_gulab_jamun.jpg", isVeg: true, isAvailable: true, description: "Classic syrupy warm khoya dumplings" },
              { componentId: "c_mr_rasmalai", name: "Kesar Rasmalai", portion: "2 pcs", isIncluded: false, extraPriceRupees: 35, image: "food_rasmalai.jpg", isVeg: true, isAvailable: true, description: "Soft spongy cottage cheese patties in saffron-cardamom milk" }
            ]
          }
        ]
      },

      // 3. Student Budget Homestyle Thali (₹120) - Everyday Pocket-Friendly Thali
      {
        restaurantId: centralRestaurant._id,
        name: "Student Budget Homestyle Thali",
        description: "Pocket-friendly, wholesome everyday homestyle thali. Freshly cooked like ghar ka khana with soft rotis, homestyle dal, daily sabzi, and steamed rice.",
        image: "thali_student_budget.jpg",
        basePriceRupees: 120,
        isVeg: true,
        isAvailable: true,
        isSample: true,
        allowedPreparationNotes: ["Less Spicy", "No Onion & Garlic", "Extra Butter"],
        componentGroups: [
          {
            groupId: "grp_std_breads",
            name: "Rotis & Breads",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 4,
            components: [
              { componentId: "c_std_butter_roti", name: "4 Tawa Butter Rotis", portion: "4 pcs", isIncluded: true, extraPriceRupees: 0, image: "food_butter_roti.jpg", isVeg: true, isAvailable: true, description: "Four soft homestyle tawa rotis brushed with butter" },
              { componentId: "c_std_plain_roti", name: "4 Plain Phulka Rotis", portion: "4 pcs", isIncluded: true, extraPriceRupees: 0, image: "food_tawa_roti.jpg", isVeg: true, isAvailable: true, description: "Four simple unbuttered light phulkas" }
            ]
          },
          {
            groupId: "grp_std_dal",
            name: "Ghar Ki Dal",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_std_dal_fry", name: "Homestyle Dal Fry", portion: "1 Bowl (250ml)", isIncluded: true, extraPriceRupees: 0, image: "food_dal_fry.jpg", isVeg: true, isAvailable: true, description: "Yellow arhar dal tempered with jeera, onions and tomatoes" },
              { componentId: "c_std_dal_tadka", name: "Ghar Ka Dal Tadka", portion: "1 Bowl (250ml)", isIncluded: true, extraPriceRupees: 0, image: "food_dal_tadka.jpg", isVeg: true, isAvailable: true, description: "Light and comforting garlic-cumin tadka dal" },
              { componentId: "c_std_dal_makhani", name: "Dal Makhani", portion: "1 Bowl (250ml)", isIncluded: false, extraPriceRupees: 20, image: "food_dal_makhani.jpg", isVeg: true, isAvailable: true, description: "Rich slow-cooked black lentils" }
            ]
          },
          {
            groupId: "grp_std_sabzi",
            name: "Daily Sabzi",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_std_aloo_gobi", name: "Homestyle Aloo Gobi", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_aloo_gobi.jpg", isVeg: true, isAvailable: true, description: "Tender potatoes and cauliflower florets with mild spices" },
              { componentId: "c_std_mix_veg", name: "Daily Mix Veg", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_mix_veg.jpg", isVeg: true, isAvailable: true, description: "Fresh seasonal vegetables in homestyle dry curry" },
              { componentId: "c_std_shahi_paneer", name: "Upgrade to Shahi Paneer", portion: "1 Bowl (200g)", isIncluded: false, extraPriceRupees: 35, image: "food_shahi_paneer.jpg", isVeg: true, isAvailable: true, description: "Creamy cottage cheese cubes in rich tomato gravy" }
            ]
          },
          {
            groupId: "grp_std_rice",
            name: "Rice & Sweet",
            isRequired: false,
            minSelections: 0,
            maxSelections: 2,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_std_steamed_rice", name: "Steamed Rice Cup", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_steamed_rice.jpg", isVeg: true, isAvailable: true, description: "Light fluffy steamed rice" },
              { componentId: "c_std_gulab_jamun", name: "Gulab Jamun", portion: "1 pc", isIncluded: false, extraPriceRupees: 15, image: "food_gulab_jamun.jpg", isVeg: true, isAvailable: true, description: "Hot sweet gulab jamun" }
            ]
          }
        ]
      },

      // 4. QuickBites South Indian Deluxe Thali (₹190)
      {
        restaurantId: centralRestaurant._id,
        name: "QuickBites South Indian Deluxe Thali",
        description: "Authentic coastal South Indian feast. Crisp dosa / idli, piping hot Madras sambar, aromatic pepper rasam, vegetable avial, poriyal, chutneys, and sweet semiya payasam.",
        image: "thali_south_indian.jpg",
        basePriceRupees: 190,
        isVeg: true,
        isAvailable: true,
        isSample: true,
        allowedPreparationNotes: [
          "Extra Sambar",
          "Less Spicy Rasam",
          "Extra Coconut Chutney",
          "Crispy Papad"
        ],
        componentGroups: [
          {
            groupId: "grp_si_mains",
            name: "Tiffin & Bread Selection",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 2,
            components: [
              { componentId: "c_si_masala_dosa", name: "Crispy Masala Dosa", portion: "1 pc", isIncluded: true, extraPriceRupees: 0, image: "food_masala_dosa.jpg", isVeg: true, isAvailable: true, description: "Golden crispy crepe stuffed with spiced potato masala" },
              { componentId: "c_si_idli_vada", name: "2 Steamed Idlis & 1 Medu Vada", portion: "3 pcs", isIncluded: true, extraPriceRupees: 0, image: "food_idli_sambar.jpg", isVeg: true, isAvailable: true, description: "Soft fluffy idlis and crisp golden urad dal vada" },
              { componentId: "c_si_tawa_roti", name: "2 Malabar Parottas", portion: "2 pcs", isIncluded: false, extraPriceRupees: 20, image: "food_tawa_roti.jpg", isVeg: true, isAvailable: true, description: "Layered flaky South Indian parottas" }
            ]
          },
          {
            groupId: "grp_si_rice",
            name: "Rice Selection",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_si_steamed_rice", name: "Steamed Sona Masoori Rice", portion: "1 Bowl (300g)", isIncluded: true, extraPriceRupees: 0, image: "food_steamed_rice.jpg", isVeg: true, isAvailable: true, description: "Traditional South Indian fine boiled rice" },
              { componentId: "c_si_curd_rice", name: "Tempered Curd Rice", portion: "1 Bowl (250g)", isIncluded: false, extraPriceRupees: 20, image: "food_steamed_rice.jpg", isVeg: true, isAvailable: true, description: "Cool yogurt rice tempered with mustard seeds, curry leaves & ginger" }
            ]
          },
          {
            groupId: "grp_si_sambar",
            name: "Sambar & Rasam",
            isRequired: true,
            minSelections: 1,
            maxSelections: 2,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_si_sambar", name: "Madras Drumstick Sambar", portion: "1 Bowl (250ml)", isIncluded: true, extraPriceRupees: 0, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Authentic lentil stew with drumsticks, shallots and tamarind" },
              { componentId: "c_si_rasam", name: "Tomato Pepper Rasam", portion: "1 Bowl (200ml)", isIncluded: true, extraPriceRupees: 0, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Zesty digestive tamarind broth seasoned with crushed black pepper & cumin" }
            ]
          },
          {
            groupId: "grp_si_sides",
            name: "Curry, Sides & Chutneys",
            isRequired: false,
            minSelections: 0,
            maxSelections: 3,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_si_avial", name: "Kerala Vegetable Avial", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_mix_veg.jpg", isVeg: true, isAvailable: true, description: "Assorted vegetables cooked in coconut yogurt gravy with curry leaves" },
              { componentId: "c_si_chutneys", name: "Coconut & Tomato Chutneys + Appalam", portion: "Full Plate", isIncluded: true, extraPriceRupees: 0, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Freshly grated coconut chutney, tangy tomato chutney and roasted appalam" },
              { componentId: "c_si_payasam", name: "Semiya Payasam", portion: "1 Cup (150ml)", isIncluded: false, extraPriceRupees: 30, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Warm vermicelli pudding in rich cardamom-infused milk with roasted cashews" }
            ]
          }
        ]
      },

      // 5. QuickBites Rajasthani / Kathiawadi Royal Thali (₹240)
      {
        restaurantId: centralRestaurant._id,
        name: "QuickBites Rajasthani / Kathiawadi Royal Thali",
        description: "Flavors of the desert! Bajra rotla with white butter, baked bati, panchmel dal, tangy Rajasthani kadhi, gatte ki sabzi, lehsun chutney, and churma sweet.",
        image: "thali_rajasthani_royal.jpg",
        basePriceRupees: 240,
        isVeg: true,
        isAvailable: true,
        isSample: true,
        allowedPreparationNotes: [
          "Extra Desi Ghee",
          "Less Spicy Dal",
          "Spicy Garlic Chutney",
          "No Onion & Garlic"
        ],
        componentGroups: [
          {
            groupId: "grp_raj_breads",
            name: "Traditional Breads",
            isRequired: true,
            minSelections: 1,
            maxSelections: 2,
            maxQuantityPerSelection: 4,
            components: [
              { componentId: "c_raj_phulka", name: "4 Ghee Phulka Rotis", portion: "4 pcs", isIncluded: true, extraPriceRupees: 0, image: "food_butter_roti.jpg", isVeg: true, isAvailable: true, description: "Thin puffed wheat phulkas brushed with pure desi ghee" },
              { componentId: "c_raj_bajra", name: "2 Bajra Rotla with Butter", portion: "2 pcs", isIncluded: false, extraPriceRupees: 25, image: "food_tawa_roti.jpg", isVeg: true, isAvailable: true, description: "Hand-rolled millet rotlas topped with fresh white makhan" },
              { componentId: "c_raj_bati", name: "2 Traditional Baked Batis", portion: "2 pcs", isIncluded: false, extraPriceRupees: 30, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Oven-baked crisp wheat balls soaked in pure desi ghee" }
            ]
          },
          {
            groupId: "grp_raj_dal",
            name: "Dal & Kadhi",
            isRequired: true,
            minSelections: 1,
            maxSelections: 2,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_raj_panchmel", name: "Panchmel Dal", portion: "1 Bowl (250ml)", isIncluded: true, extraPriceRupees: 0, image: "food_dal_tadka.jpg", isVeg: true, isAvailable: true, description: "Traditional 5-lentil combination slow-cooked with whole spices" },
              { componentId: "c_raj_kadhi", name: "Rajasthani Marwadi Kadhi", portion: "1 Bowl (250ml)", isIncluded: true, extraPriceRupees: 0, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Spiced sour buttermilk curry tempered with fenugreek and mustard seeds" }
            ]
          },
          {
            groupId: "grp_raj_sabzi",
            name: "Heritage Curries",
            isRequired: true,
            minSelections: 1,
            maxSelections: 1,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_raj_gatte", name: "Rajasthani Gatte Ki Sabzi", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_mix_veg.jpg", isVeg: true, isAvailable: true, description: "Gram flour dumplings simmered in flavorful yogurt gravy" },
              { componentId: "c_raj_aloo_jeera", name: "Marwadi Aloo Jeera", portion: "1 Bowl (200g)", isIncluded: true, extraPriceRupees: 0, image: "food_aloo_gobi.jpg", isVeg: true, isAvailable: true, description: "Potatoes tossed in hing, roasted cumin and dry red chili" },
              { componentId: "c_raj_shahi_paneer", name: "Paneer Tikka Masala", portion: "1 Bowl (200g)", isIncluded: false, extraPriceRupees: 35, image: "food_shahi_paneer.jpg", isVeg: true, isAvailable: true, description: "Smoky tandoori paneer in rich tomato-onion masala" }
            ]
          },
          {
            groupId: "grp_raj_sides",
            name: "Kathiawadi Sides & Sweet",
            isRequired: false,
            minSelections: 0,
            maxSelections: 3,
            maxQuantityPerSelection: 1,
            components: [
              { componentId: "c_raj_chutney_chaas", name: "Lehsun Chutney, Mirchi & Masala Chaas", portion: "Full Plate + 200ml", isIncluded: true, extraPriceRupees: 0, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Fiery red garlic chutney, fried salted green chilies, and chilled spiced buttermilk" },
              { componentId: "c_raj_khichdi", name: "Vaghareli Khichdi Portion", portion: "1 Bowl (250g)", isIncluded: true, extraPriceRupees: 0, image: "food_steamed_rice.jpg", isVeg: true, isAvailable: true, description: "Comforting spiced rice & moong dal khichdi with ghee" },
              { componentId: "c_raj_churma", name: "Desi Ghee Churma Ladoo", portion: "2 pcs", isIncluded: false, extraPriceRupees: 35, image: "placeholder_dish.svg", isVeg: true, isAvailable: true, description: "Crushed sweetened wheat confection flavored with cardamom and saffron" }
            ]
          }
        ]
      }
    ];

    for (const tpl of thalisToSeed) {
      await thaliTemplateModel.findOneAndUpdate(
        { name: tpl.name },
        tpl,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✅ [Thali Seed] Successfully upserted template "${tpl.name}" with image "${tpl.image}"`);
    }

    console.log("🍱 [Thali Seed Complete] All 5 Thali Templates active and up to date!");
  } catch (error) {
    console.error("❌ [Thali Seed Error]:", error);
  }
};
