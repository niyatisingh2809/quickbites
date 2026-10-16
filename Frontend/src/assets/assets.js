import basket_icon from './basket_icon.png'
import logo from './logo.png'
import header_img from './header_img.png'
import search_icon from './search_icon.png'
import menu_1 from './menu_1.png'
import menu_2 from './menu_2.png'
import menu_3 from './menu_3.png'
import menu_4 from './menu_4.png'
import menu_5 from './menu_5.png'
import menu_6 from './menu_6.png'
import menu_7 from './menu_7.png'
import menu_8 from './menu_8.png'
import menu_coffee from './food_coffee_latte.jpg'
import menu_shakes from './food_chocolate_shake.jpg'
import menu_juice from './food_fresh_juice.jpg'
import menu_south_indian from './food_masala_dosa.jpg'
const menu_chaap = "https://upload.wikimedia.org/wikipedia/commons/6/6c/Tandoori_platter.jpg"
const menu_continental = "https://upload.wikimedia.org/wikipedia/commons/c/c1/Garlic_bread_baguettes_2.jpg"
const menu_italian = "https://upload.wikimedia.org/wikipedia/commons/d/d4/Margherita_Originale.JPG"
const menu_biryani = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/960px-%22Hyderabadi_Dum_Biryani%22.jpg"
const menu_street_food = "https://upload.wikimedia.org/wikipedia/commons/9/9c/Chhole_Bhature_served_in_North_India.jpg"
const menu_non_veg = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/960px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg"

import food_1 from './food_1.png'
import food_2 from './food_2.png'
import food_3 from './food_3.png'
import food_4 from './food_4.png'
import food_5 from './food_5.png'
import food_6 from './food_6.png'
import food_7 from './food_7.png'
import food_8 from './food_8.png'
import food_9 from './food_9.png'
import food_10 from './food_10.png'
import food_11 from './food_11.png'
import food_12 from './food_12.png'
import food_13 from './food_13.png'
import food_14 from './food_14.png'
import food_15 from './food_15.png'
import food_16 from './food_16.png'
import food_17 from './food_17.png'
import food_18 from './food_18.png'
import food_19 from './food_19.png'
import food_20 from './food_20.png'
import food_21 from './food_21.png'
import food_22 from './food_22.png'
import food_23 from './food_23.png'
import food_24 from './food_24.png'
import food_25 from './food_25.png'
import food_26 from './food_26.png'
import food_27 from './food_27.png'
import food_28 from './food_28.png'
import food_29 from './food_29.png'
import food_30 from './food_30.png'
import food_31 from './food_31.png'
import food_32 from './food_32.png'

import add_icon_white from './add_icon_white.png'
import add_icon_green from './add_icon_green.png'
import remove_icon_red from './remove_icon_red.png'
import app_store from './app_store.png'
import play_store from './play_store.png'
import linkedin_icon from './linkedin_icon.png'
import facebook_icon from './facebook_icon.png'
import twitter_icon from './twitter_icon.png'
import cross_icon from './cross_icon.png'
import selector_icon from './selector_icon.png'
import rating_starts from './rating_starts.png'
import profile_icon from './profile_icon.png'
import bag_icon from './bag_icon.png'
import logout_icon from './logout_icon.png'
import parcel_icon from './parcel_icon.png'

export const assets = {
    logo,
    basket_icon,
    header_img,
    search_icon,
    rating_starts,
    add_icon_green,
    add_icon_white,
    remove_icon_red,
    app_store,
    play_store,
    linkedin_icon,
    facebook_icon,
    twitter_icon,
    cross_icon,
    selector_icon,
    profile_icon,
    logout_icon,
    bag_icon,
    parcel_icon
}

export const menu_list = [
    {
        menu_name: "Salad",
        menu_image: menu_1
    },
    {
        menu_name: "Rolls",
        menu_image: menu_2
    },
    {
        menu_name: "Deserts",
        menu_image: menu_3
    },
    {
        menu_name: "Sandwich",
        menu_image: menu_4
    },
    {
        menu_name: "Cake",
        menu_image: menu_5
    },
    {
        menu_name: "Pure Veg",
        menu_image: menu_6
    },
    {
        menu_name: "Pasta",
        menu_image: menu_7
    },
    {
        menu_name: "Noodles",
        menu_image: menu_8
    },
    {
        menu_name: "South Indian",
        menu_image: menu_south_indian
    },
    {
        menu_name: "Coffee",
        menu_image: menu_coffee
    },
    {
        menu_name: "Shakes",
        menu_image: menu_shakes
    },
    {
        menu_name: "Juice",
        menu_image: menu_juice
    },
    {
        menu_name: "Chaap",
        menu_image: menu_chaap
    },
    {
        menu_name: "Continental",
        menu_image: menu_continental
    },
    {
        menu_name: "Italian",
        menu_image: menu_italian
    },
    {
        menu_name: "Biryani",
        menu_image: menu_biryani
    },
    {
        menu_name: "Street Food",
        menu_image: menu_street_food
    },
    {
        menu_name: "Non-Veg Specials",
        menu_image: menu_non_veg
    }]

