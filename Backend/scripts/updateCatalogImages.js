import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const dishImageMap = {
  // Chaap
  "Soya Malai Chaap": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Soya_Chaap_dish.jpg",
  "Tandoori Masala Chaap": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Tandoori_platter.jpg",
  "Afghani Soya Chaap": "https://upload.wikimedia.org/wikipedia/commons/3/31/Malai_chicken_tikka.JPG",
  "Achari Soya Chaap": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/960px-Paneer_tikka.jpg",
  "Haryali Soya Chaap": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Hariyali_Tikka.jpg/960px-Hariyali_Tikka.jpg",
  "Soya Chaap Butter Masala Gravy": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/960px-Chicken_tikka_masala_%28cropped%29.jpg",
  "Kadhai Soya Chaap Gravy": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Punjabi_Chicken_Karahi.JPG/960px-Punjabi_Chicken_Karahi.JPG",
  "Soya Chaap Rogan Josh (Veg Style)": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Rogan_Josh_Kashmiri.jpg/960px-Rogan_Josh_Kashmiri.jpg",
  "Crispy Kurkure Soya Chaap": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_momos_of_Salem.jpg",
  "Soya Chaap Kathi Roll": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Achari_chaap_roll_from_Manoj_Naan_Wala%2C_IP_Extension%2C_Delhi_%28July_2025%29.jpg/1280px-Achari_chaap_roll_from_Manoj_Naan_Wala%2C_IP_Extension%2C_Delhi_%28July_2025%29.jpg",

  // Continental
  "Cheesy Garlic Bread": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Garlic_bread_baguettes_2.jpg",
  "Classic Mac & Cheese": "food_mac_and_cheese.jpg",
  "Baked Vegetable Au Gratin": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Gratin-Dauphinois.jpg",
  "Grilled Cottage Cheese Steak": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/960px-Paneer_tikka.jpg",
  "Cream of Mushroom Soup": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Cream_mushroom_soup_3.jpg/960px-Cream_mushroom_soup_3.jpg",
  "Crispy Jalapeño Cheese Poppers": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Cooking-food-stuffed-jalapenos-peppers.jpg",
  "Herb Grilled Chicken Breast": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Grilled_chicken_breast.jpg/960px-Grilled_chicken_breast.jpg",
  "Chicken Stroganoff with Buttered Rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Moscow_%288351271825%29.jpg/960px-Moscow_%288351271825%29.jpg",
  "Crispy Fish & Chips": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Fish_and_chips_blackpool.jpg/960px-Fish_and_chips_blackpool.jpg",
  "Grilled Lemon Butter Fish": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Pan-fried_fish_fillet.jpg/960px-Pan-fried_fish_fillet.jpg",
  "Roasted Chicken Caesar Wrap": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Chicken_wrap.jpg/960px-Chicken_wrap.jpg",
  "Peri Peri Grilled Chicken Skewers": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Chickentandoori.jpg",
  "Spinach & Corn Quesadilla": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Empanada_flor_de_Calabaza.jpg/960px-Empanada_flor_de_Calabaza.jpg",

  // Italian
  "Classic Margherita Pizza": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Margherita_Originale.JPG",
  "Farmhouse Garden Fresh Pizza": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Vegetarian_Pizza.jpg",
  "Quattro Formaggi (Four Cheese) Pizza": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/960px-Pizza-3007395.jpg",
  "Paneer Makhani Fusion Pizza": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg/960px-Eq_it-na_pizza-margherita_sep2005_sml.jpg",
  "Classic Penne Arrabbiata": "food_penne_arrabbiata.jpg",
  "Fettuccine Alfredo Cream": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Fettuccine_Alfredo_originals.jpg/960px-Fettuccine_Alfredo_originals.jpg",
  "Spaghetti Aglio Olio e Peperoncino": "food_aglio_olio.jpg",
  "Genovese Creamy Pesto Penne": "food_pesto_pasta.jpg",
  "Wild Mushroom & Parmesan Risotto": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Risotto_with_speck_and_goat_cheese_%286101067436%29.jpg/960px-Risotto_with_speck_and_goat_cheese_%286101067436%29.jpg",
  "BBQ Chicken Fiesta Pizza": "https://upload.wikimedia.org/wikipedia/commons/e/e8/Chicken_BBQ_Pizza.jpg",
  "Peri Peri Chicken Pizza": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Supreme_pizza.jpg/960px-Supreme_pizza.jpg",
  "Creamy Chicken Alfredo Penne": "food_alfredo_pasta.jpg",
  "Chicken Carbonara Spaghetti": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/960px-Espaguetis_carbonara.jpg",
  "Classic Venetian Tiramisu": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tiramisu_-_Raffaele_Diomede.jpg/960px-Tiramisu_-_Raffaele_Diomede.jpg",

  // Biryani
  "Hyderabadi Dum Veg Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Vegetable_Biryani%2C_Hyderabad.jpg/960px-Vegetable_Biryani%2C_Hyderabad.jpg",
  "Awadhi Paneer Tikka Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/960px-Paneer_tikka.jpg",
  "Soya Chaap Dum Biryani": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Soya_Chaap_dish.jpg",
  "Kathal (Jackfruit) Dum Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/India_food.jpg/960px-India_food.jpg",
  "Kolkata Royal Egg Biryani": "https://upload.wikimedia.org/wikipedia/commons/1/16/Egg_Biryani_in_a_restaurant.jpg",
  "Hyderabadi Chicken Dum Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/960px-%22Hyderabadi_Dum_Biryani%22.jpg",
  "Lucknowi Murgh Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Chicken_Biriyani.jpg/960px-Chicken_Biriyani.jpg",
  "Chicken Tikka Boneless Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/960px-Chicken_tikka_masala_%28cropped%29.jpg",
  "Awadhi Mutton Dum Biryani": "https://upload.wikimedia.org/wikipedia/commons/2/23/A_home_made_plate_of_mutton_biryani_served_with_chicken_kassa_cooked_in_the_bengali_style.jpg",
  "Mutton Keema Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Bengali_Mutton_Curry.JPG/960px-Bengali_Mutton_Curry.JPG",
  "Prawns Masala Biryani": "https://upload.wikimedia.org/wikipedia/commons/3/30/Prawn_Biryani%2C_Hyderabad.jpg",
  "Jeera Rice with Dal Tadka Combo": "food_dal_tadka.jpg",

  // Street Food
  "Delhi Special Chhole Bhature": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Chhole_Bhature_served_in_North_India.jpg",
  "Mumbai Butter Pav Bhaji": "https://upload.wikimedia.org/wikipedia/commons/3/34/Bhaji_pav_2.jpg",
  "Crispy Aloo Tikki Chaat": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Aloo_Tikki_served_with_chutneys.jpg/960px-Aloo_Tikki_served_with_chutneys.jpg",
  "Dahi Bhalla Papdi Chaat": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Dahi_bhalla_or_dahi_wada_or_dahi_bada.PNG",
  "Steamed Veg Darjeeling Momos (6 pcs)": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Steamed_Momos_-_KOLKATA.jpg",
  "Fried Veg Momos (6 pcs)": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_momos_of_Salem.jpg",
  "Kurkure Paneer Momos (6 pcs)": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/HK_SYP_%E8%A5%BF%E7%87%9F%E7%9B%A4_Sai_Ying_Pun_Kwan_Yick_Building_%E5%90%8D%E6%98%9F%E6%B5%B7%E9%AE%AE%E9%85%92%E5%AE%B6_Star_Seafood_Restaurant_food_%E5%90%9E%E9%BA%B5_Wonton_dim_sum_October_2020_SS2_01.jpg/960px-HK_SYP_%E8%A5%BF%E7%87%9F%E7%9B%A4_Sai_Ying_Pun_Kwan_Yick_Building_%E5%90%8D%E6%98%9F%E6%B5%B7%E9%AE%AE%E9%85%92%E5%AE%B6_Star_Seafood_Restaurant_food_%E5%90%9E%E9%BA%B5_Wonton_dim_sum_October_2020_SS2_01.jpg",
  "Steamed Chicken Momos (6 pcs)": "https://upload.wikimedia.org/wikipedia/commons/0/05/Chicken_Momo_-_Howrah_2013-10-10_3254.JPG",
  "Fried Chicken Momos (6 pcs)": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Fried-Chicken-Set.jpg/960px-Fried-Chicken-Set.jpg",
  "Kurkure Chicken Momos (6 pcs)": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chicken_Chilli.JPG/960px-Chicken_Chilli.JPG",
  "Paneer Kathi Roll": "food_paneer_roll.jpg",
  "Double Egg Chicken Roll": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Chicken_wrap.jpg/960px-Chicken_wrap.jpg",
  "Mutton Seekh Kebab Roll": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Seekh_Kebab.JPG",
  "Amritsari Kulcha with Chhole": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Chole_Kulcha_Meal_-_Order_Food_Online_in_Mumbai_%2831013272937%29.jpg/960px-Chole_Kulcha_Meal_-_Order_Food_Online_in_Mumbai_%2831013272937%29.jpg",

  // Non-Veg Specials
  "Old Delhi Butter Chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/960px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg",
  "Chicken Tikka Masala": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/960px-Chicken_tikka_masala_%28cropped%29.jpg",
  "Tandoori Murgh (Half)": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Chickentandoori.jpg",
  "Tandoori Murgh (Full)": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Tandoori_platter.jpg",
  "Kadhai Chicken": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Punjabi_Chicken_Karahi.JPG/960px-Punjabi_Chicken_Karahi.JPG",
  "Mughlai Chicken Korma": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Chicken_Korma.JPG",
  "Chicken Rara Punjabi": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chicken_rara_gravy.JPG",
  "Kashmiri Mutton Rogan Josh": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Rogan_Josh_Kashmiri.jpg/960px-Rogan_Josh_Kashmiri.jpg",
  "Bhuna Gosht": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Bengali_Mutton_Curry.JPG/960px-Bengali_Mutton_Curry.JPG",
  "Mutton Seekh Kebab (4 pcs)": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Seekh_Kebab.JPG",
  "Chicken Malai Tikka (6 pcs)": "https://upload.wikimedia.org/wikipedia/commons/3/31/Malai_chicken_tikka.JPG",
  "Amritsari Crispy Fish Fry": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Fish_fry_%2890626%29.jpg",
  "Goan Fish Curry": "https://upload.wikimedia.org/wikipedia/commons/b/bb/Goan_typical_meal_--_fish%2C_curry_and_rice.jpg",
  "Masala Prawns Curry": "https://upload.wikimedia.org/wikipedia/commons/c/cc/King_prawn_curry_-_Sunoso.jpg"
};

