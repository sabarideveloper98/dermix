
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_URL = "https://api.dermfix.in/api/shiprocket/catalog/products";

async function fetchAllProducts() {
  try {
    let page = 1;
    const limit = 100;
    let allProducts = [];
    let total = 0;

    do {
      const response = await fetch(
        `${API_URL}?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }

      const result = await response.json();

      const products = result.data?.products || [];

      total = result.data?.total || 0;
      allProducts.push(...products);

      console.log(`Fetched page ${page}: ${products.length} products`);

      if (products.length === 0) break;

      page++;
    } while (allProducts.length < total);

    // const outputPath = path.join(__dirname, "product.json");
    const outputPath = path.join(__dirname, "products.json");

    fs.writeFileSync(
      outputPath,
      JSON.stringify(allProducts, null, 2),
      "utf8"
    );

    console.log("\nProduct JSON generated successfully!");
    console.log(`Total products: ${allProducts.length}`);
    console.log(`Saved to: ${outputPath}`);

  } catch (error) {
    console.error("Product fetching failed:", error.message);
  }
}

fetchAllProducts();