export const food_list = [
    {
        _id: "1",
        name: "Greek salad",
        image: "food_1.png",
        price: 180,
        description: "Traditional Mediterranean salad with plump Kalamata olives, juicy tomatoes, crisp cucumber, and crumbly Greek feta.",
        category: "Salad",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 380
    },
    {
        _id: "2",
        name: "Veg salad",
        image: "food_2.png",
        price: 145,
        description: "Crispy garden-fresh cucumbers, ripe tomatoes, carrots, and sweet bell peppers drizzled with extra virgin lemon olive oil.",
        category: "Salad",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 420
    },
    {
        _id: "3",
        name: "Clover Salad",
        image: "food_3.png",
        price: 166,
        description: "Tender clover sprouts, baby spinach, tossed walnuts, and feta cheese drizzled with honey balsamic dressing.",
        category: "Salad",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 520
    },
    {
        _id: "4",
        name: "Chicken Salad",
        image: "food_4.png",
        price: 240,
        description: "Tender grilled herb chicken breast slices tossed with organic greens, sweet corn, and creamy honey mustard dressing.",
        category: "Salad",
        isVeg: false,
        rating: 4.6,
        reviewsCount: 290
    },
    {
        _id: "5",
        name: "Sprouted Moong Protein Salad",
        image: "food_sprout_salad.jpg",
        price: 175,
        description: "Nutritious organic sprouted moong beans tossed with chopped onions, tomatoes, green chilies, cilantro, and lemon juice.",
        category: "Salad",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 240
    },
    {
        _id: "6",
        name: "Quinoa Corn Fiesta Salad",
        image: "food_quinoa_salad.jpg",
        price: 199,
        description: "Fluffy Peruvian quinoa, sweet yellow corn, black beans, diced bell peppers, and zesty lime coriander dressing.",
        category: "Salad",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 690
    },
    {
        _id: "7",
        name: "Caesar Salad",
        image: "food_caesar_salad.jpg",
        price: 216,
        description: "Crisp romaine hearts, toasted garlic herb croutons, parmesan shavings, and creamy Italian Caesar dressing.",
        category: "Salad",
        isVeg: true,
        rating: 4.5,
        reviewsCount: 185
    },
    {
        _id: "8",
        name: "Mediterranean Chickpea Salad",
        image: "food_chickpea_salad.jpg",
        price: 225,
        description: "Wholesome boiled kabuli chana with diced English cucumbers, juicy cherry tomatoes, kalamata olives, and fresh herbs.",
        category: "Salad",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 430
    },
    {
        _id: "9",
        name: "Fresh Fruit Nutty Salad",
        image: "food_fruit_salad.jpg",
        price: 242,
        description: "Chilled medley of sweet melons, crisp apples, juicy pomegranate arils, and toasted almonds with mint honey glaze.",
        category: "Salad",
        isVeg: true,
        rating: 4.4,
        reviewsCount: 750
    },
    {
        _id: "10",
        name: "Rainbow Garden Avocado Salad",
        image: "food_rainbow_salad.jpg",
        price: 275,
        description: "Vibrant garden bowl layered with ripe Hass avocado slices, crisp greens, beetroot, cherry tomatoes, and citrus vinaigrette.",
        category: "Salad",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 610
    },
    {
        _id: "11",
        name: "Lasagna Rolls",
        image: "food_5.png",
        price: 199,
        description: "Tender pasta sheet rolled with ricotta, parmesan, spinach, and Italian herb tomato marinara.",
        category: "Rolls",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 310
    },
    {
        _id: "12",
        name: "Peri Peri Rolls",
        image: "food_6.png",
        price: 175,
        description: "Spicy zesty peri-peri seasoned vegetables rolled in flaky multi-grain paratha with mint mayo.",
        category: "Rolls",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 450
    },
    {
        _id: "13",
        name: "Chicken Rolls",
        image: "food_7.png",
        price: 220,
        description: "Succulent smoked chicken tikka chunks rolled with pickled onions, bell peppers, and chipotle dip.",
        category: "Rolls",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 580
    },
    {
        _id: "14",
        name: "Veg Rolls",
        image: "food_8.png",
        price: 149,
        description: "Classic street-style crunchy shredded cabbage, carrots, capsicum, and paneer roll with sweet chili sauce.",
        category: "Rolls",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 390
    },
    {
        _id: "15",
        name: "Aloo Frankie Roll",
        image: "food_aloo_frankie.jpg",
        price: 129,
        description: "Iconic street-style spicy mashed potato frankie seasoned with special chaat masala, tangy onions, and green chili vinegar.",
        category: "Rolls",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 480
    },
    {
        _id: "16",
        name: "Cheesy Corn Roll",
        image: "food_corn_cheese_roll.jpg",
        price: 169,
        description: "Sweet golden corn and melted mozzarella enveloped in a crisp wrap with creamy herb spread.",
        category: "Rolls",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 360
    },
    {
        _id: "17",
        name: "Spring Rolls Crisp",
        image: "food_spring_rolls.jpg",
        price: 185,
        description: "Golden crispy fried rolls stuffed with glass noodles, cabbage, carrots, and sweet chili dip.",
        category: "Rolls",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 620
    },
    {
        _id: "18",
        name: "Paneer Kathi Roll",
        image: "food_paneer_roll.jpg",
        price: 195,
        description: "Char-grilled spiced cottage cheese cubes wrapped in rumali roti with mint chutney and crunchy salad.",
        category: "Rolls",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 510
    },
    {
        _id: "19",
        name: "Schezwan Paneer Roll",
        image: "food_schezwan_roll.jpg",
        price: 205,
        description: "Fiery Schezwan tossed paneer strips wrapped in butter toasted paratha with sesame garnish.",
        category: "Rolls",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 290
    },
    {
        _id: "20",
        name: "Tandoori Mushroom Roll",
        image: "food_mushroom_roll.jpg",
        price: 199,
        description: "Earthy button mushrooms marinated in aromatic tandoori spices and rolled with mint garlic mayo.",
        category: "Rolls",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 330
    },
    {
        _id: "21",
        name: "Ripple Ice Cream",
        image: "food_9.png",
        price: 120,
        description: "Creamy vanilla gelato swirled with rich raspberry syrup and dark chocolate fudge ripples.",
        category: "Deserts",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 620
    },
    {
        _id: "22",
        name: "Fruit Ice Cream",
        image: "food_10.png",
        price: 135,
        description: "Velvety fresh cream ice cream loaded with real chunks of strawberries, kiwi, and tender mango.",
        category: "Deserts",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 480
    },
    {
        _id: "23",
        name: "Jar Ice Cream",
        image: "food_11.png",
        price: 160,
        description: "Artisanal Belgian chocolate layered cake and gelato dessert packed in an elegant reusable glass jar.",
        category: "Deserts",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 710
    },
    {
        _id: "24",
        name: "Vanilla Ice Cream",
        image: "food_12.png",
        price: 110,
        description: "Classic aromatic Bourbon Madagascar vanilla bean double-churned ice cream scoop.",
        category: "Deserts",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 540
    },
    {
        _id: "25",
        name: "Gulab Jamun Warm",
        image: "food_gulab_jamun.jpg",
        price: 99,
        description: "Soft khoya dumplings deep fried and steeped in fragrant cardamom saffron sugar syrup.",
        category: "Deserts",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 890
    },
    {
        _id: "26",
        name: "Rasmalai Royal",
        image: "food_rasmalai.jpg",
        price: 139,
        description: "Delicate chenna patties soaked in chilled thick saffron milk garnished with slivered pistachios.",
        category: "Deserts",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 780
    },
    {
        _id: "27",
        name: "Chocolate Lava Cake",
        image: "food_choco_lava.jpg",
        price: 149,
        description: "Warm moist chocolate cake with a molten chocolate center that flows luxuriously at first bite.",
        category: "Deserts",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 670
    },
    {
        _id: "28",
        name: "Sizzling Brownie",
        image: "food_chocolate_brownie.jpg",
        price: 165,
        description: "Decadent dark chocolate brownie served with hot chocolate fudge drizzle and crushed walnuts.",
        category: "Deserts",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 540
    },
    {
        _id: "29",
        name: "Kulfi Falooda Sundae",
        image: "food_kulfi_falooda.jpg",
        price: 145,
        description: "Authentic kesar pista kulfi served with rose syrup, basil seeds, and slippery falooda sev.",
        category: "Deserts",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 410
    },
    {
        _id: "30",
        name: "Mango Panna Cotta",
        image: "food_mango_panna_cotta.jpg",
        price: 155,
        description: "Silky smooth Italian sweet cream set pudding topped with fresh Alphonso mango coulis.",
        category: "Deserts",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 320
    },
    {
        _id: "31",
        name: "Chicken Sandwich",
        image: "food_13.png",
        price: 195,
        description: "Herb roasted chicken breast, crisp lettuce, cheddar slice, and garlic aioli between toasted sourdough.",
        category: "Sandwich",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 490
    },
    {
        _id: "32",
        name: "Vegan Sandwich",
        image: "food_14.png",
        price: 155,
        description: "Avocado mash, heirloom tomatoes, alfalfa sprouts, and dairy-free pesto on whole wheat multi-seed bread.",
        category: "Sandwich",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 360
    },
    {
        _id: "33",
        name: "Grilled Sandwich",
        image: "food_15.png",
        price: 169,
        description: "Golden butter-toasted sandwich stuffed with spiced potatoes, green peppers, melted cheese, and green chutney.",
        category: "Sandwich",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 680
    },
    {
        _id: "34",
        name: "Bread Sandwich",
        image: "food_16.png",
        price: 139,
        description: "Traditional Bombay triple-decker cucumber and butter sandwich sprinkled with special sandwich masala.",
        category: "Sandwich",
        isVeg: true,
        rating: 4.5,
        reviewsCount: 290
    },
    {
        _id: "35",
        name: "Spinach Corn Toast",
        image: "food_spinach_corn_toast.jpg",
        price: 149,
        description: "Creamy garlic sauteed spinach and sweet corn gratin on toasted artisanal sourdough.",
        category: "Sandwich",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 420
    },
    {
        _id: "36",
        name: "Corn & Cheese Grilled Sandwich",
        image: "food_corn_cheese_sandwich.jpg",
        price: 165,
        description: "Loaded with sweet American corn and gooey melted mozzarella between buttered grill-marked bread.",
        category: "Sandwich",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 560
    },
    {
        _id: "37",
        name: "Mexican Jalapeno Cheese Sandwich",
        image: "food_jalapeno_sandwich.jpg",
        price: 175,
        description: "Zesty Mexican salsa, pickled jalapenos, black beans, and Monterey Jack cheese pressed to crisp perfection.",
        category: "Sandwich",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 310
    },
    {
        _id: "38",
        name: "Bombay Veg Club Sandwich",
        image: "food_veg_club_sandwich.jpg",
        price: 185,
        description: "Three-tiered street delight packed with beetroot, boiled potato, cucumber, tomato, cheese, and spicy mint dip.",
        category: "Sandwich",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 840
    },
    {
        _id: "39",
        name: "Paneer Tikka Sandwich",
        image: "food_paneer_sandwich.jpg",
        price: 189,
        description: "Tandoori marinated cottage cheese slabs layered with mint chutney and crunchy capsicum.",
        category: "Sandwich",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 610
    },
    {
        _id: "40",
        name: "Classic Egg Mayo Sandwich",
        image: "food_egg_mayo_sandwich.jpg",
        price: 169,
        description: "Fluffy hard-boiled eggs mashed with Dijon mustard, Japanese mayo, and cracked black pepper.",
        category: "Sandwich",
        isVeg: false,
        rating: 4.7,
        reviewsCount: 390
    },
    {
        _id: "41",
        name: "Cup Cake",
        image: "food_17.png",
        price: 99,
        description: "Moist red velvet cupcake topped with silky swirls of Philadelphia cream cheese frosting and gold pearls.",
        category: "Cake",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 820
    },
    {
        _id: "42",
        name: "Vegan Cake",
        image: "food_18.png",
        price: 185,
        description: "Rich plant-based dark chocolate sponge layered with organic coconut ganache and roasted almonds.",
        category: "Cake",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 340
    },
    {
        _id: "43",
        name: "Butterscotch Cake",
        image: "food_19.png",
        price: 199,
        description: "Fluffy vanilla sponge smothered with caramel butterscotch mousse, crunchy praline nuggets, and drizzle.",
        category: "Cake",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 590
    },
    {
        _id: "44",
        name: "Sliced Cake",
        image: "food_20.png",
        price: 140,
        description: "Traditional British tea-time loaf slice infused with golden candied citrus peel, raisins, and aromatic spices.",
        category: "Cake",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 270
    },
    {
        _id: "45",
        name: "Pineapple Fresh Cream Pastry",
        image: "food_pineapple_pastry.jpg",
        price: 110,
        description: "Light airy sponge cake layered with sweet crushed pineapple chunks and freshly whipped dairy cream.",
        category: "Cake",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 460
    },
    {
        _id: "46",
        name: "Black Forest Pastry",
        image: "food_black_forest_pastry.jpg",
        price: 125,
        description: "German classic chocolate sponge infused with cherry liqueur syrup, sour cherries, and chocolate shavings.",
        category: "Cake",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 630
    },
    {
        _id: "47",
        name: "Belgian Hazelnut Cake",
        image: "food_hazelnut_cake.jpg",
        price: 219,
        description: "Nutty roasted hazelnut gianduja mousse on a crunchy feuilletine base coated in chocolate mirror glaze.",
        category: "Cake",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 710
    },
    {
        _id: "48",
        name: "New York Cheesecake",
        image: "food_cheesecake.jpg",
        price: 235,
        description: "Dense, ultra-creamy baked cream cheese filling resting on a sweet cinnamon graham cracker crust.",
        category: "Cake",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 870
    },
    {
        _id: "49",
        name: "Red Velvet Cake",
        image: "food_red_velvet_cake.jpg",
        price: 199,
        description: "Velvety crimson cocoa sponge layered with tangy Madagascar vanilla cream cheese frosting.",
        category: "Cake",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 520
    },
    {
        _id: "50",
        name: "Layered Chocolate Truffle Cake",
        image: "food_chocolate_truffle_cake.jpg",
        price: 220,
        description: "Decadent Dutch chocolate sponge saturated with 70% dark chocolate ganache and chocolate curls.",
        category: "Cake",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 940
    },
    {
        _id: "51",
        name: "Garlic Mushroom",
        image: "food_21.png",
        price: 210,
        description: "Fresh button mushrooms tossed in butter, burnt garlic flakes, cracked pepper, and Italian parsley.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 430
    },
    {
        _id: "52",
        name: "Fried Cauliflower",
        image: "food_22.png",
        price: 185,
        description: "Crispy battered cauliflower florets tossed in sweet and tangy chili garlic glaze with spring onions.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 510
    },
    {
        _id: "53",
        name: "Mix Veg Pulao",
        image: "food_23.png",
        price: 220,
        description: "Fragrant long-grain aged basmati rice cooked with whole spices, carrots, green peas, and paneer cubes.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 670
    },
    {
        _id: "54",
        name: "Rice Zucchini",
        image: "food_24.png",
        price: 235,
        description: "Herb infused Italian arborio rice risotto simmered with tender green zucchini ribbons and parmesan.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 310
    },
    {
        _id: "55",
        name: "Palak Paneer Desi Ghee",
        image: "food_palak_paneer.jpg",
        price: 245,
        description: "Fresh cottage cheese cubes cooked in a smooth, mildly spiced organic spinach puree tempered with garlic and cumin.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 520
    },
    {
        _id: "56",
        name: "Paneer Tikka",
        image: "food_paneer_tikka.jpg",
        price: 260,
        description: "Cubes of malai paneer, bell peppers, and red onions marinated in curd and tandoori spices, char-grilled.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 780
    },
    {
        _id: "57",
        name: "Kadhai Paneer Special",
        image: "food_kadhai_paneer.jpg",
        price: 255,
        description: "Cottage cheese simmered in spicy onion-tomato gravy with freshly ground coriander seeds and crunchy bell peppers.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 610
    },
    {
        _id: "58",
        name: "Paneer Butter Masala",
        image: "food_paneer_butter_masala.jpg",
        price: 270,
        description: "Rich, velvety tomato and cashew nut makhani gravy infused with kasuri methi and finished with white butter.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 890
    },
    {
        _id: "59",
        name: "Dal Makhani & Naan",
        image: "food_dal_makhani.jpg",
        price: 230,
        description: "Slow-cooked black lentils and kidney beans simmered overnight on tandoor with fresh cream and butter.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 920
    },
    {
        _id: "60",
        name: "Deluxe Royal Veg Thali",
        image: "food_veg_thali.jpg",
        price: 299,
        description: "Complete feast with Dal Makhani, Shahi Paneer, Mix Veg, Pulao, 2 Butter Naan, Raita, and Gulab Jamun.",
        category: "Pure Veg",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1100
    },
    {
        _id: "61",
        name: "Cheese Pasta",
        image: "food_25.png",
        price: 210,
        description: "Gooey four-cheese macaroni pasta baked to bubbly golden perfection with an herb panko crust.",
        category: "Pasta",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 780
    },
    {
        _id: "62",
        name: "Tomato Pasta",
        image: "food_26.png",
        price: 195,
        description: "Penne tossed in slow-simmered San Marzano plum tomato pomodoro sauce with torn fresh sweet basil.",
        category: "Pasta",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 460
    },
    {
        _id: "63",
        name: "Creamy Pasta",
        image: "food_27.png",
        price: 225,
        description: "Silky fettuccine enrobed in garlic parmesan cream sauce with sauteed broccoli and sweet bell peppers.",
        category: "Pasta",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 610
    },
    {
        _id: "64",
        name: "Chicken Pasta",
        image: "food_28.png",
        price: 260,
        description: "Tender rosemary grilled chicken tossed with fusilli in rich pink Aurora sauce and black olives.",
        category: "Pasta",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 530
    },
    {
        _id: "65",
        name: "Aglio Olio Peperoncino",
        image: "food_aglio_olio.jpg",
        price: 220,
        description: "Classic spaghetti tossed in extra virgin olive oil, toasted garlic slivers, red pepper flakes, and parsley.",
        category: "Pasta",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 380
    },
    {
        _id: "66",
        name: "Penne Arrabbiata",
        image: "food_penne_arrabbiata.jpg",
        price: 215,
        description: "Al dente penne in fiery spicy garlic tomato sauce with black olives and fresh parmesan shavings.",
        category: "Pasta",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 490
    },
    {
        _id: "67",
        name: "White Sauce Alfredo Pasta",
        image: "food_alfredo_pasta.jpg",
        price: 235,
        description: "Penne coated in rich, velvety butter parmesan cream sauce with sauteed button mushrooms.",
        category: "Pasta",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 720
    },
    {
        _id: "68",
        name: "Mac & Cheese Supreme",
        image: "food_mac_and_cheese.jpg",
        price: 225,
        description: "Elbow macaroni enveloped in sharp yellow cheddar and gruyere sauce with crispy golden breadcrumbs.",
        category: "Pasta",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 610
    },
    {
        _id: "69",
        name: "Peri Peri Cheesy Pasta",
        image: "food_peri_peri_pasta.jpg",
        price: 240,
        description: "Fusilli pasta tossed in creamy spicy African peri-peri cheese sauce with crunchy bell peppers.",
        category: "Pasta",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 340
    },
    {
        _id: "70",
        name: "Pesto Basil Penne",
        image: "food_pesto_pasta.jpg",
        price: 250,
        description: "Penne tossed in freshly pounded Genoa sweet basil, pine nut, parmesan, and extra virgin olive oil pesto.",
        category: "Pasta",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 580
    },
    {
        _id: "71",
        name: "Butter Noodles",
        image: "food_29.png",
        price: 165,
        description: "Delicate egg noodles tossed in melted French butter, fresh cracked sea salt, and toasted garlic chives.",
        category: "Noodles",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 340
    },
    {
        _id: "72",
        name: "Veg Noodles",
        image: "food_30.png",
        price: 175,
        description: "Wok-tossed noodles with julienned cabbage, capsicum, carrots, and scallions in light soy dressing.",
        category: "Noodles",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 720
    },
    {
        _id: "73",
        name: "Somen Noodles",
        image: "food_31.png",
        price: 195,
        description: "Delicate Japanese wheat noodles served chilled or warm with fragrant tsuyu broth and sesame garnish.",
        category: "Noodles",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 290
    },
    {
        _id: "74",
        name: "Cooked Noodles",
        image: "food_32.png",
        price: 180,
        description: "Steaming hot street-style stir-fried hakka noodles with crunchy vegetables and spicy schezwan splash.",
        category: "Noodles",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 550
    },
    {
        _id: "75",
        name: "Veg Hakka Noodles",
        image: "food_hakka_noodles.jpg",
        price: 185,
        description: "Classic Chinese wok-tossed long wheat noodles with cabbage, carrots, capsicum, and spring onions.",
        category: "Noodles",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 840
    },
    {
        _id: "76",
        name: "Singapore Crispy Noodles",
        image: "food_singapore_noodles.jpg",
        price: 210,
        description: "Crisp golden fried noodles topped with sweet and sour exotic vegetable gravy and baby corn.",
        category: "Noodles",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 420
    },
    {
        _id: "77",
        name: "Chilli Garlic Noodles",
        image: "food_chilli_garlic_noodles.jpg",
        price: 195,
        description: "Fiery wok-tossed spicy noodles loaded with charred crushed garlic cloves and red chili oil paste.",
        category: "Noodles",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 660
    },
    {
        _id: "78",
        name: "Schezwan Veg Noodles",
        image: "food_schezwan_noodles.jpg",
        price: 200,
        description: "Spicy noodles tossed in authentic in-house fermented Schezwan pepper sauce with crunchy celery.",
        category: "Noodles",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 590
    },
    {
        _id: "79",
        name: "Pan Fried Spicy Noodles",
        image: "food_pan_fried_noodles.jpg",
        price: 215,
        description: "Pan-crisped noodle nest crowned with hot Hunan vegetable stir-fry and toasted sesame seeds.",
        category: "Noodles",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 310
    },
    {
        _id: "80",
        name: "Thai Pad Noodles",
        image: "food_pad_thai.jpg",
        price: 235,
        description: "Broad flat rice noodles stir-fried with tofu, bean sprouts, tamarind sauce, and crushed peanuts.",
        category: "Noodles",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 750
    },
    {
        _id: "81",
        name: "Idli Sambar",
        image: "food_idli_sambar.jpg",
        price: 120,
        description: "Steaming soft and fluffy fermented rice cakes served with aromatic drumstick sambar and fresh coconut chutney.",
        category: "South Indian",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 920
    },
    {
        _id: "82",
        name: "Medu Vada",
        image: "food_medu_vada.jpg",
        price: 130,
        description: "Golden crispy fried lentil fritters spiced with peppercorns, curry leaves, and ginger.",
        category: "South Indian",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 680
    },
    {
        _id: "83",
        name: "Vegetable Upma",
        image: "food_veg_upma.jpg",
        price: 110,
        description: "Wholesome roasted semolina cooked with mustard seeds, curry leaves, ginger, cashews, and garden vegetables.",
        category: "South Indian",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 340
    },
    {
        _id: "84",
        name: "Plain Roast Dosa",
        image: "food_plain_dosa.jpg",
        price: 140,
        description: "Paper-thin, golden, crisp crepe made from fermented rice and lentil batter served with trio of chutneys.",
        category: "South Indian",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 510
    },
    {
        _id: "85",
        name: "Ghee Podi Dosa",
        image: "food_podi_dosa.jpg",
        price: 165,
        description: "Crispy dosa smeared generously with pure desi ghee and aromatic spicy gunpowder lentil podi.",
        category: "South Indian",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 840
    },
    {
        _id: "86",
        name: "Masala Dosa",
        image: "food_masala_dosa.jpg",
        price: 160,
        description: "Iconic crisp golden dosa folded over aromatic turmeric spiced mashed potato and onion filling.",
        category: "South Indian",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1150
    },
    {
        _id: "87",
        name: "Onion Rava Dosa",
        image: "food_onion_rava_dosa.jpg",
        price: 170,
        description: "Crispy lace-patterned semolina and rice crepe studded with cumin, finely chopped onions, and green chilies.",
        category: "South Indian",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 460
    },
    {
        _id: "88",
        name: "Onion Tomato Uttapam",
        image: "food_onion_tomato_uttapam.jpg",
        price: 175,
        description: "Thick, soft savory pancake topped with caramelized red onions, juicy diced tomatoes, and fresh cilantro.",
        category: "South Indian",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 580
    },
    {
        _id: "89",
        name: "Mysore Masala Dosa",
        image: "food_mysore_masala_dosa.jpg",
        price: 180,
        description: "Crispy dosa with internal spicy red garlic chutney lining and traditional spiced potato stuffing.",
        category: "South Indian",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 890
    },
    {
        _id: "90",
        name: "Paneer Cheese Dosa",
        image: "food_paneer_cheese_dosa.jpg",
        price: 195,
        description: "Fusion favorite stuffed with spiced grated paneer and melted mozzarella cheese.",
        category: "South Indian",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 620
    },
    {
        _id: "91",
        name: "Espresso Shot",
        image: "food_espresso_shot.jpg",
        price: 110,
        description: "Intense, concentrated 30ml double shot of dark roasted Arabica coffee with thick golden crema.",
        category: "Coffee",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 310
    },
    {
        _id: "92",
        name: "South Indian Filter Coffee",
        image: "food_filter_coffee.jpg",
        price: 90,
        description: "Traditional chicory-infused decoction brewed with frothy boiling milk served in brass davara tumbler.",
        category: "Coffee",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1420
    },
    {
        _id: "93",
        name: "Iced Americano",
        image: "food_iced_americano.jpg",
        price: 130,
        description: "Bold double espresso poured over chilled mineral water and crystalline ice cubes.",
        category: "Coffee",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 280
    },
    {
        _id: "94",
        name: "Flat White",
        image: "food_flat_white.jpg",
        price: 160,
        description: "Velvety micro-foamed steamed milk poured over a rich ristretto espresso shot.",
        category: "Coffee",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 410
    },
    {
        _id: "95",
        name: "Hot Cappuccino",
        image: "food_hot_cappuccino.jpg",
        price: 150,
        description: "Balanced espresso with equal parts steamed milk and dense creamy foam dusted with cocoa powder.",
        category: "Coffee",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 980
    },
    {
        _id: "96",
        name: "Iced Cold Coffee",
        image: "food_iced_cold_coffee.jpg",
        price: 165,
        description: "Creamy classic blended cold coffee with chilled milk, sugar, espresso, and vanilla ice cream scoop.",
        category: "Coffee",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1250
    },
    {
        _id: "97",
        name: "Cold Brew On Rocks",
        image: "food_cold_brew.jpg",
        price: 175,
        description: "18-hour slow cold-steeped coarse ground Arabica coffee with natural chocolate and caramel notes.",
        category: "Coffee",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 520
    },
    {
        _id: "98",
        name: "Vanilla Iced Latte",
        image: "food_vanilla_iced_latte.jpg",
        price: 175,
        description: "Espresso and chilled milk flavored with pure French vanilla syrup served over ice.",
        category: "Coffee",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 390
    },
    {
        _id: "99",
        name: "Cafe Mocha",
        image: "food_cafe_mocha.jpg",
        price: 180,
        description: "Espresso combined with bittersweet Dutch cocoa, steamed milk, and whipped cream swirl.",
        category: "Coffee",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 640
    },
    {
        _id: "100",
        name: "Caramel Macchiato",
        image: "food_caramel_macchiato.jpg",
        price: 190,
        description: "Steamed vanilla milk marked with bold espresso and crosshatched with rich buttery caramel sauce.",
        category: "Coffee",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 870
    },
    {
        _id: "101",
        name: "Hazelnut Frappe",
        image: "food_hazelnut_frappe.jpg",
        price: 195,
        description: "Blended ice frappe flavored with roasted hazelnut praline syrup and whipped cream topping.",
        category: "Coffee",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 560
    },
    {
        _id: "102",
        name: "Affogato Espresso",
        image: "food_affogato.jpg",
        price: 170,
        description: "Hot freshly extracted espresso shot poured directly over a cold scoop of artisanal vanilla bean gelato.",
        category: "Coffee",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 430
    },
    {
        _id: "103",
        name: "Classic Irish Coffee",
        image: "food_irish_coffee.jpg",
        price: 210,
        description: "Hot brewed dark roast coffee with brown sugar and Irish cream essence topped with thick heavy cream.",
        category: "Coffee",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 310
    },
    {
        _id: "104",
        name: "Classic Vanilla Shake",
        image: "food_vanilla_shake.jpg",
        price: 150,
        description: "Thick creamy shake blended with double scoops of Madagascar vanilla ice cream and whole milk.",
        category: "Shakes",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 420
    },
    {
        _id: "105",
        name: "Strawberry Cream Shake",
        image: "food_strawberry_shake.jpg",
        price: 165,
        description: "Fresh strawberry puree churned with strawberry ice cream and topped with strawberry drizzle.",
        category: "Shakes",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 650
    },
    {
        _id: "106",
        name: "Banana Peanut Butter Shake",
        image: "food_banana_pb_shake.jpg",
        price: 175,
        description: "Ripe bananas blended with creamy organic peanut butter, honey, and chia seeds for a high-protein boost.",
        category: "Shakes",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 480
    },
    {
        _id: "107",
        name: "Butterscotch Caramel Shake",
        image: "food_butterscotch_shake.jpg",
        price: 170,
        description: "Butterscotch ice cream blended with golden butterscotch crunchies and salty caramel sauce.",
        category: "Shakes",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 390
    },
    {
        _id: "108",
        name: "Alphonso Mango Shake",
        image: "food_mango_shake.jpg",
        price: 180,
        description: "Seasonal specialty made with 100% Ratnagiri Alphonso mango pulp and vanilla ice cream.",
        category: "Shakes",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 940
    },
    {
        _id: "109",
        name: "Blueberry Bliss Shake",
        image: "food_blueberry_shake.jpg",
        price: 195,
        description: "Wild Canadian blueberries blended with Greek yogurt, ice cream, and blueberry compote.",
        category: "Shakes",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 520
    },
    {
        _id: "110",
        name: "KitKat Crunch Shake",
        image: "food_kitkat_shake.jpg",
        price: 185,
        description: "Crisp KitKat chocolate wafer bars crushed and blended into rich chocolate milkshake with waffle stick.",
        category: "Shakes",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1120
    },
    {
        _id: "111",
        name: "Oreo Thickshake",
        image: "food_oreo_shake.jpg",
        price: 180,
        description: "Crunchy Oreo cookies blended with chocolate ice cream and topped with cookie crumbs.",
        category: "Shakes",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1280
    },
    {
        _id: "112",
        name: "Nutella Hazelnut Shake",
        image: "food_nutella_shake.jpg",
        price: 210,
        description: "Generous swirl of Italian Nutella spread blended with chocolate ice cream and roasted hazelnuts.",
        category: "Shakes",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1350
    },
    {
        _id: "113",
        name: "Belgian Chocolate Shake",
        image: "food_belgian_chocolate_shake.jpg",
        price: 199,
        description: "Intense 70% dark Belgian cocoa blended into an ultra-thick ganache shake for pure chocoholics.",
        category: "Shakes",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 860
    },
    {
        _id: "114",
        name: "Fresh Coconut Water",
        image: "food_coconut_water.jpg",
        price: 90,
        description: "Naturally electrolyte-rich tender coconut water served chilled and fresh from the shell.",
        category: "Juice",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 780
    },
    {
        _id: "115",
        name: "Watermelon Mint Juice",
        image: "food_watermelon_juice.jpg",
        price: 110,
        description: "Fresh cold-pressed sweet watermelon juice with a hint of garden mint and black salt.",
        category: "Juice",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 650
    },
    {
        _id: "116",
        name: "Sweet Mosambi Juice",
        image: "food_mosambi_juice.jpg",
        price: 120,
        description: "Pure sweet lime juice freshly squeezed without added water or artificial sugar.",
        category: "Juice",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 490
    },
    {
        _id: "117",
        name: "Fresh Orange Juice",
        image: "food_orange_juice.jpg",
        price: 130,
        description: "Pulpy Nagpur orange juice packed with natural Vitamin C, cold-pressed to preserve nutrition.",
        category: "Juice",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 710
    },
    {
        _id: "118",
        name: "Lemon Mint Refresher Juice",
        image: "food_lemon_mint_juice.jpg",
        price: 80,
        description: "Tangy Indian shikanji with fresh lemon, crushed mint leaves, roasted cumin, and black salt.",
        category: "Juice",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 540
    },
    {
        _id: "119",
        name: "Pineapple Lime Juice",
        image: "food_pineapple_juice.jpg",
        price: 125,
        description: "Tropical sweet and tart pineapple juice with a squeeze of fresh key lime.",
        category: "Juice",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 380
    },
    {
        _id: "120",
        name: "Alphonso Mango Juice",
        image: "food_mango_juice.jpg",
        price: 140,
        description: "Thick luscious nectar extracted from naturally ripened Alphonso mangoes.",
        category: "Juice",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 820
    },
    {
        _id: "121",
        name: "Apple Beetroot Carrot (ABC) Juice",
        image: "food_abc_juice.jpg",
        price: 145,
        description: "The ultimate miracle detox juice: crunchy apples, sweet beetroot, and fresh carrots.",
        category: "Juice",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 610
    },
    {
        _id: "122",
        name: "Green Detox Kiwi Juice",
        image: "food_kiwi_green_juice.jpg",
        price: 155,
        description: "Nutrient powerhouse with tangy kiwi, green apple, cucumber, spinach, and lemon.",
        category: "Juice",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 390
    },
    {
        _id: "123",
        name: "Pomegranate Ruby Juice",
        image: "food_pomegranate_juice.jpg",
        price: 188,
        description: "100% pure ruby red pomegranate juice packed with powerful natural antioxidants and sweetness.",
        category: "Juice",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 480
    },
    {
        _id: "124",
        name: "Soya Malai Chaap",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Soya_Chaap_dish.jpg",
        price: 240,
        description: "Tender soya chaap chunks marinated in rich cream, cashew paste, green cardamom, and grilled in tandoor.",
        category: "Chaap",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 780
    },
    {
        _id: "125",
        name: "Tandoori Masala Chaap",
        image: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Tandoori_platter.jpg",
        price: 220,
        description: "Spicy roasted soya chaap skewers coated with Punjabi tandoori masala and basted in lemon butter.",
        category: "Chaap",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 650
    },
    {
        _id: "126",
        name: "Afghani Soya Chaap",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/31/Malai_chicken_tikka.JPG",
        price: 250,
        description: "Mild and aromatic soya chaap grilled with white pepper, fresh hung curd, and rich garlic marinade.",
        category: "Chaap",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 520
    },
    {
        _id: "127",
        name: "Achari Soya Chaap",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/960px-Paneer_tikka.jpg",
        price: 230,
        description: "Zesty soya chaap infused with pickled mustard seeds, fennel, and fiery kachha aam masala.",
        category: "Chaap",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 430
    },
    {
        _id: "128",
        name: "Haryali Soya Chaap",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Hariyali_Tikka.jpg/960px-Hariyali_Tikka.jpg",
        price: 235,
        description: "Tandoor-charred soya skewers marinated in fresh mint, coriander, and green chillies.",
        category: "Chaap",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 390
    },
    {
        _id: "129",
        name: "Soya Chaap Butter Masala Gravy",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/960px-Chicken_tikka_masala_%28cropped%29.jpg",
        price: 270,
        description: "Succulent roasted soya chaap simmered in silky tomato-butter-cashew makhani gravy.",
        category: "Chaap",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 840
    },
    {
        _id: "130",
        name: "Kadhai Soya Chaap Gravy",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Punjabi_Chicken_Karahi.JPG/960px-Punjabi_Chicken_Karahi.JPG",
        price: 260,
        description: "Wok-tossed soya chaap with crispy bell peppers, onions, and freshly crushed coriander spices.",
        category: "Chaap",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 590
    },
    {
        _id: "131",
        name: "Soya Chaap Rogan Josh (Veg Style)",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Rogan_Josh_Kashmiri.jpg/960px-Rogan_Josh_Kashmiri.jpg",
        price: 280,
        description: "A slow-cooked Kashmiri spiced vegetarian delicacy cooked with aromatic ratan jot spices and yogurt.",
        category: "Chaap",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 460
    },
    {
        _id: "132",
        name: "Crispy Kurkure Soya Chaap",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_momos_of_Salem.jpg",
        price: 210,
        description: "Deep-fried crunchy soya chaap coated in golden cornflakes batter served with mint dip.",
        category: "Chaap",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 510
    },
    {
        _id: "133",
        name: "Soya Chaap Kathi Roll",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chicken_Chilli.JPG/960px-Chicken_Chilli.JPG",
        price: 180,
        description: "Flame-roasted spicy tandoori chaap wrapped in soft roomali roti with pickled laccha onions.",
        category: "Chaap",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 720
    },
    {
        _id: "134",
        name: "Cheesy Garlic Bread",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Garlic_bread_baguettes_2.jpg",
        price: 175,
        description: "Toasted artisan baguette slices smothered in garlic herb butter and bubbling melted mozzarella.",
        category: "Continental",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 680
    },
    {
        _id: "135",
        name: "Classic Mac & Cheese",
        image: "food_mac_and_cheese.jpg",
        price: 240,
        description: "Elbow macaroni baked in rich three-cheese cheddar béchamel sauce with a crispy golden crust.",
        category: "Continental",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 910
    },
    {
        _id: "136",
        name: "Baked Vegetable Au Gratin",
        image: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Gratin-Dauphinois.jpg",
        price: 265,
        description: "Tender garden vegetables baked in creamy mornay sauce with bubbling parmesan cheese.",
        category: "Continental",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 380
    },
    {
        _id: "137",
        name: "Grilled Cottage Cheese Steak",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/960px-Paneer_tikka.jpg",
        price: 295,
        description: "Char-grilled herb-marinated paneer slab served with sautéed vegetables and pepper mushroom sauce.",
        category: "Continental",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 440
    },
    {
        _id: "138",
        name: "Cream of Mushroom Soup",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Cream_mushroom_soup_3.jpg/960px-Cream_mushroom_soup_3.jpg",
        price: 165,
        description: "Earthy roasted button mushrooms blended into velvety cream soup garnished with truffle oil.",
        category: "Continental",
        isVeg: true,
        rating: 4.6,
        reviewsCount: 290
    },
    {
        _id: "139",
        name: "Crispy Jalapeño Cheese Poppers",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Cooking-food-stuffed-jalapenos-peppers.jpg",
        price: 195,
        description: "Golden crumbed melted cheese bites stuffed with fiery diced jalapeño peppers.",
        category: "Continental",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 610
    },
    {
        _id: "140",
        name: "Herb Grilled Chicken Breast",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Grilled_chicken_breast.jpg/960px-Grilled_chicken_breast.jpg",
        price: 345,
        description: "Succulent chicken breast grilled with rosemary and thyme, served with garlic mash and pepper jus.",
        category: "Continental",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 820
    },
    {
        _id: "141",
        name: "Chicken Stroganoff with Buttered Rice",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Moscow_%288351271825%29.jpg/960px-Moscow_%288351271825%29.jpg",
        price: 375,
        description: "Tender chicken strips and button mushrooms in rich sour cream sauce served over seasoned butter rice.",
        category: "Continental",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 510
    },
    {
        _id: "142",
        name: "Crispy Fish & Chips",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Fish_and_chips_blackpool.jpg/960px-Fish_and_chips_blackpool.jpg",
        price: 360,
        description: "Golden crispy battered river sole fillet served with salted crinkle fries and homemade tartar sauce.",
        category: "Continental",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 670
    },
    {
        _id: "143",
        name: "Grilled Lemon Butter Fish",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Pan-fried_fish_fillet.jpg/960px-Pan-fried_fish_fillet.jpg",
        price: 390,
        description: "Pan-seared fish fillet basted in zesty lemon garlic butter sauce with sautéed asparagus.",
        category: "Continental",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 490
    },
    {
        _id: "144",
        name: "Roasted Chicken Caesar Wrap",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Chicken_wrap.jpg/960px-Chicken_wrap.jpg",
        price: 230,
        description: "Sliced grilled chicken, crisp romaine, parmesan shavings, and Caesar dressing wrapped in tortilla.",
        category: "Continental",
        isVeg: false,
        rating: 4.7,
        reviewsCount: 380
    },
    {
        _id: "145",
        name: "Peri Peri Grilled Chicken Skewers",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Chickentandoori.jpg",
        price: 285,
        description: "Fiery peri peri spiced chicken skewers served with lemon wedges and cooling garlic aioli.",
        category: "Continental",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 560
    },
    {
        _id: "146",
        name: "Spinach & Corn Quesadilla",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Empanada_flor_de_Calabaza.jpg/960px-Empanada_flor_de_Calabaza.jpg",
        price: 220,
        description: "Grilled Mexican-style flour tortilla folded with sweet corn, sauteed baby spinach, and Monterey Jack.",
        category: "Continental",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 420
    },
    {
        _id: "147",
        name: "Classic Margherita Pizza",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Margherita_Originale.JPG",
        price: 280,
        description: "Wood-fired thin crust pizza with San Marzano tomato sauce, fresh mozzarella, and sweet basil leaves.",
        category: "Italian",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 950
    },
    {
        _id: "148",
        name: "Farmhouse Garden Fresh Pizza",
        image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Vegetarian_Pizza.jpg",
        price: 320,
        description: "Loaded with crunchy bell peppers, red onions, ripe tomatoes, mushrooms, and golden sweet corn.",
        category: "Italian",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 780
    },
    {
        _id: "149",
        name: "Quattro Formaggi (Four Cheese) Pizza",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/960px-Pizza-3007395.jpg",
        price: 360,
        description: "Decadent blend of mozzarella, cheddar, gorgonzola, and shaved parmesan on crispy crust.",
        category: "Italian",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 620
    },
    {
        _id: "150",
        name: "Paneer Makhani Fusion Pizza",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg/960px-Eq_it-na_pizza-margherita_sep2005_sml.jpg",
        price: 340,
        description: "Fusion pizza topped with marinated tandoori paneer cubes, capsicum, and makhani drizzle.",
        category: "Italian",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 840
    },
    {
        _id: "151",
        name: "Classic Penne Arrabbiata",
        image: "food_penne_arrabbiata.jpg",
        price: 240,
        description: "Al dente penne pasta tossed in spicy fiery garlic, red chilli flakes, and crushed tomato sauce.",
        category: "Italian",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 710
    },
    {
        _id: "152",
        name: "Fettuccine Alfredo Cream",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Fettuccine_Alfredo_originals.jpg/960px-Fettuccine_Alfredo_originals.jpg",
        price: 260,
        description: "Silky fettuccine ribbons smothered in rich parmesan butter garlic cream sauce.",
        category: "Italian",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 830
    },
    {
        _id: "153",
        name: "Spaghetti Aglio Olio e Peperoncino",
        image: "food_aglio_olio.jpg",
        price: 250,
        description: "Classic Roman spaghetti tossed with extra virgin olive oil, sliced golden garlic, and fresh parsley.",
        category: "Italian",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 520
    },
    {
        _id: "154",
        name: "Genovese Creamy Pesto Penne",
        image: "food_pesto_pasta.jpg",
        price: 275,
        description: "Fragrant basil pine nut pesto sauce tossed with al dente penne and cherry tomatoes.",
        category: "Italian",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 460
    },
    {
        _id: "155",
        name: "Wild Mushroom & Parmesan Risotto",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Risotto_with_speck_and_goat_cheese_%286101067436%29.jpg/960px-Risotto_with_speck_and_goat_cheese_%286101067436%29.jpg",
        price: 310,
        description: "Slow-simmered arborio rice with porcini and cremini mushrooms, butter, and grana padano.",
        category: "Italian",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 340
    },
    {
        _id: "156",
        name: "BBQ Chicken Fiesta Pizza",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Chicken_BBQ_Pizza.jpg",
        price: 380,
        description: "Smoky barbecue glazed chicken chunks, red onions, bell peppers, and bubbling mozzarella.",
        category: "Italian",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 890
    },
    {
        _id: "157",
        name: "Peri Peri Chicken Pizza",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Supreme_pizza.jpg/960px-Supreme_pizza.jpg",
        price: 395,
        description: "Spicy shredded chicken, jalapeños, red paprika, and peri peri seasoned cheese crust.",
        category: "Italian",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 760
    },
    {
        _id: "158",
        name: "Creamy Chicken Alfredo Penne",
        image: "food_alfredo_pasta.jpg",
        price: 320,
        description: "Penne tossed with tender grilled chicken strips in rich garlic parmesan cream sauce.",
        category: "Italian",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 810
    },
    {
        _id: "159",
        name: "Chicken Carbonara Spaghetti",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/960px-Espaguetis_carbonara.jpg",
        price: 340,
        description: "Spaghetti tossed with crispy cured chicken bits, egg yolk cream, black pepper, and parmesan.",
        category: "Italian",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 470
    },
    {
        _id: "160",
        name: "Classic Venetian Tiramisu",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tiramisu_-_Raffaele_Diomede.jpg/960px-Tiramisu_-_Raffaele_Diomede.jpg",
        price: 220,
        description: "Espresso-soaked ladyfinger biscuits layered with whipped mascarpone cream and dusted with dark cocoa.",
        category: "Italian",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 930
    },
    {
        _id: "161",
        name: "Hyderabadi Dum Veg Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Vegetable_Biryani%2C_Hyderabad.jpg/960px-Vegetable_Biryani%2C_Hyderabad.jpg",
        price: 240,
        description: "Aromatic long grain basmati rice layered with garden veggies, mint, saffron, and slow-cooked in dum seal.",
        category: "Biryani",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1120
    },
    {
        _id: "162",
        name: "Awadhi Paneer Tikka Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Paneer_tikka.jpg/960px-Paneer_tikka.jpg",
        price: 275,
        description: "Royal Awadhi style biryani loaded with charcoal-grilled paneer tikka, caramelized onions, and kewra water.",
        category: "Biryani",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 840
    },
    {
        _id: "163",
        name: "Soya Chaap Dum Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Soya_Chaap_dish.jpg",
        price: 260,
        description: "Spicy marinated tandoori chaap pieces layered with saffron basmati rice and roasted cashews.",
        category: "Biryani",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 690
    },
    {
        _id: "164",
        name: "Kathal (Jackfruit) Dum Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/India_food.jpg/960px-India_food.jpg",
        price: 250,
        description: "Traditional Mughlai tender raw jackfruit cooked with royal biryani spices and mint.",
        category: "Biryani",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 390
    },
    {
        _id: "165",
        name: "Kolkata Royal Egg Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/1/16/Egg_Biryani_in_a_restaurant.jpg",
        price: 220,
        description: "Fragrant basmati rice served with boiled roasted eggs and golden fried spiced potato.",
        category: "Biryani",
        isVeg: false,
        rating: 4.7,
        reviewsCount: 580
    },
    {
        _id: "166",
        name: "Hyderabadi Chicken Dum Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/960px-%22Hyderabadi_Dum_Biryani%22.jpg",
        price: 310,
        description: "Authentic kacchi yakhni chicken marinated in spices and yogurt, slow-cooked on dum with saffron rice.",
        category: "Biryani",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 1650
    },
    {
        _id: "167",
        name: "Lucknowi Murgh Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Chicken_Biriyani.jpg/960px-Chicken_Biriyani.jpg",
        price: 330,
        description: "Mild, fragrant Awadhi style chicken biryani infused with rose water, green cardamom, and ghee.",
        category: "Biryani",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 820
    },
    {
        _id: "168",
        name: "Chicken Tikka Boneless Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/960px-Chicken_tikka_masala_%28cropped%29.jpg",
        price: 345,
        description: "Tender roasted boneless chicken tikka tossed in spicy masala and layered with saffron basmati rice.",
        category: "Biryani",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 970
    },
    {
        _id: "169",
        name: "Awadhi Mutton Dum Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/23/A_home_made_plate_of_mutton_biryani_served_with_chicken_kassa_cooked_in_the_bengali_style.jpg",
        price: 420,
        description: "Slow-cooked tender baby mutton pieces layered with royal saffron basmati rice and fried onions.",
        category: "Biryani",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 1240
    },
    {
        _id: "170",
        name: "Mutton Keema Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Bengali_Mutton_Curry.JPG/960px-Bengali_Mutton_Curry.JPG",
        price: 390,
        description: "Rich spiced minced mutton slow-simmered with aromatic long grain rice and whole spices.",
        category: "Biryani",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 540
    },
    {
        _id: "171",
        name: "Prawns Masala Biryani",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/30/Prawn_Biryani%2C_Hyderabad.jpg",
        price: 430,
        description: "Coastal style juicy prawns cooked in coastal spices and layered with fragrant basmati rice.",
        category: "Biryani",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 460
    },
    {
        _id: "172",
        name: "Jeera Rice with Dal Tadka Combo",
        image: "food_dal_tadka.jpg",
        price: 180,
        description: "Steamy cumin tempered basmati rice paired with yellow arhar dal tempered in desi ghee.",
        category: "Biryani",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 790
    },
    {
        _id: "173",
        name: "Delhi Special Chhole Bhature",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Chhole_Bhature_served_in_North_India.jpg",
        price: 160,
        description: "Two fluffy golden fried bhature served with spicy pindi chhole, pickled chillies, and onion salad.",
        category: "Street Food",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1480
    },
    {
        _id: "174",
        name: "Mumbai Butter Pav Bhaji",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/34/Bhaji_pav_2.jpg",
        price: 150,
        description: "Mashed spiced vegetable bhaji cooked in copious Amul butter served with two soft toasted pavs.",
        category: "Street Food",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 1350
    },
    {
        _id: "175",
        name: "Crispy Aloo Tikki Chaat",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Aloo_Tikki_served_with_chutneys.jpg/960px-Aloo_Tikki_served_with_chutneys.jpg",
        price: 110,
        description: "Golden shallow-fried spiced potato patties topped with sweet tamarind chutney, green mint chutney, and curd.",
        category: "Street Food",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 920
    },
    {
        _id: "176",
        name: "Dahi Bhalla Papdi Chaat",
        image: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Dahi_bhalla_or_dahi_wada_or_dahi_bada.PNG",
        price: 130,
        description: "Soft lentil dumplings and crispy papdis drenched in sweet spiced yogurt, pomegranate, and sev.",
        category: "Street Food",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 860
    },
    {
        _id: "177",
        name: "Steamed Veg Darjeeling Momos (6 pcs)",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Steamed_Momos_-_KOLKATA.jpg",
        price: 120,
        description: "Delicate thin-wrapper dumplings filled with finely chopped cabbage, carrots, onions, and scallions.",
        category: "Street Food",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 1040
    },
    {
        _id: "178",
        name: "Fried Veg Momos (6 pcs)",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_momos_of_Salem.jpg",
        price: 135,
        description: "Crispy deep-fried vegetable dumplings served with fiery red chilli garlic dip and mayo.",
        category: "Street Food",
        isVeg: true,
        rating: 4.7,
        reviewsCount: 780
    },
    {
        _id: "179",
        name: "Kurkure Paneer Momos (6 pcs)",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/HK_SYP_%E8%A5%BF%E7%87%9F%E7%9B%A4_Sai_Ying_Pun_Kwan_Yick_Building_%E5%90%8D%E6%98%9F%E6%B5%B7%E9%AE%AE%E9%85%92%E5%AE%B6_Star_Seafood_Restaurant_food_%E5%90%9E%E9%BA%B5_Wonton_dim_sum_October_2020_SS2_01.jpg/960px-HK_SYP_%E8%A5%BF%E7%87%9F%E7%9B%A4_Sai_Ying_Pun_Kwan_Yick_Building_%E5%90%8D%E6%98%9F%E6%B5%B7%E9%AE%AE%E9%85%92%E5%AE%B6_Star_Seafood_Restaurant_food_%E5%90%9E%E9%BA%B5_Wonton_dim_sum_October_2020_SS2_01.jpg",
        price: 165,
        description: "Crunchy cornflake crusted paneer dumplings fried to golden perfection with spicy schezwan sauce.",
        category: "Street Food",
        isVeg: true,
        rating: 4.9,
        reviewsCount: 910
    },
    {
        _id: "180",
        name: "Steamed Chicken Momos (6 pcs)",
        image: "https://upload.wikimedia.org/wikipedia/commons/0/05/Chicken_Momo_-_Howrah_2013-10-10_3254.JPG",
        price: 155,
        description: "Juicy chicken mince seasoned with ginger, garlic, and coriander inside steamed dumplings.",
        category: "Street Food",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 1210
    },
    {
        _id: "181",
        name: "Fried Chicken Momos (6 pcs)",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Fried-Chicken-Set.jpg/960px-Fried-Chicken-Set.jpg",
        price: 170,
        description: "Crispy golden fried chicken dumplings served with spicy garlic tomato chutney.",
        category: "Street Food",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 890
    },
    {
        _id: "182",
        name: "Kurkure Chicken Momos (6 pcs)",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chicken_Chilli.JPG/960px-Chicken_Chilli.JPG",
        price: 185,
        description: "Extra crispy crumb-coated chicken momos fried crunchy on the outside, juicy on the inside.",
        category: "Street Food",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 1140
    },
    {
        _id: "183",
        name: "Paneer Kathi Roll",
        image: "food_paneer_roll.jpg",
        price: 140,
        description: "Soft layered paratha rolled with roasted spiced paneer, onions, capsicum, and mint mayonnaise.",
        category: "Street Food",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 740
    },
    {
        _id: "184",
        name: "Double Egg Chicken Roll",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Chicken_wrap.jpg/960px-Chicken_wrap.jpg",
        price: 185,
        description: "Crispy paratha lined with two eggs and stuffed with spicy tandoori chicken chunks and pickled onions.",
        category: "Street Food",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 1080
    },
    {
        _id: "185",
        name: "Mutton Seekh Kebab Roll",
        image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Seekh_Kebab.JPG",
        price: 220,
        description: "Tender minced lamb seekh kebab wrapped in hot rumali roti with lemon juice and chaat masala.",
        category: "Street Food",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 810
    },
    {
        _id: "186",
        name: "Amritsari Kulcha with Chhole",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Chole_Kulcha_Meal_-_Order_Food_Online_in_Mumbai_%2831013272937%29.jpg/960px-Chole_Kulcha_Meal_-_Order_Food_Online_in_Mumbai_%2831013272937%29.jpg",
        price: 175,
        description: "Stuffed tandoori aloo-onion kulcha baked crisp with butter and served with tangy Amritsari chhole.",
        category: "Street Food",
        isVeg: true,
        rating: 4.8,
        reviewsCount: 960
    },
    {
        _id: "187",
        name: "Old Delhi Butter Chicken",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg/960px-Butter_Chicken_%26_Butter_Naan_-_Home_-_Chandigarh_-_India_-_0006.jpg",
        price: 340,
        description: "Tender tandoori chicken cooked in velvety, mildly sweet tomato-butter-cashew gravy with fenugreek.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 1820
    },
    {
        _id: "188",
        name: "Chicken Tikka Masala",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Chicken_tikka_masala_%28cropped%29.jpg/960px-Chicken_tikka_masala_%28cropped%29.jpg",
        price: 330,
        description: "Charcoal-roasted boneless chicken tikka cooked in spicy onion-tomato-capsicum gravy.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 1420
    },
    {
        _id: "189",
        name: "Tandoori Murgh (Half)",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Chickentandoori.jpg",
        price: 290,
        description: "Classic bone-in chicken marinated in hung yogurt, Kashmiri red chilli, mustard oil, and tandoori spices.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 980
    },
    {
        _id: "190",
        name: "Tandoori Murgh (Full)",
        image: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Tandoori_platter.jpg",
        price: 490,
        description: "Whole tandoori chicken roasted to juicy perfection in clay oven served with mint dip and laccha onion.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 1250
    },
    {
        _id: "191",
        name: "Kadhai Chicken",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Punjabi_Chicken_Karahi.JPG/960px-Punjabi_Chicken_Karahi.JPG",
        price: 320,
        description: "Juicy chicken morsels tossed in high-heat wok with bell peppers, fresh tomatoes, and crushed coriander seeds.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 890
    },
    {
        _id: "192",
        name: "Mughlai Chicken Korma",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Chicken_Korma.JPG",
        price: 350,
        description: "Slow-simmered chicken in rich white almond, cashew, and saffron gravy infused with green cardamom.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 730
    },
    {
        _id: "193",
        name: "Chicken Rara Punjabi",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chicken_rara_gravy.JPG",
        price: 360,
        description: "Unique combination of succulent chicken pieces cooked in thick spicy minced chicken keema gravy.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 860
    },
    {
        _id: "194",
        name: "Kashmiri Mutton Rogan Josh",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Rogan_Josh_Kashmiri.jpg/960px-Rogan_Josh_Kashmiri.jpg",
        price: 430,
        description: "Prime mutton pieces braised in authentic Kashmiri gravy with brown onions, yogurt, and aromatic spices.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 1340
    },
    {
        _id: "195",
        name: "Bhuna Gosht",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Bengali_Mutton_Curry.JPG/960px-Bengali_Mutton_Curry.JPG",
        price: 440,
        description: "Tender mutton slow-cooked with roasted spices, onions, and ginger until thick and richly coated.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 680
    },
    {
        _id: "196",
        name: "Mutton Seekh Kebab (4 pcs)",
        image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Seekh_Kebab.JPG",
        price: 320,
        description: "Minced spiced lamb skewers grilled over charcoal embers, served with onion rings and lemon.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 920
    },
    {
        _id: "197",
        name: "Chicken Malai Tikka (6 pcs)",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/31/Malai_chicken_tikka.JPG",
        price: 295,
        description: "Boneless chicken cubes marinated in heavy cream, hung curd, cheese, and mild white pepper.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 790
    },
    {
        _id: "198",
        name: "Amritsari Crispy Fish Fry",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Fish_fry_%2890626%29.jpg",
        price: 350,
        description: "Fish fillets coated in seasoned gram flour and carom seeds (ajwain), deep-fried crispy golden.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 870
    },
    {
        _id: "199",
        name: "Goan Fish Curry",
        image: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Goan_typical_meal_--_fish%2C_curry_and_rice.jpg",
        price: 380,
        description: "Fresh fish simmered in tangy, spicy coconut-tamarind gravy with Kashmiri chillies and curry leaves.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.8,
        reviewsCount: 640
    },
    {
        _id: "200",
        name: "Masala Prawns Curry",
        image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/King_prawn_curry_-_Sunoso.jpg",
        price: 420,
        description: "Plump juicy prawns cooked in coastal onion-tomato gravy with mustard seeds and fresh curry leaves.",
        category: "Non-Veg Specials",
        isVeg: false,
        rating: 4.9,
        reviewsCount: 710
    }
];

