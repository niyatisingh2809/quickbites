import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const frontendImagesDir = path.join(rootDir, 'Frontend/public/images');
const backendUploadsDir = path.join(rootDir, 'Backend/uploads');

// Step A: Local copies of verified existing assets
function performLocalCopies() {
  console.log('=== Step A: Performing verified local asset copies ===');
  
  // 1. Masala Dosa: use the authentic crisp dosa photo currently in food_gulab_jamun.jpg
  const dosaSrc = path.join(frontendImagesDir, 'food_gulab_jamun.jpg');
  const dosaDestFront = path.join(frontendImagesDir, 'food_masala_dosa.jpg');
  const dosaDestBack = path.join(backendUploadsDir, 'food_masala_dosa.jpg');
  if (fs.existsSync(dosaSrc)) {
    fs.copyFileSync(dosaSrc, dosaDestFront);
    fs.copyFileSync(dosaSrc, dosaDestBack);
    console.log('✅ Copied verified Masala Dosa image to food_masala_dosa.jpg');
  }

  // 2. Classic Penne Arrabbiata: use verified food_penne_arrabbiata.jpg
  const penneSrc = path.join(frontendImagesDir, 'food_penne_arrabbiata.jpg');
  const penneDestFront = path.join(frontendImagesDir, 'food_classic_penne_arrabbiata.jpg');
  const penneDestBack = path.join(backendUploadsDir, 'food_classic_penne_arrabbiata.jpg');
  if (fs.existsSync(penneSrc)) {
    fs.copyFileSync(penneSrc, penneDestFront);
    fs.copyFileSync(penneSrc, penneDestBack);
    console.log('✅ Copied verified Penne Arrabbiata image to food_classic_penne_arrabbiata.jpg');
  }

  // 3. Street Paneer Kathi Roll: use verified food_paneer_roll.jpg
  const paneerSrc = path.join(frontendImagesDir, 'food_paneer_roll.jpg');
  const paneerDestFront = path.join(frontendImagesDir, 'food_street_paneer_roll.jpg');
  const paneerDestBack = path.join(backendUploadsDir, 'food_street_paneer_roll.jpg');
  if (fs.existsSync(paneerSrc)) {
    fs.copyFileSync(paneerSrc, paneerDestFront);
    fs.copyFileSync(paneerSrc, paneerDestBack);
    console.log('✅ Copied verified Paneer Kathi Roll image to food_street_paneer_roll.jpg');
  }
}

// Step B: Download verified Wikimedia Commons files
const downloads = [
  {
    name: 'Gulab Jamun Warm',
    files: ['food_gulab_jamun.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Two_Gulab_Jamun_in_a_plate_01.jpg'
  },
  {
    name: 'Rasmalai Royal',
    files: ['food_rasmalai.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Rasmalai_3.jpg'
  },
  {
    name: 'Palak Paneer Desi Ghee',
    files: ['food_palak_paneer.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Palak_Paneer_%28Cottage_cheese_in_spinach_gravy%29.jpg'
  },
  {
    name: 'Kurkure Paneer Momos (6 pcs)',
    files: ['food_kurkure_paneer_momos.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Crispy_Momos_on_a_Banana_Leaf.jpg'
  },
  {
    name: 'Double Egg Chicken Roll',
    files: ['food_double_egg_chicken_roll.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Chicken-kathi-roll-recipe.jpg'
  },
  {
    name: 'Cheesy Corn Roll',
    files: ['food_corn_cheese_roll.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Aloo_Corn_Frankie_Roll.jpg'
  },
  {
    name: 'Spinach Corn Toast',
    files: ['food_spinach_corn_toast.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Toasted_brown_bread_with_cheese_stuffing.jpg'
  },
  {
    name: 'Aglio Olio Peperoncino',
    files: ['food_aglio_olio.jpg', 'food_spaghetti_aglio_olio.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Spaghetti_aglio_olio_e_peperoncino_by_matsuyuki_retouched.jpg'
  },
  {
    name: 'Thai Pad Noodles',
    files: ['food_pad_thai.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Phat_Thai_kung_Chang_Khien_street_stall.jpg'
  },
  {
    name: 'Soya Chaap Kathi Roll',
    files: ['food_soya_chaap_roll.jpg', 'food_chaap_roll.jpg'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Achari_chaap_roll_from_Manoj_Naan_Wala%2C_IP_Extension%2C_Delhi_%28July_2025%29.jpg/1280px-Achari_chaap_roll_from_Manoj_Naan_Wala%2C_IP_Extension%2C_Delhi_%28July_2025%29.jpg'
  }
];

function downloadWithRedirect(url, targetPath, hops = 0) {
  if (hops > 8) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'QuickBitesFoodDelivery/2.0 (contact@quickbites.com)'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let nextUrl = res.headers.location;
        if (!nextUrl.startsWith('http')) {
          nextUrl = new URL(nextUrl, url).toString();
        }
        return downloadWithRedirect(nextUrl, targetPath, hops + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} at ${url}`));
      }
      const stream = fs.createWriteStream(targetPath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve(true);
      });
      stream.on('error', (err) => {
        fs.unlink(targetPath, () => {});
        reject(err);
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  performLocalCopies();

  console.log('\n=== Step B: Downloading verified images from Wikimedia Commons ===');
  for (const item of downloads) {
    const primaryFile = item.files[0];
    const frontPath = path.join(frontendImagesDir, primaryFile);
    try {
      await downloadWithRedirect(item.url, frontPath);
      const stat = fs.statSync(frontPath);
      console.log(`✅ [${item.name}] Downloaded ${primaryFile} (${(stat.size / 1024).toFixed(1)} KB)`);

      // Copy to backend uploads and any other alias files
      const backPath = path.join(backendUploadsDir, primaryFile);
      fs.copyFileSync(frontPath, backPath);

      for (let i = 1; i < item.files.length; i++) {
        const extraFile = item.files[i];
        fs.copyFileSync(frontPath, path.join(frontendImagesDir, extraFile));
        fs.copyFileSync(frontPath, path.join(backendUploadsDir, extraFile));
        console.log(`   ↳ Copied alias ${extraFile}`);
      }
    } catch (err) {
      console.error(`❌ [${item.name}] Error downloading: ${err.message}`);
    }
  }
}

run();
