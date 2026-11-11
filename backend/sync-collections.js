import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.SHIPROCKET_API_KEY;
const SECRET_KEY = process.env.SHIPROCKET_SECRET_KEY;

const WEBHOOK_URL =
  "https://checkout-api.shiprocket.com/wh/v1/custom/collection";

async function syncCollections() {
  try {
    if (!API_KEY || !SECRET_KEY) {
      throw new Error("Missing Shiprocket credentials in .env");
    }

    const filePath = path.join(__dirname, "collections.json");

    if (!fs.existsSync(filePath)) {
      throw new Error("collections.json not found.");
    }

    const collections = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    if (!Array.isArray(collections) || collections.length === 0) {
      throw new Error("No collections found.");
    }

    let successCount = 0;
    let failedCount = 0;

    console.log(`\nFound ${collections.length} collections.`);
    console.log("Starting collection synchronization...\n");

    for (const collection of collections) {
      console.log("--------------------------------");
      console.log(
        `Syncing: ${collection.title} (ID: ${collection.id})`
      );

      try {
        const requestBody = JSON.stringify(collection);

        const hmac = crypto
          .createHmac("sha256", SECRET_KEY)
          .update(requestBody, "utf8")
          .digest("base64");

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

        let result = null;

        try {
          result = JSON.parse(responseText);
        } catch { }

        if (
          response.ok &&
          result?.ok === true &&
          result?.result === true
        ) {
          successCount++;
          console.log("Status: SUCCESS");
        } else {
          failedCount++;
          console.log("Status: FAILED / CHECK RESPONSE");
        }

      } catch (error) {
        failedCount++;
        console.error("Sync error:", error.message);
      }
    }

    console.log("\n========== COLLECTION SUMMARY ==========");
    console.log(`Total: ${collections.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log("========================================");

  } catch (error) {
    console.error("Synchronization failed:", error.message);
    process.exitCode = 1;
  }
}

syncCollections();
