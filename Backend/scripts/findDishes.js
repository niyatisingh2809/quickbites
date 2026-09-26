import { searchFileTitles, getFileUrl } from './wikimediaFinder.js';

const queries = [
  'Tomato Onion Uttapam',
  'Uttapam',
  'Paneer dosa',
  'Vanilla milkshake',
  'Pomegranate juice',
  'Tender coconut water',
  'Indian veg thali',
  'Caramel macchiato',
  'Kiwi juice',
  'Chocolate milkshake',
  'Hakka noodles',
  'Schezwan noodles',
  'Pad thai',
  'Paneer butter masala',
  'Dal makhani',
  'Black forest pastry',
  'Cheesecake slice',
  'Veg club sandwich',
  'Sprout salad'
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
