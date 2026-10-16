import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const dishes = [
  // Non-Veg Specials
  { name: "Old Delhi Butter Chicken", file: "food_butter_chicken.jpg", photoId: "photo-1603894584373-5ac82b2ae398" },
  { name: "Chicken Tikka Masala", file: "food_chicken_tikka_masala.jpg", photoId: "photo-1565557623262-b51c2513a641" },
  { name: "Tandoori Murgh (Half)", file: "food_tandoori_murgh_half.jpg", photoId: "photo-1626777552726-4a6b54c97e46" },
  { name: "Tandoori Murgh (Full)", file: "food_tandoori_murgh_full.jpg", photoId: "photo-1599488615731-7e5c2823ff28" },
  { name: "Kadhai Chicken", file: "food_kadhai_chicken.jpg", photoId: "photo-1610057099443-fde8c4d50f91" },
  { name: "Mughlai Chicken Korma", file: "food_chicken_korma.jpg", photoId: "photo-1546833999-b9f581a1996d" },
  { name: "Chicken Rara Punjabi", file: "food_chicken_rara.jpg", photoId: "photo-1626074353765-517a681e40be" },
  { name: "Kashmiri Mutton Rogan Josh", file: "food_mutton_rogan_josh.jpg", photoId: "photo-1545247181-516773cae754" },
  { name: "Bhuna Gosht", file: "food_bhuna_gosht.jpg", photoId: "photo-1588166524941-3bf61a9c41db" },
  { name: "Mutton Seekh Kebab (4 pcs)", file: "food_mutton_seekh_kebab.jpg", photoId: "photo-1555939594-58d7cb561ad1" },
  { name: "Chicken Malai Tikka (6 pcs)", file: "food_chicken_malai_tikka.jpg", photoId: "photo-1567620832903-9fc6debc209f" },
  { name: "Amritsari Crispy Fish Fry", file: "food_amritsari_fish_fry.jpg", photoId: "photo-1534422298391-e4f8c172dddb" },
  { name: "Goan Fish Curry", file: "food_goan_fish_curry.jpg", photoId: "photo-1512058564366-18510be2db19" },
  { name: "Masala Prawns Curry", file: "food_masala_prawns_curry.jpg", photoId: "photo-1559742811-822873691df8" },

  // Biryanis
  { name: "Hyderabadi Dum Veg Biryani", file: "food_veg_biryani.jpg", photoId: "photo-1563379091339-03b21ab4a4f8" },
  { name: "Awadhi Paneer Tikka Biryani", file: "food_paneer_biryani.jpg", photoId: "photo-1633945274405-b6c8069047b0" },
  { name: "Soya Chaap Dum Biryani", file: "food_chaap_biryani.jpg", photoId: "photo-1645177628172-a94c1f96e6db" },
  { name: "Kathal (Jackfruit) Dum Biryani", file: "food_jackfruit_biryani.jpg", photoId: "photo-1589302168068-964664d93dc0" },
  { name: "Kolkata Royal Egg Biryani", file: "food_egg_biryani.jpg", photoId: "photo-1546833998-877b37c2e5c6" },
  { name: "Hyderabadi Chicken Dum Biryani", file: "food_chicken_biryani.jpg", photoId: "photo-1563379091339-03b21ab4a4f8" },
  { name: "Lucknowi Murgh Biryani", file: "food_lucknowi_chicken_biryani.jpg", photoId: "photo-1633945274405-b6c8069047b0" },
  { name: "Chicken Tikka Boneless Biryani", file: "food_chicken_tikka_biryani.jpg", photoId: "photo-1645177628172-a94c1f96e6db" },
  { name: "Awadhi Mutton Dum Biryani", file: "food_mutton_biryani.jpg", photoId: "photo-1589302168068-964664d93dc0" },
  { name: "Mutton Keema Biryani", file: "food_mutton_keema_biryani.jpg", photoId: "photo-1546833998-877b37c2e5c6" },
  { name: "Prawns Masala Biryani", file: "food_prawns_biryani.jpg", photoId: "photo-1559742811-822873691df8" },

  // Street Food
  { name: "Delhi Special Chhole Bhature", file: "food_chhole_bhature.jpg", photoId: "photo-1626132647523-66f5bf380027" },
  { name: "Mumbai Butter Pav Bhaji", file: "food_pav_bhaji.jpg", photoId: "photo-1606491956689-2ea866880c84" },
  { name: "Crispy Aloo Tikki Chaat", file: "food_aloo_tikki.jpg", photoId: "photo-1601050690597-df0568f70950" },
  { name: "Dahi Bhalla Papdi Chaat", file: "food_dahi_bhalla.jpg", photoId: "photo-1625398407796-82650a8c135f" },
  { name: "Steamed Veg Darjeeling Momos (6 pcs)", file: "food_steamed_veg_momos.jpg", photoId: "photo-1534422298391-e4f8c172dddb" },
  { name: "Fried Veg Momos (6 pcs)", file: "food_fried_veg_momos.jpg", photoId: "photo-1498654896293-37aacf113fd9" },
  { name: "Kurkure Paneer Momos (6 pcs)", file: "food_kurkure_paneer_momos.jpg", photoId: "photo-1568901346375-23c9450c58cd" },
  { name: "Steamed Chicken Momos (6 pcs)", file: "food_steamed_chicken_momos.jpg", photoId: "photo-1541544741938-0af808871cc0" },
  { name: "Fried Chicken Momos (6 pcs)", file: "food_fried_chicken_momos.jpg", photoId: "photo-1626082927389-6cd097cdc6ec" },
  { name: "Kurkure Chicken Momos (6 pcs)", file: "food_kurkure_chicken_momos.jpg", photoId: "photo-1562967914-608f82629710" },
  { name: "Double Egg Chicken Roll", file: "food_egg_chicken_roll.jpg", photoId: "photo-1626777552726-4a6b54c97e46" },
  { name: "Mutton Seekh Kebab Roll", file: "food_seekh_kebab_roll.jpg", photoId: "photo-1555939594-58d7cb561ad1" },
  { name: "Amritsari Kulcha with Chhole", file: "food_amritsari_kulcha.jpg", photoId: "photo-1589301760014-d929f3979dbc" },

  // Italian
  { name: "Classic Margherita Pizza", file: "food_margherita_pizza.jpg", photoId: "photo-1604382355076-af4b0eb60143" },
  { name: "Farmhouse Garden Fresh Pizza", file: "food_farmhouse_pizza.jpg", photoId: "photo-1565299624946-b28f40a0ae38" },
  { name: "Quattro Formaggi (Four Cheese) Pizza", file: "food_four_cheese_pizza.jpg", photoId: "photo-1513104890138-7c749659a591" },
  { name: "Paneer Makhani Fusion Pizza", file: "food_paneer_makhani_pizza.jpg", photoId: "photo-1593560708920-61dd98c46a4e" },
  { name: "Fettuccine Alfredo Cream", file: "food_fettuccine_alfredo.jpg", photoId: "photo-1645112411341-6c4fd023714a" },
  { name: "Wild Mushroom & Parmesan Risotto", file: "food_mushroom_risotto.jpg", photoId: "photo-1633964913295-ceb43826e7c9" },
  { name: "BBQ Chicken Fiesta Pizza", file: "food_bbq_chicken_pizza.jpg", photoId: "photo-1574071318508-1cdbab80d002" },
  { name: "Peri Peri Chicken Pizza", file: "food_peri_peri_chicken_pizza.jpg", photoId: "photo-1594007654729-407edc4be65b" },
  { name: "Chicken Carbonara Spaghetti", file: "food_chicken_carbonara.jpg", photoId: "photo-1612874742237-6526221588e3" },
  { name: "Classic Venetian Tiramisu", file: "food_tiramisu.jpg", photoId: "photo-1571877227200-a0d98ea607e9" },

  // Chaap
  { name: "Soya Malai Chaap", file: "food_malai_chaap.jpg", photoId: "photo-1567620832903-9fc6debc209f" },
  { name: "Tandoori Masala Chaap", file: "food_tandoori_chaap.jpg", photoId: "photo-1599488615731-7e5c2823ff28" },
  { name: "Afghani Soya Chaap", file: "food_afghani_chaap.jpg", photoId: "photo-1555939594-58d7cb561ad1" },
  { name: "Achari Soya Chaap", file: "food_achari_chaap.jpg", photoId: "photo-1633945274405-b6c8069047b0" },
  { name: "Haryali Soya Chaap", file: "food_haryali_chaap.jpg", photoId: "photo-1626777552726-4a6b54c97e46" },
  { name: "Soya Chaap Butter Masala Gravy", file: "food_chaap_butter_masala.jpg", photoId: "photo-1603894584373-5ac82b2ae398" },
  { name: "Kadhai Soya Chaap Gravy", file: "food_chaap_kadhai.jpg", photoId: "photo-1610057099443-fde8c4d50f91" },
  { name: "Soya Chaap Rogan Josh (Veg Style)", file: "food_chaap_rogan_josh.jpg", photoId: "photo-1545247181-516773cae754" },
  { name: "Crispy Kurkure Soya Chaap", file: "food_kurkure_chaap.jpg", photoId: "photo-1562967914-608f82629710" },
  { name: "Soya Chaap Kathi Roll", file: "food_chaap_roll.jpg", photoId: "photo-1626777552726-4a6b54c97e46" },

  // Continental
  { name: "Cheesy Garlic Bread", file: "food_cheesy_garlic_bread.jpg", photoId: "photo-1619895092538-128341789043" },
  { name: "Baked Vegetable Au Gratin", file: "food_veg_au_gratin.jpg", photoId: "photo-1543339308-43e59d6b73a6" },
  { name: "Grilled Cottage Cheese Steak", file: "food_paneer_steak.jpg", photoId: "photo-1544025162-d76694265947" },
  { name: "Cream of Mushroom Soup", file: "food_mushroom_soup.jpg", photoId: "photo-1547592166-23ac45744acd" },
  { name: "Crispy Jalapeño Cheese Poppers", file: "food_jalapeno_poppers.jpg", photoId: "photo-1534422298391-e4f8c172dddb" },
  { name: "Herb Grilled Chicken Breast", file: "food_grilled_chicken_breast.jpg", photoId: "photo-1532550907401-a500c9a57435" },
  { name: "Chicken Stroganoff with Buttered Rice", file: "food_chicken_stroganoff.jpg", photoId: "photo-1546833999-b9f581a1996d" },
  { name: "Crispy Fish & Chips", file: "food_fish_and_chips.jpg", photoId: "photo-1579208030886-b937da0925dc" },
  { name: "Grilled Lemon Butter Fish", file: "food_lemon_butter_fish.jpg", photoId: "photo-1519708227418-c8fd9a32b7a2" },
  { name: "Roasted Chicken Caesar Wrap", file: "food_chicken_caesar_wrap.jpg", photoId: "photo-1626777552726-4a6b54c97e46" },
  { name: "Peri Peri Grilled Chicken Skewers", file: "food_peri_peri_skewers.jpg", photoId: "photo-1555939594-58d7cb561ad1" },
  { name: "Spinach & Corn Quesadilla", file: "food_spinach_corn_quesadilla.jpg", photoId: "photo-1618040996337-56904b7850b9" }
];

