
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.SHIPROCKET_API_KEY;
const SECRET_KEY = process.env.SHIPROCKET_SECRET_KEY;

if (!API_KEY || !SECRET_KEY) {
  console.error("Missing Shiprocket API key or Secret key.");
  process.exit(1);
}

// Read the exact JSON file
const body = fs.readFileSync(
  path.join(__dirname, "products.json")
);

// Generate HMAC SHA256 Base64
const hmac = crypto
  .createHmac("sha256", SECRET_KEY)
  .update(body)
  .digest("base64");

console.log("\nGenerated HMAC successfully.");

console.log("\nExecute this webhook request:\n");

console.log(
  `curl -i -X POST "https://checkout-api.shiprocket.com/wh/v1/custom/product" \
-H "Content-Type: application/json" \
-H "X-Api-Key: ${API_KEY}" \
-H "X-Api-HMAC-SHA256: ${hmac}" \
--data-binary @products.json`
);
