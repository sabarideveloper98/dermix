import { createHmac } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate HMAC-SHA256 Base64 signature for Shiprocket SRC Custom Integration APIs
 * @param {string|object|Buffer} payload - Outgoing request body
 * @returns {{ signature: string, apiKey: string, rawBody: string, headers: object }}
 */
export function generateHmac(payload) {
  const rawApiKey = process.env.API_KEY || process.env.SHIPROCKET_API_KEY;
  const secretKey = process.env.API_SECRET_KEY || process.env.SHIPROCKET_SECRET_KEY;

  if (!rawApiKey || !secretKey) {
    throw new Error("Missing API_KEY or API_SECRET_KEY in backend environment");
  }

  // Strip any accidental 'Bearer ' prefix since Shiprocket requires the raw key in X-Api-Key
  const apiKey = rawApiKey.replace(/^Bearer\s+/i, "").trim();

  // Ensure exact UTF-8 string representation of body
  let rawBody;
  if (Buffer.isBuffer(payload)) {
    rawBody = payload.toString("utf8");
  } else if (typeof payload === "string") {
    rawBody = payload;
  } else {
    rawBody = JSON.stringify(payload);
  }

  const signature = createHmac("sha256", secretKey.trim())
    .update(rawBody, "utf8")
    .digest("base64");

  return {
    signature,
    apiKey,
    rawBody,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      "X-Api-HMAC-SHA256": signature
    }
  };
}

export const generateHmacSignature = generateHmac;

// CLI execution helper (retains existing file capability)
if (process.argv[1] && process.argv[1].endsWith("generate.js")) {
  const filePath = path.join(__dirname, "products.json");
  if (fs.existsSync(filePath)) {
    const body = fs.readFileSync(filePath, "utf8");
    const { signature, apiKey } = generateHmac(body);
    console.log("\nGenerated HMAC successfully.");
    console.log(`Signature: ${signature}`);
    console.log("\nExecute this webhook request:\n");
    console.log(
      `curl -i -X POST "https://checkout-api.shiprocket.com/wh/v1/custom/product" \\\n-H "Content-Type: application/json" \\\n-H "X-Api-Key: ${apiKey}" \\\n-H "X-Api-HMAC-SHA256: ${signature}" \\\n--data-binary @products.json`
    );
  } else {
    console.log("products.json not found in current directory.");
  }
}
