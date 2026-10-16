import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const dishes = [
  // CHAAP (10 dishes)
  {
    name: "Soya Malai Chaap",
    file: "food_soya_malai_chaap.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Soya_Chaap_dish.jpg",
    backup: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Tandoori Masala Chaap",
    file: "food_tandoori_masala_chaap.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Tandoori_platter.jpg",
    backup: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Afghani Soya Chaap",
    file: "food_afghani_soya_chaap.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/31/Malai_chicken_tikka.JPG",
    backup: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Achari Soya Chaap",
    file: "food_achari_soya_chaap.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Paneer_tikka.jpg",
    backup: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Haryali Soya Chaap",
    file: "food_haryali_soya_chaap.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Hariyali_Tikka.jpg",
    backup: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Soya Chaap Butter Masala Gravy",
    file: "food_soya_chaap_butter_masala.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/00/Chicken_tikka_masala_%28cropped%29.jpg",
    backup: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Kadhai Soya Chaap Gravy",
    file: "food_kadhai_soya_chaap.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/be/Punjabi_Chicken_Karahi.JPG",
    backup: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Soya Chaap Rogan Josh (Veg Style)",
    file: "food_soya_chaap_rogan_josh.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/67/Rogan_Josh_Kashmiri.jpg",
    backup: "https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Crispy Kurkure Soya Chaap",
    file: "food_kurkure_soya_chaap.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_momos_of_Salem.jpg",
    backup: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Soya Chaap Kathi Roll",
    file: "food_soya_chaap_roll.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chicken_Chilli.JPG",
    backup: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80"
  },

  // CONTINENTAL (13 dishes)
  {
    name: "Cheesy Garlic Bread",
    file: "food_cheesy_garlic_bread.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Garlic_bread_baguettes_2.jpg",
    backup: "https://images.unsplash.com/photo-1619895092538-128341789043?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Classic Mac & Cheese",
    file: "food_classic_mac_cheese.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Original_Mac_n_Cheese_.jpg",
    backup: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Baked Vegetable Au Gratin",
    file: "food_baked_veg_au_gratin.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Gratin-Dauphinois.jpg",
    backup: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Grilled Cottage Cheese Steak",
    file: "food_grilled_cottage_cheese_steak.jpg",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Cream of Mushroom Soup",
    file: "food_cream_mushroom_soup.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/98/Cream_mushroom_soup_3.jpg",
    backup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Crispy Jalapeño Cheese Poppers",
    file: "food_crispy_jalapeno_poppers.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Cooking-food-stuffed-jalapenos-peppers.jpg",
    backup: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Herb Grilled Chicken Breast",
    file: "food_herb_grilled_chicken_breast.jpg",
    url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chicken Stroganoff with Buttered Rice",
    file: "food_chicken_stroganoff_rice.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/95/Moscow_%288351271825%29.jpg",
    backup: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Crispy Fish & Chips",
    file: "food_crispy_fish_chips.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Fish_and_chips_blackpool.jpg",
    backup: "https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Grilled Lemon Butter Fish",
    file: "food_grilled_lemon_fish.jpg",
    url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Roasted Chicken Caesar Wrap",
    file: "food_roasted_chicken_caesar_wrap.jpg",
    url: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Peri Peri Grilled Chicken Skewers",
    file: "food_peri_peri_chicken_skewers.jpg",
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Spinach & Corn Quesadilla",
    file: "food_spinach_corn_quesadilla.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/01/Empanada_flor_de_Calabaza.jpg",
    backup: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&auto=format&fit=crop&q=80"
  },

  // ITALIAN (14 dishes)
  {
    name: "Classic Margherita Pizza",
    file: "food_classic_margherita_pizza.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Margherita_Originale.JPG",
    backup: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Farmhouse Garden Fresh Pizza",
    file: "food_farmhouse_garden_pizza.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Vegetarian_Pizza.jpg",
    backup: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Quattro Formaggi (Four Cheese) Pizza",
    file: "food_quattro_formaggi_pizza.jpg",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Paneer Makhani Fusion Pizza",
    file: "food_paneer_makhani_fusion_pizza.jpg",
    url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Classic Penne Arrabbiata",
    file: "food_penne_arrabbiata.jpg",
    url: "local",
    backup: "local"
  },
  {
    name: "Fettuccine Alfredo Cream",
    file: "food_fettuccine_alfredo_cream.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Fettuccine_Alfredo_originals.jpg",
    backup: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Spaghetti Aglio Olio e Peperoncino",
    file: "food_aglio_olio.jpg",
    url: "local",
    backup: "local"
  },
  {
    name: "Genovese Creamy Pesto Penne",
    file: "food_pesto_pasta.jpg",
    url: "local",
    backup: "local"
  },
  {
    name: "Wild Mushroom & Parmesan Risotto",
    file: "food_wild_mushroom_risotto.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Risotto_with_speck_and_goat_cheese_%286101067436%29.jpg",
    backup: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "BBQ Chicken Fiesta Pizza",
    file: "food_bbq_chicken_fiesta_pizza.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Chicken_BBQ_Pizza.jpg",
    backup: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Peri Peri Chicken Pizza",
    file: "food_peri_peri_chicken_pizza.jpg",
    url: "https://images.unsplash.com/photo-1594007654729-407edc4be65b?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Creamy Chicken Alfredo Penne",
    file: "food_alfredo_pasta.jpg",
    url: "local",
    backup: "local"
  },
  {
    name: "Chicken Carbonara Spaghetti",
    file: "food_chicken_carbonara_spaghetti.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Espaguetis_carbonara.jpg",
    backup: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Classic Venetian Tiramisu",
    file: "food_classic_venetian_tiramisu.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/58/Tiramisu_-_Raffaele_Diomede.jpg",
    backup: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80"
  },

  // BIRYANI (12 dishes)
  {
    name: "Hyderabadi Dum Veg Biryani",
    file: "food_hyderabadi_veg_biryani.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Vegetable_Biryani%2C_Hyderabad.jpg",
    backup: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Awadhi Paneer Tikka Biryani",
    file: "food_awadhi_paneer_biryani.jpg",
    url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Soya Chaap Dum Biryani",
    file: "food_soya_chaap_biryani.jpg",
    url: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Kathal (Jackfruit) Dum Biryani",
    file: "food_kathal_jackfruit_biryani.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/48/India_food.jpg",
    backup: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Kolkata Royal Egg Biryani",
    file: "food_kolkata_egg_biryani.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/16/Egg_Biryani_in_a_restaurant.jpg",
    backup: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Hyderabadi Chicken Dum Biryani",
    file: "food_hyderabadi_chicken_dum_biryani.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg",
    backup: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Lucknowi Murgh Biryani",
    file: "food_lucknowi_murgh_biryani.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Chicken_Biriyani.jpg",
    backup: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chicken Tikka Boneless Biryani",
    file: "food_chicken_tikka_boneless_biryani.jpg",
    url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Awadhi Mutton Dum Biryani",
    file: "food_awadhi_mutton_dum_biryani.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/23/A_home_made_plate_of_mutton_biryani_served_with_chicken_kassa_cooked_in_the_bengali_style.jpg",
    backup: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Mutton Keema Biryani",
    file: "food_mutton_keema_biryani.jpg",
    url: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Prawns Masala Biryani",
    file: "food_prawns_masala_biryani.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Prawn_Biryani%2C_Hyderabad.jpg",
    backup: "https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Jeera Rice with Dal Tadka Combo",
    file: "food_dal_tadka.jpg",
    url: "local",
    backup: "local"
  },

  // STREET FOOD (14 dishes)
  {
    name: "Delhi Special Chhole Bhature",
    file: "food_delhi_chhole_bhature.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Chhole_Bhature_served_in_North_India.jpg",
    backup: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Mumbai Butter Pav Bhaji",
    file: "food_mumbai_butter_pav_bhaji.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/34/Bhaji_pav_2.jpg",
    backup: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Crispy Aloo Tikki Chaat",
    file: "food_crispy_aloo_tikki_chaat.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Aloo_Tikki_served_with_chutneys.jpg",
    backup: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Dahi Bhalla Papdi Chaat",
    file: "food_dahi_bhalla_papdi_chaat.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Dahi_bhalla_or_dahi_wada_or_dahi_bada.PNG",
    backup: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Steamed Veg Darjeeling Momos (6 pcs)",
    file: "food_steamed_veg_darjeeling_momos.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Steamed_Momos_-_KOLKATA.jpg",
    backup: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Fried Veg Momos (6 pcs)",
    file: "food_fried_veg_momos.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_momos_of_Salem.jpg",
    backup: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Kurkure Paneer Momos (6 pcs)",
    file: "food_kurkure_paneer_momos.jpg",
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Steamed Chicken Momos (6 pcs)",
    file: "food_steamed_chicken_momos.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Chicken_Momo_-_Howrah_2013-10-10_3254.JPG",
    backup: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Fried Chicken Momos (6 pcs)",
    file: "food_fried_chicken_momos.jpg",
    url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Kurkure Chicken Momos (6 pcs)",
    file: "food_kurkure_chicken_momos.jpg",
    url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Paneer Kathi Roll",
    file: "food_paneer_roll.jpg",
    url: "local",
    backup: "local"
  },
  {
    name: "Double Egg Chicken Roll",
    file: "food_double_egg_chicken_roll.jpg",
    url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Mutton Seekh Kebab Roll",
    file: "food_mutton_seekh_kebab_roll.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Seekh_Kebab.JPG",
    backup: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Amritsari Kulcha with Chhole",
    file: "food_amritsari_kulcha_chhole.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Chole_Kulcha_Meal_-_Order_Food_Online_in_Mumbai_%2831013272937%29.jpg",
    backup: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80"
  },

  // NON-VEG SPECIALS (14 dishes)
  {
    name: "Old Delhi Butter Chicken",
    file: "food_old_delhi_butter_chicken.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg",
    backup: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chicken Tikka Masala",
    file: "food_chicken_tikka_masala.jpg",
    url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Tandoori Murgh (Half)",
    file: "food_tandoori_murgh_half.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Chickentandoori.jpg",
    backup: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Tandoori Murgh (Full)",
    file: "food_tandoori_murgh_full.jpg",
    url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Kadhai Chicken",
    file: "food_kadhai_chicken.jpg",
    url: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Mughlai Chicken Korma",
    file: "food_mughlai_chicken_korma.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Chicken_Korma.JPG",
    backup: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chicken Rara Punjabi",
    file: "food_punjabi_chicken_rara.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chicken_rara_gravy.JPG",
    backup: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Kashmiri Mutton Rogan Josh",
    file: "food_kashmiri_mutton_rogan_josh.jpg",
    url: "https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Bhuna Gosht",
    file: "food_bhuna_gosht.jpg",
    url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Mutton Seekh Kebab (4 pcs)",
    file: "food_mutton_seekh_kebab.jpg",
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    backup: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Chicken Malai Tikka (6 pcs)",
    file: "food_chicken_malai_tikka.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/31/Malai_chicken_tikka.JPG",
    backup: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Amritsari Crispy Fish Fry",
    file: "food_amritsari_crispy_fish_fry.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Fish_fry_%2890626%29.jpg",
    backup: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Goan Fish Curry",
    file: "food_goan_fish_curry.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Goan_typical_meal_--_fish%2C_curry_and_rice.jpg",
    backup: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Masala Prawns Curry",
    file: "food_masala_prawns_curry.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/King_prawn_curry_-_Sunoso.jpg",
    backup: "https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop&q=80"
  }
];

