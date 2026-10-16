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

const targets = [
  {
    name: 'Tandoori Murgh (Full)',
    file: 'food_tandoori_murgh_full.jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tandoori_Chicken.jpg'
  },
  {
    name: 'Goan Fish Curry',
    file: 'food_goan_fish_curry.jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/FISH_CURRY.jpg'
  },
  {
    name: 'Haryali Soya Chaap',
    file: 'food_haryali_soya_chaap.jpg',
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hariyali_Paneer_Tikka.jpg'
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
  for (const t of targets) {
    const front = path.join(frontendImagesDir, t.file);
    const back = path.join(backendUploadsDir, t.file);
    try {
      await downloadWithRedirect(t.url, front);
      fs.copyFileSync(front, back);
      console.log(`✅ SUCCESS [${t.name}] saved to ${t.file} (size: ${fs.statSync(front).size} B)`);
    } catch (err) {
      console.error(`❌ FAILED [${t.name}]:`, err.message);
    }
  }
}

run();
