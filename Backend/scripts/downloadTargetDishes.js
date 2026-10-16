import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const frontendImagesDir = path.join(rootDir, 'Frontend/public/images');
const backendUploadsDir = path.join(rootDir, 'Backend/uploads');

const targets = [
  {
    name: 'Tandoori Murgh (Full)',
    file: 'food_tandoori_murgh_full.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Tandoori_chicken_laccha_piyaz.jpg',
    backup: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Goan Fish Curry',
    file: 'food_goan_fish_curry.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Goan_Fish_Curry.jpg',
    backup: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Bhuna Gosht',
    file: 'food_bhuna_gosht.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Mutton_Curry_-_Kolkata_2017-06-17_4492.JPG',
    backup: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Kurkure Paneer Momos (6 pcs)',
    file: 'food_kurkure_paneer_momos.jpg',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    backup: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Fried_momos_of_Salem.jpg'
  },
  {
    name: 'Mutton Keema Biryani',
    file: 'food_mutton_keema_biryani.jpg',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    backup: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Biryani_at_Nawabi_Hyderabad_House.jpg'
  },
  {
    name: 'Haryali Soya Chaap',
    file: 'food_haryali_soya_chaap.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Hariyali_Tikka.jpg',
    backup: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Rajma Chawal',
    file: 'food_rajma_chawal.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Rajma_chawal_from_India.jpg',
    backup: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Lemon Rice',
    file: 'food_lemon_rice.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Lemon_Rice.JPG',
    backup: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Curd Rice',
    file: 'food_curd_rice.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Curd_Rice.JPG',
    backup: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sweet Lassi',
    file: 'food_sweet_lassi.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Lassi.jpg',
    backup: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fresh Lemonade',
    file: 'food_fresh_lemonade.jpg',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    backup: 'https://images.unsplash.com/photo-1523371067-1cfc6fe36a5b?w=600&auto=format&fit=crop&q=80'
  }
];

function downloadUrl(url, targetPath) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) QuickBites/2.0'
      }
    };
    https.get(url, opts, (res) => {
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
  console.log(`Starting download of ${targets.length} dishes...`);
  for (const t of targets) {
    const frontPath = path.join(frontendImagesDir, t.file);
    const backPath = path.join(backendUploadsDir, t.file);
    try {
      await downloadUrl(t.url, frontPath);
      fs.copyFileSync(frontPath, backPath);
      console.log(`✅ [${t.name}] downloaded to ${t.file}`);
    } catch (e1) {
      console.warn(`Primary failed for ${t.file} (${e1.message}), trying backup...`);
      try {
        await downloadUrl(t.backup, frontPath);
        fs.copyFileSync(frontPath, backPath);
        console.log(`✅ [${t.name}] backup downloaded to ${t.file}`);
      } catch (e2) {
        console.error(`❌ Both failed for ${t.file}:`, e2.message);
      }
    }
  }
  console.log('🎉 Target dish downloads finished!');
}

run();
