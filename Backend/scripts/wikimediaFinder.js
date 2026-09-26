import https from 'https';
import fs from 'fs';

const USER_AGENT = 'QuickBitesFoodDeliveryApp/1.0 (educational student project; contact: quickbites2026@gmail.com)';

export function searchFileTitles(query, limit = 5) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(query);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&srnamespace=6&srlimit=${limit}&format=json`;

    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const results = (json.query && json.query.search) ? json.query.search.map(s => s.title) : [];
          resolve(results);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

export function getFileUrl(fileTitle) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(fileTitle);
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encoded}&prop=imageinfo&iiprop=url|mime&format=json`;

    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query ? json.query.pages : {};
          const page = Object.values(pages)[0];
          if (page && page.imageinfo && page.imageinfo[0]) {
            resolve(page.imageinfo[0].url);
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

export function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(destPath)));
      file.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}
