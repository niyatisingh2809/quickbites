import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");
const frontendAssetsDir = path.join(__dirname, "../../Frontend/src/assets");

const dishesToDownload = [
  // Salad (2)
  {
    filename: "food_quinoa_salad.jpg",
    url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_fruit_salad.jpg",
    url: "https://images.unsplash.com/photo-1568158879083-c42860933ed7?w=800&auto=format&fit=crop&q=80"
  },

  // Rolls (5)
  {
    filename: "food_spring_rolls.jpg",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_aloo_frankie.jpg",
    url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_corn_cheese_roll.jpg",
    url: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_schezwan_roll.jpg",
    url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_mushroom_roll.jpg",
    url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80"
  },

  // Deserts (5)
  {
    filename: "food_gulab_jamun.jpg",
    url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_rasmalai.jpg",
    url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_choco_lava.jpg",
    url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_kulfi_falooda.jpg",
    url: "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_mango_panna_cotta.jpg",
    url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80"
  },

  // Sandwich (4)
  {
    filename: "food_paneer_sandwich.jpg",
    url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_spinach_corn_toast.jpg",
    url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_jalapeno_sandwich.jpg",
    url: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_egg_mayo_sandwich.jpg",
    url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80"
  },

  // Cake (2)
  {
    filename: "food_pineapple_pastry.jpg",
    url: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_hazelnut_cake.jpg",
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80"
  },

  // Pure Veg (3)
  {
    filename: "food_kadhai_paneer.jpg",
    url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_palak_paneer.jpg",
    url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_malai_kofta.jpg",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80"
  },

  // Pasta (5)
  {
    filename: "food_alfredo_pasta.jpg",
    url: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_pesto_pasta.jpg",
    url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_mac_and_cheese.jpg",
    url: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_peri_peri_pasta.jpg",
    url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281084?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_aglio_olio.jpg",
    url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80"
  },

  // Noodles (2)
  {
    filename: "food_singapore_noodles.jpg",
    url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80"
  },
  {
    filename: "food_pan_fried_noodles.jpg",
    url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80"
  },

  // South Indian (1)
  {
    filename: "food_podi_dosa.jpg",
    url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80"
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const request = protocol.get(url, { headers: { "User-Agent": "QuickBites/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
    });
    request.on("error", reject);
  });
}

async function main() {
  console.log(`Starting download of ${dishesToDownload.length} new dish photos...`);
  for (const item of dishesToDownload) {
    const backendPath = path.join(uploadsDir, item.filename);
    const frontendPath = path.join(frontendAssetsDir, item.filename);

    try {
      await downloadFile(item.url, backendPath);
      fs.copyFileSync(backendPath, frontendPath);
      const stat = fs.statSync(backendPath);
      console.log(`✅ Downloaded: ${item.filename} (${(stat.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`❌ Failed: ${item.filename}`, err.message);
    }
  }
  console.log("All assets synchronized successfully!");
}

main();