function downloadUrl(url, targetPath) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'QuickBitesFoodDelivery/1.0 (contact@quickbites.in)' } }, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(targetPath);
        res.pipe(file);
        file.on('finish', () => {
          if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1000) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
        file.on('error', () => resolve(false));
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

(async () => {
  console.log(`Starting distinct image download for ${dishes.length} dishes...`);
  let successCount = 0;

  for (let i = 0; i < dishes.length; i++) {
    const d = dishes[i];
    if (d.url === 'local') {
      console.log(`[${i+1}/${dishes.length}] Using existing local file: ${d.file}`);
      successCount++;
      continue;
    }

    const frontPath = path.join(rootDir, 'Frontend/public/images', d.file);
    const backPath = path.join(rootDir, 'Backend/uploads', d.file);

    // Try primary URL first
    let ok = await downloadUrl(d.url, frontPath);
    if (!ok && d.backup && d.backup !== 'local') {
      console.log(`Primary failed for ${d.file}, downloading backup...`);
      ok = await downloadUrl(d.backup, frontPath);
    }

    if (ok && fs.existsSync(frontPath)) {
      fs.copyFileSync(frontPath, backPath);
      successCount++;
      console.log(`[${i+1}/${dishes.length}] ✅ Saved ${d.file} (${Math.round(fs.statSync(frontPath).size / 1024)} KB)`);
    } else {
      console.log(`[${i+1}/${dishes.length}] ❌ Failed: ${d.file}`);
    }

    // Gentle delay to avoid rate limits
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n🎉 Downloaded ${successCount}/${dishes.length} distinct food image files!`);

  // Update assets.js
  const assetsPath = path.join(rootDir, 'Frontend/src/assets/assets.js');
  let assetsContent = fs.readFileSync(assetsPath, 'utf8');

  // Copy category menu headers to Frontend/src/assets/
  const categoryHeaders = [
    { target: 'food_tandoori_chaap.jpg', source: 'food_tandoori_masala_chaap.jpg' },
    { target: 'food_cheesy_garlic_bread.jpg', source: 'food_cheesy_garlic_bread.jpg' },
    { target: 'food_margherita_pizza.jpg', source: 'food_classic_margherita_pizza.jpg' },
    { target: 'food_chicken_biryani.jpg', source: 'food_hyderabadi_chicken_dum_biryani.jpg' },
    { target: 'food_chhole_bhature.jpg', source: 'food_delhi_chhole_bhature.jpg' },
    { target: 'food_butter_chicken.jpg', source: 'food_old_delhi_butter_chicken.jpg' }
  ];

  for (const ch of categoryHeaders) {
    const src = path.join(rootDir, 'Frontend/public/images', ch.source);
    const dst = path.join(rootDir, 'Frontend/src/assets', ch.target);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
    }
  }

  let updatedAssets = 0;
  for (const d of dishes) {
    const regex = new RegExp(`(name:\\s*["']${d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'],\\s*\\n\\s*image:\\s*["'])[^"']+(["'])`, 'g');
    if (regex.test(assetsContent)) {
      assetsContent = assetsContent.replace(regex, `$1${d.file}$2`);
      updatedAssets++;
    }
  }
  fs.writeFileSync(assetsPath, assetsContent, 'utf8');
  console.log(`✅ Updated ${updatedAssets} items in assets.js`);

  // Update seedCatalog.js
  const seedPath = path.join(rootDir, 'Backend/config/seedCatalog.js');
  let seedContent = fs.readFileSync(seedPath, 'utf8');

  let updatedSeed = 0;
  for (const d of dishes) {
    const regex = new RegExp(`(name:\\s*["']${d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'],\\s*\\n\\s*image:\\s*["'])[^"']+(["'])`, 'g');
    if (regex.test(seedContent)) {
      seedContent = seedContent.replace(regex, `$1${d.file}$2`);
      updatedSeed++;
    }
  }
  fs.writeFileSync(seedPath, seedContent, 'utf8');
  console.log(`✅ Updated ${updatedSeed} items in seedCatalog.js`);
})();
