import crypto from "node:crypto";
import "dotenv/config";

const API_KEY = process.env.SHIPROCKET_API_KEY;
const SECRET_KEY = process.env.SHIPROCKET_SECRET_KEY;

if (!API_KEY || !SECRET_KEY) {
  throw new Error("Missing Shiprocket credentials");
}

const payload = {
  cart_data: {
    items: [
      {
        variant_id: "2",
        quantity: 1,
        catalog_data: {
          price: 149,
          name: "Ride Fresh",
          image_url:
            "https://res.cloudinary.com/acsf1w0m/image/upload/v1791013729/products/c0pgweu7keg4wh4dz6wc.jpg"
        }
      }
    ],
    mobile_app: false
  },
  redirect_url: "https://dermfix.in/",
  timestamp: new Date().toISOString()
};

const body = JSON.stringify(payload);

const signature = crypto
  .createHmac("sha256", SECRET_KEY)
  .update(body, "utf8")
  .digest("base64");

const response = await fetch(
  "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
      "X-Api-HMAC-SHA256": signature
    },
    body
  }
);

console.log("HTTP Status:", response.status);
console.log("Response:", await response.text());