const fs = require("fs");
const path = require("path");

const classicItems = [
  // Salad (1-10)
  { _id: "1", name: "Greek salad", image: "food_1.png", category: "Salad", price: 180, description: "Traditional Mediterranean salad with plump Kalamata olives, juicy tomatoes, crisp cucumber, and crumbly Greek feta.", rating: 4.9, reviewsCount: 380 },
  { _id: "2", name: "Veg salad", image: "food_2.png", category: "Salad", price: 145, description: "Crispy garden-fresh cucumbers, ripe tomatoes, carrots, and sweet bell peppers drizzled with extra virgin lemon olive oil.", rating: 4.8, reviewsCount: 420 },
  { _id: "3", name: "Clover Salad", image: "food_3.png", category: "Salad", price: 166, description: "Tender clover sprouts, baby spinach, tossed walnuts, and feta cheese drizzled with honey balsamic dressing.", rating: 4.7, reviewsCount: 520 },
  { _id: "4", name: "Chicken Salad", image: "food_4.png", category: "Salad", price: 240, description: "Tender grilled herb chicken breast slices tossed with organic greens, sweet corn, and creamy honey mustard dressing.", rating: 4.6, reviewsCount: 290 },
  { _id: "5", name: "Sprouted Moong Protein Salad", image: "food_sprout_salad.jpg", category: "Salad", price: 175, description: "Nutritious organic sprouted moong beans tossed with chopped onions, tomatoes, green chilies, cilantro, and lemon juice.", rating: 4.9, reviewsCount: 240 },
  { _id: "6", name: "Quinoa Corn Fiesta Salad", image: "food_quinoa_salad.jpg", category: "Salad", price: 199, description: "Fluffy Peruvian quinoa, sweet yellow corn, black beans, diced bell peppers, and zesty lime coriander dressing.", rating: 4.6, reviewsCount: 690 },
  { _id: "7", name: "Caesar Salad", image: "food_caesar_salad.jpg", category: "Salad", price: 216, description: "Crisp romaine hearts, toasted garlic herb croutons, parmesan shavings, and creamy Italian Caesar dressing.", rating: 4.5, reviewsCount: 185 },
  { _id: "8", name: "Mediterranean Chickpea Salad", image: "food_chickpea_salad.jpg", category: "Salad", price: 225, description: "Wholesome boiled kabuli chana with diced English cucumbers, juicy cherry tomatoes, kalamata olives, and fresh herbs.", rating: 4.8, reviewsCount: 430 },
  { _id: "9", name: "Fresh Fruit Nutty Salad", image: "food_fruit_salad.jpg", category: "Salad", price: 242, description: "Chilled medley of sweet melons, crisp apples, juicy pomegranate arils, and toasted almonds with mint honey glaze.", rating: 4.4, reviewsCount: 750 },
  { _id: "10", name: "Rainbow Garden Avocado Salad", image: "food_rainbow_salad.jpg", category: "Salad", price: 275, description: "Vibrant garden bowl layered with ripe Hass avocado slices, crisp greens, beetroot, cherry tomatoes, and citrus vinaigrette.", rating: 4.7, reviewsCount: 610 },

  // Rolls (11-20)
  { _id: "11", name: "Lasagna Rolls", image: "food_5.png", category: "Rolls", price: 199, description: "Tender pasta sheet rolled with ricotta, parmesan, spinach, and Italian herb tomato marinara.", rating: 4.7, reviewsCount: 310 },
  { _id: "12", name: "Peri Peri Rolls", image: "food_6.png", category: "Rolls", price: 175, description: "Spicy zesty peri-peri seasoned vegetables rolled in flaky multi-grain paratha with mint mayo.", rating: 4.8, reviewsCount: 450 },
  { _id: "13", name: "Chicken Rolls", image: "food_7.png", category: "Rolls", price: 220, description: "Succulent smoked chicken tikka chunks rolled with pickled onions, bell peppers, and chipotle dip.", rating: 4.9, reviewsCount: 580 },
  { _id: "14", name: "Veg Rolls", image: "food_8.png", category: "Rolls", price: 149, description: "Classic street-style crunchy shredded cabbage, carrots, capsicum, and paneer roll with sweet chili sauce.", rating: 4.6, reviewsCount: 390 },
  { _id: "15", name: "Aloo Frankie Roll", image: "food_aloo_frankie.jpg", category: "Rolls", price: 129, description: "Iconic street-style spicy mashed potato frankie seasoned with special chaat masala, tangy onions, and green chili vinegar.", rating: 4.8, reviewsCount: 480 },
  { _id: "16", name: "Cheesy Corn Roll", image: "food_corn_cheese_roll.jpg", category: "Rolls", price: 169, description: "Sweet golden corn and melted mozzarella enveloped in a crisp wrap with creamy herb spread.", rating: 4.7, reviewsCount: 360 },
  { _id: "17", name: "Spring Rolls Crisp", image: "food_spring_rolls.jpg", category: "Rolls", price: 185, description: "Golden crispy fried rolls stuffed with glass noodles, cabbage, carrots, and sweet chili dip.", rating: 4.9, reviewsCount: 620 },
  { _id: "18", name: "Paneer Kathi Roll", image: "food_paneer_roll.jpg", category: "Rolls", price: 195, description: "Char-grilled spiced cottage cheese cubes wrapped in rumali roti with mint chutney and crunchy salad.", rating: 4.8, reviewsCount: 510 },
  { _id: "19", name: "Schezwan Paneer Roll", image: "food_schezwan_roll.jpg", category: "Rolls", price: 205, description: "Fiery Schezwan tossed paneer strips wrapped in butter toasted paratha with sesame garnish.", rating: 4.7, reviewsCount: 290 },
  { _id: "20", name: "Tandoori Mushroom Roll", image: "food_mushroom_roll.jpg", category: "Rolls", price: 199, description: "Earthy button mushrooms marinated in aromatic tandoori spices and rolled with mint garlic mayo.", rating: 4.6, reviewsCount: 330 },

  // Deserts (21-30)
  { _id: "21", name: "Ripple Ice Cream", image: "food_9.png", category: "Deserts", price: 120, description: "Creamy vanilla gelato swirled with rich raspberry syrup and dark chocolate fudge ripples.", rating: 4.8, reviewsCount: 620 },
  { _id: "22", name: "Fruit Ice Cream", image: "food_10.png", category: "Deserts", price: 135, description: "Velvety fresh cream ice cream loaded with real chunks of strawberries, kiwi, and tender mango.", rating: 4.7, reviewsCount: 480 },
  { _id: "23", name: "Jar Ice Cream", image: "food_11.png", category: "Deserts", price: 160, description: "Artisanal Belgian chocolate layered cake and gelato dessert packed in an elegant reusable glass jar.", rating: 4.9, reviewsCount: 710 },
  { _id: "24", name: "Vanilla Ice Cream", image: "food_12.png", category: "Deserts", price: 110, description: "Classic aromatic Bourbon Madagascar vanilla bean double-churned ice cream scoop.", rating: 4.7, reviewsCount: 540 },
  { _id: "25", name: "Gulab Jamun Warm", image: "food_gulab_jamun.jpg", category: "Deserts", price: 99, description: "Soft khoya dumplings deep fried and steeped in fragrant cardamom saffron sugar syrup.", rating: 4.9, reviewsCount: 890 },
  { _id: "26", name: "Rasmalai Royal", image: "food_rasmalai.jpg", category: "Deserts", price: 139, description: "Delicate chenna patties soaked in chilled thick saffron milk garnished with slivered pistachios.", rating: 4.9, reviewsCount: 780 },
  { _id: "27", name: "Chocolate Lava Cake", image: "food_choco_lava.jpg", category: "Deserts", price: 149, description: "Warm moist chocolate cake with a molten chocolate center that flows luxuriously at first bite.", rating: 4.8, reviewsCount: 670 },
  { _id: "28", name: "Sizzling Brownie", image: "food_chocolate_brownie.jpg", category: "Deserts", price: 165, description: "Decadent dark chocolate brownie served with hot chocolate fudge drizzle and crushed walnuts.", rating: 4.7, reviewsCount: 540 },
  { _id: "29", name: "Kulfi Falooda Sundae", image: "food_kulfi_falooda.jpg", category: "Deserts", price: 145, description: "Authentic kesar pista kulfi served with rose syrup, basil seeds, and slippery falooda sev.", rating: 4.8, reviewsCount: 410 },
  { _id: "30", name: "Mango Panna Cotta", image: "food_mango_panna_cotta.jpg", category: "Deserts", price: 155, description: "Silky smooth Italian sweet cream set pudding topped with fresh Alphonso mango coulis.", rating: 4.7, reviewsCount: 320 },

  // Sandwich (31-40)
  { _id: "31", name: "Chicken Sandwich", image: "food_13.png", category: "Sandwich", price: 195, description: "Herb roasted chicken breast, crisp lettuce, cheddar slice, and garlic aioli between toasted sourdough.", rating: 4.8, reviewsCount: 490 },
  { _id: "32", name: "Vegan Sandwich", image: "food_14.png", category: "Sandwich", price: 155, description: "Avocado mash, heirloom tomatoes, alfalfa sprouts, and dairy-free pesto on whole wheat multi-seed bread.", rating: 4.6, reviewsCount: 360 },
  { _id: "33", name: "Grilled Sandwich", image: "food_15.png", category: "Sandwich", price: 169, description: "Golden butter-toasted sandwich stuffed with spiced potatoes, green peppers, melted cheese, and green chutney.", rating: 4.8, reviewsCount: 680 },
  { _id: "34", name: "Bread Sandwich", image: "food_16.png", category: "Sandwich", price: 139, description: "Traditional Bombay triple-decker cucumber and butter sandwich sprinkled with special sandwich masala.", rating: 4.5, reviewsCount: 290 },
  { _id: "35", name: "Spinach Corn Toast", image: "food_spinach_corn_toast.jpg", category: "Sandwich", price: 149, description: "Creamy garlic sauteed spinach and sweet corn gratin on toasted artisanal sourdough.", rating: 4.7, reviewsCount: 420 },
  { _id: "36", name: "Corn & Cheese Grilled Sandwich", image: "food_corn_cheese_sandwich.jpg", category: "Sandwich", price: 165, description: "Loaded with sweet American corn and gooey melted mozzarella between buttered grill-marked bread.", rating: 4.8, reviewsCount: 560 },
  { _id: "37", name: "Mexican Jalapeno Cheese Sandwich", image: "food_jalapeno_sandwich.jpg", category: "Sandwich", price: 175, description: "Zesty Mexican salsa, pickled jalapenos, black beans, and Monterey Jack cheese pressed to crisp perfection.", rating: 4.6, reviewsCount: 310 },
  { _id: "38", name: "Bombay Veg Club Sandwich", image: "food_veg_club_sandwich.jpg", category: "Sandwich", price: 185, description: "Three-tiered street delight packed with beetroot, boiled potato, cucumber, tomato, cheese, and spicy mint dip.", rating: 4.9, reviewsCount: 840 },
  { _id: "39", name: "Paneer Tikka Sandwich", image: "food_paneer_sandwich.jpg", category: "Sandwich", price: 189, description: "Tandoori marinated cottage cheese slabs layered with mint chutney and crunchy capsicum.", rating: 4.8, reviewsCount: 610 },
  { _id: "40", name: "Classic Egg Mayo Sandwich", image: "food_egg_mayo_sandwich.jpg", category: "Sandwich", price: 169, description: "Fluffy hard-boiled eggs mashed with Dijon mustard, Japanese mayo, and cracked black pepper.", rating: 4.7, reviewsCount: 390 },

  // Cake (41-50)
  { _id: "41", name: "Cup Cake", image: "food_17.png", category: "Cake", price: 99, description: "Moist red velvet cupcake topped with silky swirls of Philadelphia cream cheese frosting and gold pearls.", rating: 4.9, reviewsCount: 820 },
  { _id: "42", name: "Vegan Cake", image: "food_18.png", category: "Cake", price: 185, description: "Rich plant-based dark chocolate sponge layered with organic coconut ganache and roasted almonds.", rating: 4.7, reviewsCount: 340 },
  { _id: "43", name: "Butterscotch Cake", image: "food_19.png", category: "Cake", price: 199, description: "Fluffy vanilla sponge smothered with caramel butterscotch mousse, crunchy praline nuggets, and drizzle.", rating: 4.8, reviewsCount: 590 },
  { _id: "44", name: "Sliced Cake", image: "food_20.png", category: "Cake", price: 140, description: "Traditional British tea-time loaf slice infused with golden candied citrus peel, raisins, and aromatic spices.", rating: 4.6, reviewsCount: 270 },
  { _id: "45", name: "Pineapple Fresh Cream Pastry", image: "food_pineapple_pastry.jpg", category: "Cake", price: 110, description: "Light airy sponge cake layered with sweet crushed pineapple chunks and freshly whipped dairy cream.", rating: 4.8, reviewsCount: 460 },
  { _id: "46", name: "Black Forest Pastry", image: "food_black_forest_pastry.jpg", category: "Cake", price: 125, description: "German classic chocolate sponge infused with cherry liqueur syrup, sour cherries, and chocolate shavings.", rating: 4.9, reviewsCount: 630 },
  { _id: "47", name: "Belgian Hazelnut Cake", image: "food_hazelnut_cake.jpg", category: "Cake", price: 219, description: "Nutty roasted hazelnut gianduja mousse on a crunchy feuilletine base coated in chocolate mirror glaze.", rating: 4.9, reviewsCount: 710 },
  { _id: "48", name: "New York Cheesecake", image: "food_cheesecake.jpg", category: "Cake", price: 235, description: "Dense, ultra-creamy baked cream cheese filling resting on a sweet cinnamon graham cracker crust.", rating: 4.9, reviewsCount: 870 },
  { _id: "49", name: "Red Velvet Cake", image: "food_red_velvet_cake.jpg", category: "Cake", price: 199, description: "Velvety crimson cocoa sponge layered with tangy Madagascar vanilla cream cheese frosting.", rating: 4.8, reviewsCount: 520 },
  { _id: "50", name: "Layered Chocolate Truffle Cake", image: "food_chocolate_truffle_cake.jpg", category: "Cake", price: 220, description: "Decadent Dutch chocolate sponge saturated with 70% dark chocolate ganache and chocolate curls.", rating: 4.9, reviewsCount: 940 },

  // Pure Veg (51-60)
  { _id: "51", name: "Garlic Mushroom", image: "food_21.png", category: "Pure Veg", price: 210, description: "Fresh button mushrooms tossed in butter, burnt garlic flakes, cracked pepper, and Italian parsley.", rating: 4.8, reviewsCount: 430 },
  { _id: "52", name: "Fried Cauliflower", image: "food_22.png", category: "Pure Veg", price: 185, description: "Crispy battered cauliflower florets tossed in sweet and tangy chili garlic glaze with spring onions.", rating: 4.7, reviewsCount: 510 },
  { _id: "53", name: "Mix Veg Pulao", image: "food_23.png", category: "Pure Veg", price: 220, description: "Fragrant long-grain aged basmati rice cooked with whole spices, carrots, green peas, and paneer cubes.", rating: 4.8, reviewsCount: 670 },
  { _id: "54", name: "Rice Zucchini", image: "food_24.png", category: "Pure Veg", price: 235, description: "Herb infused Italian arborio rice risotto simmered with tender green zucchini ribbons and parmesan.", rating: 4.7, reviewsCount: 310 },
  { _id: "55", name: "Palak Paneer Desi Ghee", image: "food_palak_paneer.jpg", category: "Pure Veg", price: 245, description: "Fresh cottage cheese cubes cooked in a smooth, mildly spiced organic spinach puree tempered with garlic and cumin.", rating: 4.8, reviewsCount: 520 },
  { _id: "56", name: "Paneer Tikka", image: "food_paneer_tikka.jpg", category: "Pure Veg", price: 260, description: "Cubes of malai paneer, bell peppers, and red onions marinated in curd and tandoori spices, char-grilled.", rating: 4.9, reviewsCount: 780 },
  { _id: "57", name: "Kadhai Paneer Special", image: "food_kadhai_paneer.jpg", category: "Pure Veg", price: 255, description: "Cottage cheese simmered in spicy onion-tomato gravy with freshly ground coriander seeds and crunchy bell peppers.", rating: 4.8, reviewsCount: 610 },
  { _id: "58", name: "Paneer Butter Masala", image: "food_paneer_butter_masala.jpg", category: "Pure Veg", price: 270, description: "Rich, velvety tomato and cashew nut makhani gravy infused with kasuri methi and finished with white butter.", rating: 4.9, reviewsCount: 890 },
  { _id: "59", name: "Dal Makhani & Naan", image: "food_dal_makhani.jpg", category: "Pure Veg", price: 230, description: "Slow-cooked black lentils and kidney beans simmered overnight on tandoor with fresh cream and butter.", rating: 4.9, reviewsCount: 920 },
  { _id: "60", name: "Deluxe Royal Veg Thali", image: "food_veg_thali.jpg", category: "Pure Veg", price: 299, description: "Complete feast with Dal Makhani, Shahi Paneer, Mix Veg, Pulao, 2 Butter Naan, Raita, and Gulab Jamun.", rating: 4.9, reviewsCount: 1100 },

  // Pasta (61-70)
  { _id: "61", name: "Cheese Pasta", image: "food_25.png", category: "Pasta", price: 210, description: "Gooey four-cheese macaroni pasta baked to bubbly golden perfection with an herb panko crust.", rating: 4.9, reviewsCount: 780 },
  { _id: "62", name: "Tomato Pasta", image: "food_26.png", category: "Pasta", price: 195, description: "Penne tossed in slow-simmered San Marzano plum tomato pomodoro sauce with torn fresh sweet basil.", rating: 4.7, reviewsCount: 460 },
  { _id: "63", name: "Creamy Pasta", image: "food_27.png", category: "Pasta", price: 225, description: "Silky fettuccine enrobed in garlic parmesan cream sauce with sauteed broccoli and sweet bell peppers.", rating: 4.8, reviewsCount: 610 },
  { _id: "64", name: "Chicken Pasta", image: "food_28.png", category: "Pasta", price: 260, description: "Tender rosemary grilled chicken tossed with fusilli in rich pink Aurora sauce and black olives.", rating: 4.9, reviewsCount: 530 },
  { _id: "65", name: "Aglio Olio Peperoncino", image: "food_aglio_olio.jpg", category: "Pasta", price: 220, description: "Classic spaghetti tossed in extra virgin olive oil, toasted garlic slivers, red pepper flakes, and parsley.", rating: 4.7, reviewsCount: 380 },
  { _id: "66", name: "Penne Arrabbiata", image: "food_penne_arrabbiata.jpg", category: "Pasta", price: 215, description: "Al dente penne in fiery spicy garlic tomato sauce with black olives and fresh parmesan shavings.", rating: 4.8, reviewsCount: 490 },
  { _id: "67", name: "White Sauce Alfredo Pasta", image: "food_alfredo_pasta.jpg", category: "Pasta", price: 235, description: "Penne coated in rich, velvety butter parmesan cream sauce with sauteed button mushrooms.", rating: 4.9, reviewsCount: 720 },
  { _id: "68", name: "Mac & Cheese Supreme", image: "food_mac_and_cheese.jpg", category: "Pasta", price: 225, description: "Elbow macaroni enveloped in sharp yellow cheddar and gruyere sauce with crispy golden breadcrumbs.", rating: 4.8, reviewsCount: 610 },
  { _id: "69", name: "Peri Peri Cheesy Pasta", image: "food_peri_peri_pasta.jpg", category: "Pasta", price: 240, description: "Fusilli pasta tossed in creamy spicy African peri-peri cheese sauce with crunchy bell peppers.", rating: 4.7, reviewsCount: 340 },
  { _id: "70", name: "Pesto Basil Penne", image: "food_pesto_pasta.jpg", category: "Pasta", price: 250, description: "Penne tossed in freshly pounded Genoa sweet basil, pine nut, parmesan, and extra virgin olive oil pesto.", rating: 4.9, reviewsCount: 580 },

  // Noodles (71-80)
  { _id: "71", name: "Butter Noodles", image: "food_29.png", category: "Noodles", price: 165, description: "Delicate egg noodles tossed in melted French butter, fresh cracked sea salt, and toasted garlic chives.", rating: 4.6, reviewsCount: 340 },
  { _id: "72", name: "Veg Noodles", image: "food_30.png", category: "Noodles", price: 175, description: "Wok-tossed noodles with julienned cabbage, capsicum, carrots, and scallions in light soy dressing.", rating: 4.8, reviewsCount: 720 },
  { _id: "73", name: "Somen Noodles", image: "food_31.png", category: "Noodles", price: 195, description: "Delicate Japanese wheat noodles served chilled or warm with fragrant tsuyu broth and sesame garnish.", rating: 4.7, reviewsCount: 290 },
  { _id: "74", name: "Cooked Noodles", image: "food_32.png", category: "Noodles", price: 180, description: "Steaming hot street-style stir-fried hakka noodles with crunchy vegetables and spicy schezwan splash.", rating: 4.8, reviewsCount: 550 },
  { _id: "75", name: "Veg Hakka Noodles", image: "food_hakka_noodles.jpg", category: "Noodles", price: 185, description: "Classic Chinese wok-tossed long wheat noodles with cabbage, carrots, capsicum, and spring onions.", rating: 4.9, reviewsCount: 840 },
  { _id: "76", name: "Singapore Crispy Noodles", image: "food_singapore_noodles.jpg", category: "Noodles", price: 210, description: "Crisp golden fried noodles topped with sweet and sour exotic vegetable gravy and baby corn.", rating: 4.7, reviewsCount: 420 },
  { _id: "77", name: "Chilli Garlic Noodles", image: "food_chilli_garlic_noodles.jpg", category: "Noodles", price: 195, description: "Fiery wok-tossed spicy noodles loaded with charred crushed garlic cloves and red chili oil paste.", rating: 4.8, reviewsCount: 660 },
  { _id: "78", name: "Schezwan Veg Noodles", image: "food_schezwan_noodles.jpg", category: "Noodles", price: 200, description: "Spicy noodles tossed in authentic in-house fermented Schezwan pepper sauce with crunchy celery.", rating: 4.8, reviewsCount: 590 },
  { _id: "79", name: "Pan Fried Spicy Noodles", image: "food_pan_fried_noodles.jpg", category: "Noodles", price: 215, description: "Pan-crisped noodle nest crowned with hot Hunan vegetable stir-fry and toasted sesame seeds.", rating: 4.7, reviewsCount: 310 },
  { _id: "80", name: "Thai Pad Noodles", image: "food_pad_thai.jpg", category: "Noodles", price: 235, description: "Broad flat rice noodles stir-fried with tofu, bean sprouts, tamarind sauce, and crushed peanuts.", rating: 4.9, reviewsCount: 750 },

  // South Indian (81-90)
  { _id: "81", name: "Idli Sambar", image: "food_idli_sambar.jpg", category: "South Indian", price: 120, description: "Steaming soft and fluffy fermented rice cakes served with aromatic drumstick sambar and fresh coconut chutney.", rating: 4.9, reviewsCount: 920 },
  { _id: "82", name: "Medu Vada", image: "food_medu_vada.jpg", category: "South Indian", price: 130, description: "Golden crispy fried lentil fritters spiced with peppercorns, curry leaves, and ginger.", rating: 4.8, reviewsCount: 680 },
  { _id: "83", name: "Vegetable Upma", image: "food_veg_upma.jpg", category: "South Indian", price: 110, description: "Wholesome roasted semolina cooked with mustard seeds, curry leaves, ginger, cashews, and garden vegetables.", rating: 4.6, reviewsCount: 340 },
  { _id: "84", name: "Plain Roast Dosa", image: "food_plain_dosa.jpg", category: "South Indian", price: 140, description: "Paper-thin, golden, crisp crepe made from fermented rice and lentil batter served with trio of chutneys.", rating: 4.8, reviewsCount: 510 },
  { _id: "85", name: "Ghee Podi Dosa", image: "food_podi_dosa.jpg", category: "South Indian", price: 165, description: "Crispy dosa smeared generously with pure desi ghee and aromatic spicy gunpowder lentil podi.", rating: 4.9, reviewsCount: 840 },
  { _id: "86", name: "Masala Dosa", image: "food_masala_dosa.jpg", category: "South Indian", price: 160, description: "Iconic crisp golden dosa folded over aromatic turmeric spiced mashed potato and onion filling.", rating: 4.9, reviewsCount: 1150 },
  { _id: "87", name: "Onion Rava Dosa", image: "food_onion_rava_dosa.jpg", category: "South Indian", price: 170, description: "Crispy lace-patterned semolina and rice crepe studded with cumin, finely chopped onions, and green chilies.", rating: 4.7, reviewsCount: 460 },
  { _id: "88", name: "Onion Tomato Uttapam", image: "food_onion_tomato_uttapam.jpg", category: "South Indian", price: 175, description: "Thick, soft savory pancake topped with caramelized red onions, juicy diced tomatoes, and fresh cilantro.", rating: 4.8, reviewsCount: 580 },
  { _id: "89", name: "Mysore Masala Dosa", image: "food_mysore_masala_dosa.jpg", category: "South Indian", price: 180, description: "Crispy dosa with internal spicy red garlic chutney lining and traditional spiced potato stuffing.", rating: 4.9, reviewsCount: 890 },
  { _id: "90", name: "Paneer Cheese Dosa", image: "food_paneer_cheese_dosa.jpg", category: "South Indian", price: 195, description: "Fusion favorite stuffed with spiced grated paneer and melted mozzarella cheese.", rating: 4.8, reviewsCount: 620 },

  // Coffee (91-103)
  { _id: "91", name: "Espresso Shot", image: "food_espresso_shot.jpg", category: "Coffee", price: 110, description: "Intense, concentrated 30ml double shot of dark roasted Arabica coffee with thick golden crema.", rating: 4.7, reviewsCount: 310 },
  { _id: "92", name: "South Indian Filter Coffee", image: "food_filter_coffee.jpg", category: "Coffee", price: 90, description: "Traditional chicory-infused decoction brewed with frothy boiling milk served in brass davara tumbler.", rating: 4.9, reviewsCount: 1420 },
  { _id: "93", name: "Iced Americano", image: "food_iced_americano.jpg", category: "Coffee", price: 130, description: "Bold double espresso poured over chilled mineral water and crystalline ice cubes.", rating: 4.6, reviewsCount: 280 },
  { _id: "94", name: "Flat White", image: "food_flat_white.jpg", category: "Coffee", price: 160, description: "Velvety micro-foamed steamed milk poured over a rich ristretto espresso shot.", rating: 4.8, reviewsCount: 410 },
  { _id: "95", name: "Hot Cappuccino", image: "food_hot_cappuccino.jpg", category: "Coffee", price: 150, description: "Balanced espresso with equal parts steamed milk and dense creamy foam dusted with cocoa powder.", rating: 4.9, reviewsCount: 980 },
  { _id: "96", name: "Iced Cold Coffee", image: "food_iced_cold_coffee.jpg", category: "Coffee", price: 165, description: "Creamy classic blended cold coffee with chilled milk, sugar, espresso, and vanilla ice cream scoop.", rating: 4.9, reviewsCount: 1250 },
  { _id: "97", name: "Cold Brew On Rocks", image: "food_cold_brew.jpg", category: "Coffee", price: 175, description: "18-hour slow cold-steeped coarse ground Arabica coffee with natural chocolate and caramel notes.", rating: 4.8, reviewsCount: 520 },
  { _id: "98", name: "Vanilla Iced Latte", image: "food_vanilla_iced_latte.jpg", category: "Coffee", price: 175, description: "Espresso and chilled milk flavored with pure French vanilla syrup served over ice.", rating: 4.7, reviewsCount: 390 },
  { _id: "99", name: "Cafe Mocha", image: "food_cafe_mocha.jpg", category: "Coffee", price: 180, description: "Espresso combined with bittersweet Dutch cocoa, steamed milk, and whipped cream swirl.", rating: 4.8, reviewsCount: 640 },
  { _id: "100", name: "Caramel Macchiato", image: "food_caramel_macchiato.jpg", category: "Coffee", price: 190, description: "Steamed vanilla milk marked with bold espresso and crosshatched with rich buttery caramel sauce.", rating: 4.9, reviewsCount: 870 },
  { _id: "101", name: "Hazelnut Frappe", image: "food_hazelnut_frappe.jpg", category: "Coffee", price: 195, description: "Blended ice frappe flavored with roasted hazelnut praline syrup and whipped cream topping.", rating: 4.8, reviewsCount: 560 },
  { _id: "102", name: "Affogato Espresso", image: "food_affogato.jpg", category: "Coffee", price: 170, description: "Hot freshly extracted espresso shot poured directly over a cold scoop of artisanal vanilla bean gelato.", rating: 4.9, reviewsCount: 430 },
  { _id: "103", name: "Classic Irish Coffee", image: "food_irish_coffee.jpg", category: "Coffee", price: 210, description: "Hot brewed dark roast coffee with brown sugar and Irish cream essence topped with thick heavy cream.", rating: 4.7, reviewsCount: 310 },

  // Shakes (104-113)
  { _id: "104", name: "Classic Vanilla Shake", image: "food_vanilla_shake.jpg", category: "Shakes", price: 150, description: "Thick creamy shake blended with double scoops of Madagascar vanilla ice cream and whole milk.", rating: 4.7, reviewsCount: 420 },
  { _id: "105", name: "Strawberry Cream Shake", image: "food_strawberry_shake.jpg", category: "Shakes", price: 165, description: "Fresh strawberry puree churned with strawberry ice cream and topped with strawberry drizzle.", rating: 4.8, reviewsCount: 650 },
  { _id: "106", name: "Banana Peanut Butter Shake", image: "food_banana_pb_shake.jpg", category: "Shakes", price: 175, description: "Ripe bananas blended with creamy organic peanut butter, honey, and chia seeds for a high-protein boost.", rating: 4.8, reviewsCount: 480 },
  { _id: "107", name: "Butterscotch Caramel Shake", image: "food_butterscotch_shake.jpg", category: "Shakes", price: 170, description: "Butterscotch ice cream blended with golden butterscotch crunchies and salty caramel sauce.", rating: 4.7, reviewsCount: 390 },
  { _id: "108", name: "Alphonso Mango Shake", image: "food_mango_shake.jpg", category: "Shakes", price: 180, description: "Seasonal specialty made with 100% Ratnagiri Alphonso mango pulp and vanilla ice cream.", rating: 4.9, reviewsCount: 940 },
  { _id: "109", name: "Blueberry Bliss Shake", image: "food_blueberry_shake.jpg", category: "Shakes", price: 195, description: "Wild Canadian blueberries blended with Greek yogurt, ice cream, and blueberry compote.", rating: 4.8, reviewsCount: 520 },
  { _id: "110", name: "KitKat Crunch Shake", image: "food_kitkat_shake.jpg", category: "Shakes", price: 185, description: "Crisp KitKat chocolate wafer bars crushed and blended into rich chocolate milkshake with waffle stick.", rating: 4.9, reviewsCount: 1120 },
  { _id: "111", name: "Oreo Thickshake", image: "food_oreo_shake.jpg", category: "Shakes", price: 180, description: "Crunchy Oreo cookies blended with chocolate ice cream and topped with cookie crumbs.", rating: 4.9, reviewsCount: 1280 },
  { _id: "112", name: "Nutella Hazelnut Shake", image: "food_nutella_shake.jpg", category: "Shakes", price: 210, description: "Generous swirl of Italian Nutella spread blended with chocolate ice cream and roasted hazelnuts.", rating: 4.9, reviewsCount: 1350 },
  { _id: "113", name: "Belgian Chocolate Shake", image: "food_belgian_chocolate_shake.jpg", category: "Shakes", price: 199, description: "Intense 70% dark Belgian cocoa blended into an ultra-thick ganache shake for pure chocoholics.", rating: 4.9, reviewsCount: 860 },

  // Juice (114-123)
  { _id: "114", name: "Fresh Coconut Water", image: "food_coconut_water.jpg", category: "Juice", price: 90, description: "Naturally electrolyte-rich tender coconut water served chilled and fresh from the shell.", rating: 4.9, reviewsCount: 780 },
  { _id: "115", name: "Watermelon Mint Juice", image: "food_watermelon_juice.jpg", category: "Juice", price: 110, description: "Fresh cold-pressed sweet watermelon juice with a hint of garden mint and black salt.", rating: 4.8, reviewsCount: 650 },
  { _id: "116", name: "Sweet Mosambi Juice", image: "food_mosambi_juice.jpg", category: "Juice", price: 120, description: "Pure sweet lime juice freshly squeezed without added water or artificial sugar.", rating: 4.7, reviewsCount: 490 },
  { _id: "117", name: "Fresh Orange Juice", image: "food_orange_juice.jpg", category: "Juice", price: 130, description: "Pulpy Nagpur orange juice packed with natural Vitamin C, cold-pressed to preserve nutrition.", rating: 4.8, reviewsCount: 710 },
  { _id: "118", name: "Lemon Mint Refresher Juice", image: "food_lemon_mint_juice.jpg", category: "Juice", price: 80, description: "Tangy Indian shikanji with fresh lemon, crushed mint leaves, roasted cumin, and black salt.", rating: 4.8, reviewsCount: 540 },
  { _id: "119", name: "Pineapple Lime Juice", image: "food_pineapple_juice.jpg", category: "Juice", price: 125, description: "Tropical sweet and tart pineapple juice with a squeeze of fresh key lime.", rating: 4.7, reviewsCount: 380 },
  { _id: "120", name: "Alphonso Mango Juice", image: "food_mango_juice.jpg", category: "Juice", price: 140, description: "Thick luscious nectar extracted from naturally ripened Alphonso mangoes.", rating: 4.9, reviewsCount: 820 },
  { _id: "121", name: "Apple Beetroot Carrot (ABC) Juice", image: "food_abc_juice.jpg", category: "Juice", price: 145, description: "The ultimate miracle detox juice: crunchy apples, sweet beetroot, and fresh carrots.", rating: 4.8, reviewsCount: 610 },
  { _id: "122", name: "Green Detox Kiwi Juice", image: "food_kiwi_green_juice.jpg", category: "Juice", price: 155, description: "Nutrient powerhouse with tangy kiwi, green apple, cucumber, spinach, and lemon.", rating: 4.7, reviewsCount: 390 },
  { _id: "123", name: "Pomegranate Ruby Juice", image: "food_pomegranate_juice.jpg", category: "Juice", price: 188, description: "100% pure ruby red pomegranate juice packed with powerful natural antioxidants and sweetness.", rating: 4.8, reviewsCount: 480 }
];

const targetPath = path.join(__dirname, "../../Frontend/src/assets/assets.js");
const originalContent = fs.readFileSync(targetPath, "utf8");

const marker = "export const food_list = [";
const idx = originalContent.indexOf(marker);
if (idx === -1) {
  console.error("Marker not found in assets.js");
  process.exit(1);
}

const prefix = originalContent.substring(0, idx + marker.length);
const formattedList = classicItems.map(item => `
    {
        _id: "${item._id}",
        name: "${item.name}",
        image: "${item.image}",
        price: ${item.price},
        description: ${JSON.stringify(item.description)},
        category: "${item.category}",
        rating: ${item.rating},
        reviewsCount: ${item.reviewsCount}
    }`).join(",");

const finalContent = prefix + formattedList + "\n];\n";
fs.writeFileSync(targetPath, finalContent, "utf8");
console.log("Successfully aligned assets.js with 123 items in perfect order!");
