import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const frontendImagesDir = path.join(rootDir, 'Frontend/public/images');
const backendUploadsDir = path.join(rootDir, 'Backend/uploads');

// Ensure directories exist
if (!fs.existsSync(frontendImagesDir)) fs.mkdirSync(frontendImagesDir, { recursive: true });
if (!fs.existsSync(backendUploadsDir)) fs.mkdirSync(backendUploadsDir, { recursive: true });

// Copy chicken alfredo from existing fettuccine alfredo with chicken
const alfredoSource = path.join(frontendImagesDir, 'food_fettuccine_alfredo.jpg');
if (fs.existsSync(alfredoSource)) {
  fs.copyFileSync(alfredoSource, path.join(frontendImagesDir, 'food_chicken_alfredo_penne.jpg'));
  fs.copyFileSync(alfredoSource, path.join(backendUploadsDir, 'food_chicken_alfredo_penne.jpg'));
  console.log('✅ Created food_chicken_alfredo_penne.jpg from authentic chicken pasta asset');
}

// Download list for dishes that need authentic, distinct food photography
const itemsToFetch = [
  {
    file: 'food_double_egg_chicken_roll.jpg',
    url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_egg_chicken_roll.jpg',
    url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_aloo_frankie.jpg',
    url: 'https://images.unsplash.com/photo-1648838780315-844645e84945?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_schezwan_roll.jpg',
    url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1648838780315-844645e84945?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_soya_chaap_roll.jpg',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_chaap_roll.jpg',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_street_paneer_roll.jpg',
    url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1648838780315-844645e84945?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_chicken_caesar_wrap.jpg',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_spaghetti_aglio_olio.jpg',
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_classic_penne_arrabbiata.jpg',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_genovese_pesto_penne.jpg',
    url: 'https://images.unsplash.com/photo-1597393353415-b3730f3719fe?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_curd.jpg',
    url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_boondi_raita.jpg',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_papad.jpg',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_pickle.jpg',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80'
  },
  {
    file: 'food_kheer.jpg',
    url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80'
  }
];

function downloadUrl(url, targetPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, targetPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(targetPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });
      fileStream.on('error', (err) => {
        fs.unlink(targetPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Starting download of ${itemsToFetch.length} dish photos...`);
  for (const item of itemsToFetch) {
    const frontPath = path.join(frontendImagesDir, item.file);
    const backPath = path.join(backendUploadsDir, item.file);
    try {
      await downloadUrl(item.url, frontPath);
      fs.copyFileSync(frontPath, backPath);
      console.log(`✅ Downloaded: ${item.file}`);
    } catch (e1) {
      console.warn(`Primary failed for ${item.file} (${e1.message}), trying backup...`);
      try {
        await downloadUrl(item.backup, frontPath);
        fs.copyFileSync(frontPath, backPath);
        console.log(`✅ Backup downloaded: ${item.file}`);
      } catch (e2) {
        console.error(`❌ Both failed for ${item.file}:`, e2.message);
      }
    }
  }
  console.log('🎉 Dish image downloads finished!');
}

run();