async function downloadFile(photoId, filename) {
  const url = `https://images.unsplash.com/${photoId}?w=600&auto=format&fit=crop&q=80`;
  const frontDest = path.join(rootDir, 'Frontend/public/images', filename);
  const backDest = path.join(rootDir, 'Backend/uploads', filename);

  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const f1 = fs.createWriteStream(frontDest);
        res.pipe(f1);
        f1.on('finish', () => {
          fs.copyFileSync(frontDest, backDest);
          resolve(true);
        });
        f1.on('error', () => resolve(false));
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

(async () => {
  console.log(`Starting download of ${dishes.length} food photography images...`);
  let downloaded = 0;
  // Deduplicate files so we don't redownload the same file
  const seenFiles = new Set();

  for (const d of dishes) {
    if (!seenFiles.has(d.file)) {
      seenFiles.add(d.file);
      const ok = await downloadFile(d.photoId, d.file);
      if (ok) downloaded++;
      console.log(`[${seenFiles.size}/${dishes.length}] Saved ${d.file}`);
      // small delay between requests
      await new Promise(r => setTimeout(r, 60));
    }
  }

  console.log(`\n🎉 Successfully downloaded and saved ${downloaded} unique food image files locally!`);

  // Update assets.js
  const assetsPath = path.join(rootDir, 'Frontend/src/assets/assets.js');
  let assetsContent = fs.readFileSync(assetsPath, 'utf8');

  // Update category headers in menu_list
  assetsContent = assetsContent.replace(/const menu_chaap = [^;\n]+/, 'import menu_chaap from "./food_tandoori_chaap.jpg"');
  assetsContent = assetsContent.replace(/const menu_continental = [^;\n]+/, 'import menu_continental from "./food_cheesy_garlic_bread.jpg"');
  assetsContent = assetsContent.replace(/const menu_italian = [^;\n]+/, 'import menu_italian from "./food_margherita_pizza.jpg"');
  assetsContent = assetsContent.replace(/const menu_biryani = [^;\n]+/, 'import menu_biryani from "./food_chicken_biryani.jpg"');
  assetsContent = assetsContent.replace(/const menu_street_food = [^;\n]+/, 'import menu_street_food from "./food_chhole_bhature.jpg"');
  assetsContent = assetsContent.replace(/const menu_non_veg = [^;\n]+/, 'import menu_non_veg from "./food_butter_chicken.jpg"');

  // Also copy category images to Frontend/src/assets
  for (const imgName of [
    'food_tandoori_chaap.jpg', 'food_cheesy_garlic_bread.jpg', 'food_margherita_pizza.jpg',
    'food_chicken_biryani.jpg', 'food_chhole_bhature.jpg', 'food_butter_chicken.jpg'
  ]) {
    const src = path.join(rootDir, 'Frontend/public/images', imgName);
    const dst = path.join(rootDir, 'Frontend/src/assets', imgName);
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
  console.log(`✅ Updated ${updatedAssets} dish image mappings in assets.js`);

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
  console.log(`✅ Updated ${updatedSeed} dish image mappings in seedCatalog.js`);
})();
