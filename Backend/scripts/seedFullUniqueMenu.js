import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import { connectDB } from "../config/db.js";
import foodModel from "../models/foodModel.js";

export const fullMenu = [
  // ================= SALAD (10) =================
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
    name: "Sprouted Moong Protein Salad",
    category: "Salad",
    price: 175,
    description: "Nutritious organic sprouted moong beans tossed with chopped onions, tomatoes, green chilies, cilantro, and lemon juice.",
    image: "food_sprout_salad.jpg"
  },
  {
    name: "Quinoa Corn Fiesta Salad",
    category: "Salad",
    price: 199,
    description: "Fluffy Peruvian quinoa, sweet yellow corn, black beans, diced bell peppers, and zesty lime coriander dressing.",
    image: "food_quinoa_salad.jpg"
  },
  {
    name: "Caesar Salad",
    category: "Salad",
    price: 216,
    description: "Crisp romaine hearts, toasted garlic herb croutons, parmesan shavings, and creamy Italian Caesar dressing.",
    image: "food_caesar_salad.jpg"
  },
  {
    name: "Mediterranean Chickpea Salad",
    category: "Salad",
    price: 225,
    description: "Wholesome boiled kabuli chana with diced English cucumbers, juicy cherry tomatoes, kalamata olives, and fresh herbs.",
    image: "food_chickpea_salad.jpg"
  },
  {
    name: "Fresh Fruit Nutty Salad",
    category: "Salad",
    price: 242,
    description: "Chilled medley of sweet melons, crisp apples, juicy pomegranate arils, and toasted almonds with mint honey glaze.",
    image: "food_fruit_salad.jpg"
  },
  {
    name: "Greek salad",
    category: "Salad",
    price: 258,
    description: "Traditional Mediterranean salad with plump Kalamata olives, juicy tomatoes, crisp cucumber, and crumbly Greek feta.",
    image: "food_1.png"
  },
  {
    name: "Rainbow Garden Avocado Salad",
    category: "Salad",
    price: 275,
    description: "Vibrant garden bowl layered with ripe Hass avocado slices, crisp greens, beetroot, cherry tomatoes, and citrus vinaigrette.",
    image: "food_rainbow_salad.jpg"
  },
  {
    name: "Chicken Salad",
    category: "Salad",
    price: 294,
    description: "Tender grilled herb chicken breast slices tossed with organic greens, sweet corn, and creamy honey mustard dressing.",
    image: "food_4.png"
  },

  // ================= ROLLS (10) =================
  {
    name: "Aloo Frankie Roll",
    category: "Rolls",
    price: 129,
    description: "Iconic street-style spicy mashed potato frankie seasoned with special chaat masala, tangy onions, and green chili vinegar.",
    image: "food_aloo_frankie.jpg"
  },
  {
    name: "Veg Rolls",
    category: "Rolls",
    price: 149,
    description: "Crunchy stir-fried spiced vegetables and paneer wrapped in a golden toasted crispy paratha.",
    image: "food_8.png"
  },
  {
    name: "Cheesy Corn Roll",
    category: "Rolls",
    price: 165,
    description: "Melted mozzarella and sweet corn kernels wrapped in a flaky golden paratha with creamy mayo.",
    image: "food_corn_cheese_roll.jpg"
  },
  {
    name: "Spring Rolls Crisp",
    category: "Rolls",
    price: 177,
    description: "Golden fried crispy wrappers stuffed with seasoned shredded vegetables and glass noodles, served with sweet chili dip.",
    image: "food_spring_rolls.jpg"
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
    name: "Schezwan Paneer Roll",
    category: "Rolls",
    price: 208,
    description: "Spicy Schezwan tossed paneer cubes with crunchy cabbage, capsicum, and garlic mayo in a toasted wrap.",
    image: "food_schezwan_roll.jpg"
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
  {
    name: "Tandoori Mushroom Roll",
    category: "Rolls",
    price: 239,
    description: "Char-grilled tandoori spiced button mushrooms with crunchy onions, capsicum, and mint chutney in soft paratha.",
    image: "food_mushroom_roll.jpg"
  },

  // ================= DESERTS (10) =================
  {
    name: "Vanilla Ice Cream",
    category: "Deserts",
    price: 125,
    description: "Classic rich and velvety Madagascar vanilla bean ice cream served with a crisp waffle crunch.",
    image: "food_12.png"
  },
  {
    name: "Gulab Jamun Warm",
    category: "Deserts",
    price: 131,
    description: "Two melt-in-mouth golden fried milk solids dumplings soaked in aromatic cardamom and rose saffron syrup.",
    image: "food_gulab_jamun.jpg"
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
    name: "Rasmalai Royal",
    category: "Deserts",
    price: 169,
    description: "Soft spongy cottage cheese patties immersed in chilled clotted saffron cream, garnished with pistachios and almonds.",
    image: "food_rasmalai.jpg"
  },
  {
    name: "Fruit Ice Cream",
    category: "Deserts",
    price: 178,
    description: "Exotic tropical fruit sundae loaded with fresh mango chunks, kiwi, berries, and sweetened cream.",
    image: "food_10.png"
  },
  {
    name: "Chocolate Lava Cake",
    category: "Deserts",
    price: 197,
    description: "Decadent warm mini chocolate cake with a molten Belgian chocolate center that erupts upon first spoonful.",
    image: "food_choco_lava.jpg"
  },
  {
    name: "Sizzling Brownie",
    category: "Deserts",
    price: 209,
    description: "Warm gooey chocolate fudge brownie topped with melting vanilla ice cream and drizzled hot chocolate sauce.",
    image: "food_chocolate_brownie.jpg"
  },
  {
    name: "Kulfi Falooda Sundae",
    category: "Deserts",
    price: 217,
    description: "Traditional rich malai kulfi served over silky falooda vermicelli, sweet basil seeds, and fragrant rose syrup.",
    image: "food_kulfi_falooda.jpg"
  },
  {
    name: "Mango Panna Cotta",
    category: "Deserts",
    price: 231,
    description: "Silky Italian sweet cream set to perfection and topped with a glossy layer of natural Alphonso mango puree.",
    image: "food_mango_panna_cotta.jpg"
  },

  // ================= SANDWICH (10) =================
  {
    name: "Bread Sandwich",
    category: "Sandwich",
    price: 139,
    description: "Classic street-style double-layer sandwich stuffed with spiced potatoes, cucumbers, tomatoes, and tangy chutney.",
    image: "food_16.png"
  },
  {
    name: "Spinach Corn Toast",
    category: "Sandwich",
    price: 155,
    description: "Crispy grilled sourdough toast crowned with creamy garlic-sauteed baby spinach, sweet corn, and melted mozzarella.",
    image: "food_spinach_corn_toast.jpg"
  },
  {
    name: "Vegan Sandwich",
    category: "Sandwich",
    price: 162,
    description: "Wholesome multigrain bread filled with creamy avocado spread, crisp cucumbers, tomatoes, and organic baby greens.",
    image: "food_14.png"
  },
  {
    name: "Corn & Cheese Grilled Sandwich",
    category: "Sandwich",
    price: 182,
    description: "Golden griddled jumbo sandwich loaded with sweet American corn kernels, melted cheddar, and mozzarella herbs.",
    image: "food_corn_cheese_sandwich.jpg"
  },
  {
    name: "Mexican Jalapeno Cheese Sandwich",
    category: "Sandwich",
    price: 193,
    description: "Zesty toasted sandwich with pickled jalapenos, spicy tomato salsa, bell peppers, and gooey Monterey Jack cheese.",
    image: "food_jalapeno_sandwich.jpg"
  },
  {
    name: "Bombay Veg Club Sandwich",
    category: "Sandwich",
    price: 205,
    description: "Famous triple-decker Mumbai club sandwich layered with spiced potato masala, beetroot, cucumber, cheese, and mint chutney.",
    image: "food_veg_club_sandwich.jpg"
  },
  {
    name: "Paneer Tikka Sandwich",
    category: "Sandwich",
    price: 215,
    description: "Grilled multigrain sandwich filled with char-grilled paneer tikka, crunchy onions, and mint coriander mayo.",
    image: "food_paneer_sandwich.jpg"
  },
  {
    name: "Classic Egg Mayo Sandwich",
    category: "Sandwich",
    price: 221,
    description: "Creamy chopped boiled eggs tossed in Dijon mustard mayonnaise, fresh chives, and cracked black pepper in soft brioche.",
    image: "food_egg_mayo_sandwich.jpg"
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

  // ================= CAKE (10) =================
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
    name: "Pineapple Fresh Cream Pastry",
    category: "Cake",
    price: 187,
    description: "Puffy vanilla sponge layered with freshly whipped dairy cream and chunks of juicy sweet tropical pineapple.",
    image: "food_pineapple_pastry.jpg"
  },
  {
    name: "Black Forest Pastry",
    category: "Cake",
    price: 195,
    description: "Classic German chocolate sponge layered with fluffy whipped cream, sour dark cherries, and bittersweet chocolate shavings.",
    image: "food_black_forest_pastry.jpg"
  },
  {
    name: "Belgian Hazelnut Cake",
    category: "Cake",
    price: 244,
    description: "Intense dark chocolate sponge infused with roasted hazelnut praline paste and glossy dark chocolate glaze.",
    image: "food_hazelnut_cake.jpg"
  },
  {
    name: "Vegan Cake",
    category: "Cake",
    price: 254,
    description: "100% plant-based moist dark chocolate truffle cake made with almond milk and premium cocoa.",
    image: "food_18.png"
  },
  {
    name: "New York Cheesecake",
    category: "Cake",
    price: 289,
    description: "Dense, ultra-rich baked cream cheese cake on a golden buttery graham cracker crust with a light berry compote.",
    image: "food_cheesecake.jpg"
  },
  {
    name: "Red Velvet Cake",
    category: "Cake",
    price: 310,
    description: "Luxurious deep red sponge cake layered with silky cream cheese frosting and dusted with red velvet crumbs.",
    image: "food_red_velvet_cake.jpg"
  },
  {
    name: "Layered Chocolate Truffle Cake",
    category: "Cake",
    price: 335,
    description: "Decadent multi-layered artisan chocolate cake filled with smooth Belgian chocolate truffle ganache and piped rosettes.",
    image: "food_chocolate_truffle_cake.jpg"
  },
  {
    name: "Butterscotch Cake",
    category: "Cake",
    price: 349,
    description: "Rich butterscotch sponge layered with caramel glaze, crunchy caramelized cashew praline, and fluffy cream.",
    image: "food_19.png"
  },

  // ================= PURE VEG (10) =================
  {
    name: "Fried Cauliflower",
    category: "Pure Veg",
    price: 192,
    description: "Crispy golden battered cauliflower florets tossed with toasted sesame, ginger, garlic, and scallions.",
    image: "food_22.png"
  },
  {
    name: "Garlic Mushroom",
    category: "Pure Veg",
    price: 245,
    description: "Plump button mushrooms sautéed in garlic-herb butter, crushed black pepper, and fresh parsley.",
    image: "food_21.png"
  },
  {
    name: "Palak Paneer Desi Ghee",
    category: "Pure Veg",
    price: 255,
    description: "Fresh tender paneer cubes cooked in a vibrant green spinach puree tempered with garlic, cumin, and desi ghee.",
    image: "food_palak_paneer.jpg"
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
  {
    name: "Kadhai Paneer Special",
    category: "Pure Veg",
    price: 305,
    description: "Tender paneer cubes and crunchy bell peppers tossed in a robust crushed coriander and dry red chili kadhai masala gravy.",
    image: "food_kadhai_paneer.jpg"
  },
  {
    name: "Paneer Butter Masala",
    category: "Pure Veg",
    price: 315,
    description: "Succulent paneer cubes simmered in a velvety, rich tomato cashew gravy scented with kasuri methi and butter.",
    image: "food_paneer_butter_masala.jpg"
  },
  {
    name: "Dal Makhani & Naan",
    category: "Pure Veg",
    price: 329,
    description: "Slow-cooked black lentils overnight in butter and cream, served alongside hot, crispy tandoori butter naan.",
    image: "food_dal_makhani.jpg"
  },
  {
    name: "Malai Kofta Curry",
    category: "Pure Veg",
    price: 342,
    description: "Melt-in-mouth paneer and potato dumplings stuffed with dry fruits, simmered in a creamy golden cashew gravy.",
    image: "food_malai_kofta.jpg"
  },
  {
    name: "Deluxe Royal Veg Thali",
    category: "Pure Veg",
    price: 365,
    description: "Grand traditional Indian platter with Shahi Paneer, Dal Makhani, mixed seasonal veg, aromatic jeera rice, butter roti, and salad.",
    image: "food_veg_thali.jpg"
  },

  // ================= PASTA (10) =================
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
    name: "Aglio Olio Peperoncino",
    category: "Pasta",
    price: 257,
    description: "Classic Italian spaghetti tossed in extra virgin olive oil, sliced golden garlic cloves, chili flakes, and parsley.",
    image: "food_aglio_olio.jpg"
  },
  {
    name: "Penne Arrabbiata",
    category: "Pasta",
    price: 269,
    description: "Spicy Italian penne pasta tossed in fiery red chili tomato sauce, fragrant garlic, fresh basil, and parmesan.",
    image: "food_penne_arrabbiata.jpg"
  },
  {
    name: "White Sauce Alfredo Pasta",
    category: "Pasta",
    price: 281,
    description: "Tender penne pasta coated in velvety rich parmesan cream Alfredo sauce with sweet corn, broccoli, and black olives.",
    image: "food_alfredo_pasta.jpg"
  },
  {
    name: "Mac & Cheese Supreme",
    category: "Pasta",
    price: 291,
    description: "Comforting elbow macaroni baked in four-cheese sauce (cheddar, mozzarella, gouda, and parmesan) with a toasted breadcrumb crust.",
    image: "food_mac_and_cheese.jpg"
  },
  {
    name: "Peri Peri Cheesy Pasta",
    category: "Pasta",
    price: 308,
    description: "Spicy fusion pasta tossed in zesty peri-peri cheese sauce with sauteed bell peppers, sweet corn, and jalapeños.",
    image: "food_peri_peri_pasta.jpg"
  },
  {
    name: "Pesto Basil Penne",
    category: "Pasta",
    price: 322,
    description: "Al dente penne smothered in vibrant Genovese basil pesto, crushed pine nuts, garlic, parmesan, and extra virgin olive oil.",
    image: "food_pesto_pasta.jpg"
  },
  {
    name: "Chicken Pasta",
    category: "Pasta",
    price: 345,
    description: "Juicy herb-grilled chicken slices with tender pasta tossed in a velvety pink tomato-cream sauce.",
    image: "food_28.png"
  },

  // ================= NOODLES (10) =================
  {
    name: "Veg Hakka Noodles",
    category: "Noodles",
    price: 179,
    description: "Classic street-style wok-tossed noodles with shredded cabbage, capsicum, carrots, spring onions, and light soy sauce.",
    image: "food_hakka_noodles.jpg"
  },
  {
    name: "Veg Noodles",
    category: "Noodles",
    price: 184,
    description: "Street-style Hakka noodles stir-fried with crunchy cabbage, capsicum, carrots, and savory dark soy sauce.",
    image: "food_30.png"
  },
  {
    name: "Singapore Crispy Noodles",
    category: "Noodles",
    price: 191,
    description: "Thin vermicelli noodles wok-tossed with mild curry powder, crunchy bell peppers, bean sprouts, and sesame oil.",
    image: "food_singapore_noodles.jpg"
  },
  {
    name: "Chilli Garlic Noodles",
    category: "Noodles",
    price: 207,
    description: "Fiery wok-tossed noodles loaded with crushed garlic, bird eye chili, spring onions, and spicy Schezwan sauce.",
    image: "food_chilli_garlic_noodles.jpg"
  },
  {
    name: "Cooked Noodles",
    category: "Noodles",
    price: 212,
    description: "Classic Chinese wok-tossed noodles with farm vegetables, mild spices, and a touch of roasted sesame oil.",
    image: "food_32.png"
  },
  {
    name: "Schezwan Veg Noodles",
    category: "Noodles",
    price: 226,
    description: "Spicy wok-tossed noodles smothered in authentic Sichuan chili-garlic paste with crispy stir-fried vegetables.",
    image: "food_schezwan_noodles.jpg"
  },
  {
    name: "Butter Noodles",
    category: "Noodles",
    price: 240,
    description: "Silky egg noodles tossed in melted butter, mild garlic, fresh parsley, and cracked black pepper.",
    image: "food_29.png"
  },
  {
    name: "Pan Fried Spicy Noodles",
    category: "Noodles",
    price: 265,
    description: "Crispy pan-fried golden noodles base topped with a thick, savory chili garlic vegetable and mushroom gravy.",
    image: "food_pan_fried_noodles.jpg"
  },
  {
    name: "Somen Noodles",
    category: "Noodles",
    price: 279,
    description: "Delicate thin Japanese wheat noodles served in a savory seasoned broth with scallions and toasted sesame.",
    image: "food_31.png"
  },
  {
    name: "Thai Pad Noodles",
    category: "Noodles",
    price: 295,
    description: "Traditional Thai flat rice noodles stir-fried with bean sprouts, crushed peanuts, tamarind glaze, and fresh lime.",
    image: "food_pad_thai.jpg"
  },

  // ================= SOUTH INDIAN (10) =================
  {
    name: "Idli Sambar",
    category: "South Indian",
    price: 108,
    description: "Three soft, piping-hot steamed rice cakes served with authentic spiced vegetable lentil stew and coconut chutney.",
    image: "food_idli_sambar.jpg"
  },
  {
    name: "Medu Vada",
    category: "South Indian",
    price: 122,
    description: "Crispy golden lentil fritters spiced with peppercorns and curry leaves, served with fresh coconut chutney and sambar.",
    image: "food_medu_vada.jpg"
  },
  {
    name: "Vegetable Upma",
    category: "South Indian",
    price: 128,
    description: "Aromatic roasted semolina cooked with ghee, mustard seeds, curry leaves, ginger, and diced vegetables.",
    image: "food_veg_upma.jpg"
  },
  {
    name: "Plain Roast Dosa",
    category: "South Indian",
    price: 146,
    description: "Crisp golden crepe made from naturally fermented rice and lentil batter, served with 3 signature chutneys and sambar.",
    image: "food_plain_dosa.jpg"
  },
  {
    name: "Ghee Podi Dosa",
    category: "South Indian",
    price: 160,
    description: "Crispy golden dosa generously smeared with aromatic pure desi ghee and sprinkled with spicy gunpowder podi.",
    image: "food_podi_dosa.jpg"
  },
  {
    name: "Masala Dosa",
    category: "South Indian",
    price: 172,
    description: "Legendary crispy golden dosa folded over a flavorful spiced mustard-tempered potato masala filling.",
    image: "food_masala_dosa.jpg"
  },
  {
    name: "Onion Rava Dosa",
    category: "South Indian",
    price: 194,
    description: "Authentic thin net-textured crisp semolina crepe loaded with chopped onions, green chilies, cumin, and fresh cilantro.",
    image: "food_onion_rava_dosa.jpg"
  },
  {
    name: "Onion Tomato Uttapam",
    category: "South Indian",
    price: 202,
    description: "Authentic fluffy round savory rice-lentil pancake topped with sweet onions, juicy tomatoes, curry leaves, and green chillies.",
    image: "food_onion_tomato_uttapam.jpg"
  },
  {
    name: "Mysore Masala Dosa",
    category: "South Indian",
    price: 218,
    description: "Famous Bangalore-style crisp dosa smeared with fiery red garlic chili chutney and filled with potato mash.",
    image: "food_mysore_masala_dosa.jpg"
  },
  {
    name: "Paneer Cheese Dosa",
    category: "South Indian",
    price: 248,
    description: "Decadent crispy golden cone dosa stuffed with shredded paneer, melted mozzarella, bell peppers, and chatpata spices.",
    image: "food_paneer_cheese_dosa.jpg"
  },

  // ================= COFFEE (13) =================
  {
    name: "Espresso Shot",
    category: "Coffee",
    price: 105,
    description: "Intense, full-bodied single shot of dark-roasted Arabica coffee topped with a thick hazelnut-colored crema.",
    image: "food_espresso_shot.jpg"
  },
  {
    name: "South Indian Filter Coffee",
    category: "Coffee",
    price: 112,
    description: "Traditional frothy chicory-blended decoction coffee brewed with rich boiled milk in a classic brass dabarah.",
    image: "food_filter_coffee.jpg"
  },
  {
    name: "Iced Americano",
    category: "Coffee",
    price: 132,
    description: "Bold double shots of rich espresso poured over ice and cold filtered water for a clean, refreshing coffee experience.",
    image: "food_iced_americano.jpg"
  },
  {
    name: "Flat White",
    category: "Coffee",
    price: 138,
    description: "Expertly pulled double ristretto espresso blended with a micro-thin layer of steamed whole milk.",
    image: "food_flat_white.jpg"
  },
  {
    name: "Hot Cappuccino",
    category: "Coffee",
    price: 142,
    description: "Freshly brewed espresso topped with equal parts steamed milk and dense velvety foam, dusted with cocoa.",
    image: "food_hot_cappuccino.jpg"
  },
  {
    name: "Iced Cold Coffee",
    category: "Coffee",
    price: 170,
    description: "Chilled blended espresso with creamy sweetened milk and a scoop of vanilla ice cream, topped with cocoa powder.",
    image: "food_iced_cold_coffee.jpg"
  },
  {
    name: "Cold Brew On Rocks",
    category: "Coffee",
    price: 186,
    description: "Smooth 18-hour cold steeped single-origin coffee served over crystal ice cubes with zero bitterness.",
    image: "food_cold_brew.jpg"
  },
  {
    name: "Vanilla Iced Latte",
    category: "Coffee",
    price: 198,
    description: "Espresso poured over chilled milk, ice cubes, and premium Madagascar vanilla syrup.",
    image: "food_vanilla_iced_latte.jpg"
  },
  {
    name: "Cafe Mocha",
    category: "Coffee",
    price: 210,
    description: "Espresso combined with dark chocolate ganache, steamed milk, and crowned with freshly whipped cream.",
    image: "food_cafe_mocha.jpg"
  },
  {
    name: "Caramel Macchiato",
    category: "Coffee",
    price: 238,
    description: "Freshly steamed vanilla milk marked with bold espresso shots and crosshatched with golden caramel drizzle.",
    image: "food_caramel_macchiato.jpg"
  },
  {
    name: "Hazelnut Frappe",
    category: "Coffee",
    price: 262,
    description: "Blended coffee frappe infused with roasted hazelnut praline syrup, crushed ice, and chocolate chips.",
    image: "food_hazelnut_frappe.jpg"
  },
  {
    name: "Affogato Espresso",
    category: "Coffee",
    price: 272,
    description: "A scoop of premium vanilla bean gelato drowned in a piping hot shot of freshly pulled Italian espresso.",
    image: "food_affogato.jpg"
  },
  {
    name: "Classic Irish Coffee",
    category: "Coffee",
    price: 285,
    description: "Aromatic piping hot black coffee infused with Irish cream notes and layered with heavy chilled cream.",
    image: "food_irish_coffee.jpg"
  },

  // ================= SHAKES (10) =================
  {
    name: "Classic Vanilla Shake",
    category: "Shakes",
    price: 152,
    description: "Thick creamy old-school milkshake made with double vanilla bean ice cream and topped with fluffy whipped cream.",
    image: "food_vanilla_shake.jpg"
  },
  {
    name: "Strawberry Cream Shake",
    category: "Shakes",
    price: 185,
    description: "Luscious pink milkshake blended with ripe strawberries, cream, and topped with vibrant berry drizzle.",
    image: "food_strawberry_shake.jpg"
  },
  {
    name: "Banana Peanut Butter Shake",
    category: "Shakes",
    price: 204,
    description: "Powerhouse energizing shake with ripe Robusta bananas, crunchy roasted peanut butter, and honey.",
    image: "food_banana_pb_shake.jpg"
  },
  {
    name: "Butterscotch Caramel Shake",
    category: "Shakes",
    price: 222,
    description: "Rich butterscotch shake loaded with caramelized cashew crunchies and sweet golden caramel sauce.",
    image: "food_butterscotch_shake.jpg"
  },
  {
    name: "Alphonso Mango Shake",
    category: "Shakes",
    price: 235,
    description: "Vibrant golden shake prepared with pure Ratnagiri Alphonso mango pulp and rich malai ice cream.",
    image: "food_mango_shake.jpg"
  },
  {
    name: "Blueberry Bliss Shake",
    category: "Shakes",
    price: 252,
    description: "Gorgeous purple thickshake loaded with wild Canadian blueberries, Greek yogurt, and sweet berry compote.",
    image: "food_blueberry_shake.jpg"
  },
  {
    name: "KitKat Crunch Shake",
    category: "Shakes",
    price: 268,
    description: "Crunchy milkshake blended with crushed KitKat wafer bars, rich chocolate fudge, and whipped cream.",
    image: "food_kitkat_shake.jpg"
  },
  {
    name: "Oreo Thickshake",
    category: "Shakes",
    price: 274,
    description: "Ultra-thick dark chocolate shake packed with whole Oreo cookies, chocolate sauce, and cookie crumbs.",
    image: "food_oreo_shake.jpg"
  },
  {
    name: "Nutella Hazelnut Shake",
    category: "Shakes",
    price: 318,
    description: "Sinful shake packed with generous spoonfuls of Italian Nutella, roasted hazelnuts, and whipped topping.",
    image: "food_nutella_shake.jpg"
  },
  {
    name: "Belgian Chocolate Shake",
    category: "Shakes",
    price: 325,
    description: "Gourmet thickshake crafted with 70% pure Belgian dark chocolate, double cream, and chocolate flakes.",
    image: "food_belgian_chocolate_shake.jpg"
  },

  // ================= JUICE (10) =================
  {
    name: "Fresh Coconut Water",
    category: "Juice",
    price: 110,
    description: "100% natural, refreshing tender coconut water served chilled with tender coconut malai ribbons.",
    image: "food_coconut_water.jpg"
  },
  {
    name: "Watermelon Mint Juice",
    category: "Juice",
    price: 120,
    description: "Cold-pressed sweet red watermelon juice infused with fresh garden mint leaves and black salt.",
    image: "food_watermelon_juice.jpg"
  },
  {
    name: "Sweet Mosambi Juice",
    category: "Juice",
    price: 126,
    description: "Freshly squeezed Indian sweet lime juice seasoned with a hint of roasted cumin and rock salt.",
    image: "food_mosambi_juice.jpg"
  },
  {
    name: "Fresh Orange Juice",
    category: "Juice",
    price: 130,
    description: "Cold-pressed juicy Nagpur oranges packed with natural Vitamin C and invigorating citrus flavors.",
    image: "food_orange_juice.jpg"
  },
  {
    name: "Lemon Mint Refresher Juice",
    category: "Juice",
    price: 134,
    description: "Zesty lemon and crushed spearmint cooler sweetened with organic raw sugar and pink salt.",
    image: "food_lemon_mint_juice.jpg"
  },
  {
    name: "Pineapple Lime Juice",
    category: "Juice",
    price: 148,
    description: "Sun-ripened tropical pineapple juice touched with a squeeze of fresh lime for a tangy-sweet punch.",
    image: "food_pineapple_juice.jpg"
  },
  {
    name: "Alphonso Mango Juice",
    category: "Juice",
    price: 154,
    description: "Luscious chilled mango juice made from naturally sweetened handpicked Alphonso mangoes.",
    image: "food_mango_juice.jpg"
  },
  {
    name: "Apple Beetroot Carrot (ABC) Juice",
    category: "Juice",
    price: 168,
    description: "The ultimate detox blend of sweet Himalayan apples, earthy beetroot, and crunchy carrots.",
    image: "food_abc_juice.jpg"
  },
  {
    name: "Green Detox Kiwi Juice",
    category: "Juice",
    price: 176,
    description: "Nutrient-dense power juice with tart kiwi, green apple, cucumber, and fresh lemon juice.",
    image: "food_kiwi_green_juice.jpg"
  },
  {
    name: "Pomegranate Ruby Juice",
    category: "Juice",
    price: 188,
    description: "100% pure ruby red pomegranate juice packed with powerful natural antioxidants and sweetness.",
    image: "food_pomegranate_juice.jpg"
  }
];

