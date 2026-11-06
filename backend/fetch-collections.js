
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_URL =
  "https://api.dermfix.in/api/shiprocket/catalog/collections";

async function fetchAllCollections() {
  try {
    let page = 1;
    const limit = 100;
    let allCollections = [];
    let total = 0;

    do {
      const response = await fetch(
        `${API_URL}?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const collections = result.data?.collections || [];

      total = result.data?.total || 0;
      allCollections.push(...collections);

      console.log(
        `Fetched page ${page}: ${collections.length} collections`
      );

      if (collections.length === 0) break;

      page++;
    } while (allCollections.length < total);

    const outputPath = path.join(__dirname, "collections.json");

    fs.writeFileSync(
      outputPath,
      JSON.stringify(allCollections, null, 2)
    );

    console.log("\nCollections JSON generated successfully!");
    console.log(`Total collections: ${allCollections.length}`);
    console.log(`Saved to: ${outputPath}`);

  } catch (error) {
    console.error("Collection fetching failed:", error.message);
  }
}

fetchAllCollections();