// Update Backend/config/seedCatalog.js
const seedCatalogPath = path.join(rootDir, 'Backend/config/seedCatalog.js');
let seedContent = fs.readFileSync(seedCatalogPath, 'utf8');

let updatedInSeed = 0;
for (const [name, imgUrl] of Object.entries(dishImageMap)) {
  // Regex to match dish block and update image
  const regex = new RegExp(`(name:\\s*["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'],\\s*\\n\\s*image:\\s*["'])[^"']+(["'])`, 'g');
  if (regex.test(seedContent)) {
    seedContent = seedContent.replace(regex, `$1${imgUrl}$2`);
    updatedInSeed++;
  }
}

// Ensure seedMissingCatalogFoods updates existing images
if (!seedContent.includes('existing.image !== item.image')) {
  seedContent = seedContent.replace(
    'if (existing.price !== item.price) {\n        existing.price = item.price;\n        updated = true;\n      }',
    'if (existing.price !== item.price) {\n        existing.price = item.price;\n        updated = true;\n      }\n      if (existing.image !== item.image) {\n        existing.image = item.image;\n        updated = true;\n      }'
  );
}

fs.writeFileSync(seedCatalogPath, seedContent, 'utf8');
console.log(`✅ Updated ${updatedInSeed} dishes in seedCatalog.js`);