async function seed() {
  console.log(`Checking price uniqueness for ${fullMenu.length} dishes...`);
  const prices = fullMenu.map(f => f.price);
  const priceSet = new Set(prices);

  if (priceSet.size !== fullMenu.length) {
    console.error("FATAL ERROR: Duplicate prices detected!");
    const count = {};
    prices.forEach(p => { count[p] = (count[p] || 0) + 1; });
    Object.keys(count).forEach(p => {
      if (count[p] > 1) {
        console.error(`Price ₹${p} is shared by:`, fullMenu.filter(f => f.price == p).map(f => f.name));
      }
    });
    process.exit(1);
  }

  const below100 = fullMenu.filter(f => f.price < 100);
  if (below100.length > 0) {
    console.error("FATAL ERROR: Prices below 100 detected!", below100);
    process.exit(1);
  }

  // Count items per category
  const catCount = {};
  fullMenu.forEach(item => {
    catCount[item.category] = (catCount[item.category] || 0) + 1;
  });
  console.log("Category counts:", catCount);
  const under10 = Object.keys(catCount).filter(c => catCount[c] < 10);
  if (under10.length > 0) {
    console.error("FATAL ERROR: Categories with less than 10 items:", under10);
    process.exit(1);
  }

  console.log(`✅ Validation Passed: All ${fullMenu.length} dishes have STRICTLY UNIQUE prices >= 100!`);
  console.log(`✅ Validation Passed: Every category has at least 10 items!`);
  console.log(`Min Price: ₹${Math.min(...prices)}, Max Price: ₹${Math.max(...prices)}`);

  // Realistic varied ratings (4.3 to 4.9) and review counts (110 to 760)
  const ratingsPattern = [4.8, 4.7, 4.9, 4.6, 4.5, 4.8, 4.4, 4.9, 4.7, 4.6, 4.8, 4.5, 4.9, 4.7, 4.3, 4.8];
  const reviewsPattern = [380, 520, 240, 690, 185, 430, 750, 290, 610, 150, 480, 310, 820, 260, 195, 540];

  const enrichedMenu = fullMenu.map((item, idx) => ({
    ...item,
    rating: item.rating || ratingsPattern[idx % ratingsPattern.length],
    reviewsCount: item.reviewsCount || reviewsPattern[idx % reviewsPattern.length]
  }));

  await connectDB();
  console.log("Connected to MongoDB. Resetting food collection...");

  await foodModel.deleteMany({});
  const inserted = await foodModel.insertMany(enrichedMenu);
  console.log(`Successfully seeded ${inserted.length} foods with DYNAMIC RATINGS into MongoDB Atlas!`);

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
