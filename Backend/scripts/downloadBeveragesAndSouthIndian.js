import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");
const frontendAssetsDir = path.join(__dirname, "../../Frontend/src/assets");

const items = [
  // COFFEE (10 distinct images)
  { file: "food_hot_cappuccino.jpg", id: "1534778101976-62847782c213" },
  { file: "food_iced_cold_coffee.jpg", id: "1517701604599-bb29b565090c" },
  { file: "food_cafe_mocha.jpg", id: "1578314675249-a6910f80cc4e" },
  { file: "food_espresso_shot.jpg", id: "1510591509098-f4fdc6d0ff04" },
  { file: "food_caramel_macchiato.jpg", id: "1485808191629-59856a049d86" },
  { file: "food_vanilla_iced_latte.jpg", id: "1461023058943-07fcbe16d735" },
  { file: "food_cold_brew.jpg", id: "1517701550927-30cf4ba1dba5" },
  { file: "food_hazelnut_frappe.jpg", id: "1572442388796-11668a67e53d" },
  { file: "food_flat_white.jpg", id: "1577968897966-3d4325b36b61" },
  { file: "food_irish_coffee.jpg", id: "1544787219-7f47ccb76574" },

  // SHAKES (10 distinct images)
  { file: "food_strawberry_shake.jpg", id: "1572490122747-3968b75cc699" },
  { file: "food_oreo_shake.jpg", id: "1579954115545-a95591f28bfc" },
  { file: "food_belgian_chocolate_shake.jpg", id: "1563805042-7684c019e1cb" },
  { file: "food_mango_shake.jpg", id: "1623065422902-30a2d299bbe4" },
  { file: "food_kitkat_shake.jpg", id: "1586985289688-ca3cf47d3e6e" },
  { file: "food_nutella_shake.jpg", id: "1541658016709-82535e94bc69" },
  { file: "food_vanilla_shake.jpg", id: "1568901346375-23c9450c58cd" },
  { file: "food_blueberry_shake.jpg", id: "1553530666-ba11a7da3888" },
  { file: "food_butterscotch_shake.jpg", id: "1577805947697-89e18249d767" },
  { file: "food_banana_pb_shake.jpg", id: "1551024709-8f23befc6f87" },

  // JUICE (10 distinct images)
  { file: "food_orange_juice.jpg", id: "1613478223719-2ab802602423" },
  { file: "food_watermelon_juice.jpg", id: "1589733955941-5eeaf752f6dd" },
  { file: "food_mango_juice.jpg", id: "1546173159-315724a31696" },
  { file: "food_pomegranate_juice.jpg", id: "1559839914-1b34645a890c" },
  { file: "food_pineapple_juice.jpg", id: "1525385133512-2f3bdd039054" },
  { file: "food_kiwi_green_juice.jpg", id: "1540420773420-3366772f4999" },
  { file: "food_mosambi_juice.jpg", id: "1534353473418-4cfa6c56fd38" },
  { file: "food_abc_juice.jpg", id: "1595981267035-7b04ca84a82d" },
  { file: "food_lemon_mint_juice.jpg", id: "1513558161293-cdaf765ed2fd" },
  { file: "food_coconut_water.jpg", id: "1544787219-7f47ccb76574" },

  // SOUTH INDIAN (distinct images)
  { file: "food_masala_dosa.jpg", id: "1589301760014-d929f3979dbc" },
  { file: "food_plain_dosa.jpg", id: "1668236543090-82eba5ee5976" },
  { file: "food_onion_rava_dosa.jpg", id: "1626082927389-6cd097cdc6ec" },
  { file: "food_paneer_cheese_dosa.jpg", id: "1601050690597-df0568f70950" },
  { file: "food_onion_tomato_uttapam.jpg", id: "1645177628172-a94c1f96e6db" },
  { file: "food_veg_upma.jpg", id: "1606491956689-2ea866880c84" },
  { file: "food_filter_coffee.jpg", id: "1514432324607-a09d9b4aefdd" }
];

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      response.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
      fileStream.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  console.log(`Starting download of ${items.length} food images...`);
  for (const item of items) {
    const url = `https://images.unsplash.com/photo-${item.id}?w=600&auto=format&fit=crop&q=80`;
    const backendDest = path.join(uploadDir, item.file);
    const frontendDest = path.join(frontendAssetsDir, item.file);

    try {
      await downloadImage(url, backendDest);
      fs.copyFileSync(backendDest, frontendDest);
      console.log(`✅ Downloaded: ${item.file}`);
    } catch (err) {
      console.error(`❌ Error downloading ${item.file}:`, err.message);
    }
  }
  console.log("All image downloads completed!");
}

main();