// Update Frontend/src/assets/assets.js
const assetsPath = path.join(rootDir, 'Frontend/src/assets/assets.js');
let assetsContent = fs.readFileSync(assetsPath, 'utf8');

// Update menu category images
const menuReplacements = [
  ['import menu_chaap from \'./food_paneer_tikka.jpg\'', 'const menu_chaap = "https://upload.wikimedia.org/wikipedia/commons/6/6c/Tandoori_platter.jpg"'],
  ['import menu_continental from \'./food_mac_and_cheese.jpg\'', 'const menu_continental = "https://upload.wikimedia.org/wikipedia/commons/c/c1/Garlic_bread_baguettes_2.jpg"'],
  ['import menu_italian from \'./food_penne_arrabbiata.jpg\'', 'const menu_italian = "https://upload.wikimedia.org/wikipedia/commons/d/d4/Margherita_Originale.JPG"'],
  ['import menu_biryani from \'./food_jeera_rice.jpg\'', 'const menu_biryani = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/960px-%22Hyderabadi_Dum_Biryani%22.jpg"'],
  ['import menu_street_food from \'./food_spring_rolls.jpg\'', 'const menu_street_food = "https://upload.wikimedia.org/wikipedia/commons/9/9c/Chhole_Bhature_served_in_North_India.jpg"'],
  ['import menu_non_veg from \'./food_4.png\'', 'const menu_non_veg = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/960px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg"']
];

for (const [target, repl] of menuReplacements) {
  if (assetsContent.includes(target)) {
    assetsContent = assetsContent.replace(target, repl);
  }
}

let updatedInAssets = 0;
for (const [name, imgUrl] of Object.entries(dishImageMap)) {
  const regex = new RegExp(`(name:\\s*["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'],\\s*\\n\\s*image:\\s*["'])[^"']+(["'])`, 'g');
  if (regex.test(assetsContent)) {
    assetsContent = assetsContent.replace(regex, `$1${imgUrl}$2`);
    updatedInAssets++;
  }
}

fs.writeFileSync(assetsPath, assetsContent, 'utf8');
console.log(`✅ Updated ${updatedInAssets} dishes in assets.js`);
