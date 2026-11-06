import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.SHIPROCKET_API_KEY;
const SECRET_KEY = process.env.SHIPROCKET_SECRET_KEY;

const WEBHOOK_URL =
  "https://checkout-api.shiprocket.com/wh/v1/custom/product";

async function syncProducts() {
  try {
    // Validate credentials
    if (!API_KEY || !SECRET_KEY) {
      throw new Error("Missing Shiprocket credentials in .env");
    }

    // Read all products
    const filePath = path.join(__dirname, "products.json");

    if (!fs.existsSync(filePath)) {
      throw new Error("products.json not found. Run fetch-products.js first.");
    }

    const products = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("No products found in products.json");
    }

    console.log(`\nFound ${products.length} products.`);
    console.log("Starting Shiprocket synchronization...\n");

    let successCount = 0;
    let failedCount = 0;

    // Process products one by one
    for (const product of products) {
      console.log("--------------------------------");
      console.log(`Syncing: ${product.title} (ID: ${product.id})`);

      try {
        // Create exact request body
        const requestBody = JSON.stringify(product);

        // Generate individual HMAC
        const hmac = crypto
          .createHmac("sha256", SECRET_KEY)
          .update(requestBody, "utf8")
          .digest("base64");

        // Send webhook request
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": API_KEY,
            "X-Api-HMAC-SHA256": hmac
          },
          body: requestBody
        });

        const responseText = await response.text();

        console.log(`HTTP Status: ${response.status}`);
        console.log(`Response: ${responseText}`);

        if (!response.ok) {
          failedCount++;
          console.log("Status: FAILED");
          continue;
        }

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          result = null;
        }

        if (result?.ok === true && result?.result === true) {
          successCount++;
          console.log("Status: SUCCESS");
        } else {
          failedCount++;
          console.log("Status: CHECK RESPONSE");
        }

      } catch (error) {
        failedCount++;
        console.error("Product sync error:", error.message);
      }
    }

    console.log("\n========== SYNC SUMMARY ==========");
    console.log(`Total products: ${products.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log("==================================");

  } catch (error) {
    console.error("\nSynchronization failed:", error.message);
    process.exitCode = 1;
  }
}

syncProducts();
