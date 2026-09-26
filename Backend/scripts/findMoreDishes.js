import { searchFileTitles, getFileUrl } from './wikimediaFinder.js';

const queries = [
  'Green kiwi smoothie',
  'Kiwi smoothie',
  'Green juice glass',
  'Black forest cake slice',
  'Black forest pastry',
  'Cheesecake slice',
  'Veg sandwich grilled',
  'Club sandwich vegetarian',
  'Sprout salad indian',
  'Moong sprout salad',
  'Paneer tikka masala',
  'Dal makhani',
  'Affogato',
  'Iced Americano coffee'
];

async function run() {
  for (const q of queries) {
    try {
      const titles = await searchFileTitles(q, 3);
      console.log(`\n=== QUERY: ${q} ===`);
      for (const t of titles) {
        const url = await getFileUrl(t);
        console.log(`  * ${t} -> ${url}`);
      }
    } catch (e) {
      console.error(`Error for ${q}:`, e.message);
    }
  }
}

run();
