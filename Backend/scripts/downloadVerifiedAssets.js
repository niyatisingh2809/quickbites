import { downloadImage } from './wikimediaFinder.js';
import fs from 'fs';
import path from 'path';

const downloads = [
  {
    name: 'food_paneer_cheese_dosa.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Cheese_paneer_dosa.jpg'
  },
  {
    name: 'food_onion_tomato_uttapam.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Tomato_onion_Uttapam.jpg'
  },
  {
    name: 'food_vanilla_shake.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Vanilla_milkshake_at_Lunchbox_Laboratories.jpg'
  },
  {
    name: 'food_kitkat_shake.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Chocolate_milkshake_..._%F0%9F%98%8B.jpg'
  },
  {
    name: 'food_kiwi_green_juice.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Kiwi_Smoothie.jpg'
  },
  {
    name: 'food_pomegranate_juice.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Pomegranate_juice_with_slice.jpg'
  },
  {
    name: 'food_coconut_water.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Tender_coconut_water.jpg'
  },
  {
    name: 'food_caramel_macchiato.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Caramel_Latte_Macchiato.jpg'
  },
  {
    name: 'food_veg_thali.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Indian_veg_thali_20201012.jpg'
  },
  {
    name: 'food_paneer_butter_masala.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Paneer_Butter_Masala_3.jpg'
  },
  {
    name: 'food_dal_makhani.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Dal_Makhani_along_with_Naan.jpg'
  },
  {
    name: 'food_hakka_noodles.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Tasty_hakka_noodles_image.jpg'
  },
  {
    name: 'food_schezwan_noodles.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Schezwan_Noodles.jpg'
  },
  {
    name: 'food_pad_thai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Thai-Pad-Thai_2023-06-04.jpg'
  },
  {
    name: 'food_black_forest_pastry.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Black_Forest_Pastry.jpg'
  },
  {
    name: 'food_cheesecake.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Cheesecake_with_slice_cut_out.jpg'
  },
  {
    name: 'food_corn_cheese_sandwich.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Corn_veg_sandwich_%282026%29.jpg'
  },
  {
    name: 'food_veg_club_sandwich.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Vegetable_grill_sandwich-Ahmedabad-Gujarat-0005.jpg'
  },
  {
    name: 'food_sprout_salad.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Sprouted_Moong_Salad.JPG'
  },
  {
    name: 'food_chickpea_salad.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Autumn_Chickpea_Salad_%283986173540%29.jpg'
  },
  {
    name: 'food_affogato.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Affogato.JPG'
  },
  {
    name: 'food_iced_americano.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Iced_americano.jpg'
  }
];

async function main() {
  const uploadDir = path.resolve('Backend/uploads');
  const frontendAssetDir = path.resolve('Frontend/src/assets');

  // Copy local confirmed items first
  if (fs.existsSync(path.join(uploadDir, 'test_wiki_rava.jpg'))) {
    fs.copyFileSync(path.join(uploadDir, 'test_wiki_rava.jpg'), path.join(uploadDir, 'food_onion_rava_dosa.jpg'));
    fs.copyFileSync(path.join(uploadDir, 'test_wiki_rava.jpg'), path.join(frontendAssetDir, 'food_onion_rava_dosa.jpg'));
    console.log('✅ Onion Rava Dosa copied from confirmed test_wiki_rava.jpg');
  }

  // Preserve cake photo for Cake category
  if (fs.existsSync(path.join(uploadDir, 'food_kitkat_shake.jpg'))) {
    fs.copyFileSync(path.join(uploadDir, 'food_kitkat_shake.jpg'), path.join(uploadDir, 'food_chocolate_truffle_cake.jpg'));
    fs.copyFileSync(path.join(uploadDir, 'food_kitkat_shake.jpg'), path.join(frontendAssetDir, 'food_chocolate_truffle_cake.jpg'));
    console.log('✅ Preserved chocolate cake photo as food_chocolate_truffle_cake.jpg');
  }

  // Preserve rainbow salad photo for Salad category
  if (fs.existsSync(path.join(uploadDir, 'food_kiwi_green_juice.jpg'))) {
    fs.copyFileSync(path.join(uploadDir, 'food_kiwi_green_juice.jpg'), path.join(uploadDir, 'food_rainbow_salad.jpg'));
    fs.copyFileSync(path.join(uploadDir, 'food_kiwi_green_juice.jpg'), path.join(frontendAssetDir, 'food_rainbow_salad.jpg'));
    console.log('✅ Preserved salad photo as food_rainbow_salad.jpg');
  }

  for (const item of downloads) {
    const destBackend = path.join(uploadDir, item.name);
    const destFrontend = path.join(frontendAssetDir, item.name);
    try {
      console.log(`Downloading ${item.name}...`);
      await downloadImage(item.url, destBackend);
      fs.copyFileSync(destBackend, destFrontend);
      console.log(`✅ Finished: ${item.name}`);
    } catch (e) {
      console.error(`❌ Failed: ${item.name} (${e.message})`);
    }
  }

  console.log('ALL DOWNLOADS COMPLETE!');
}

main();
