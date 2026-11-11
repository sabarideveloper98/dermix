import "dotenv/config";
import assert from "node:assert";
import { fetchCartProducts, validateCartProducts } from "./fetch-products.js";
import { generateHmac } from "./generate.js";
import { executeCheckoutApi, executeFullCheckout } from "./test-checkout.js";

async function runTestSuite() {
  console.log("==========================================================");
  console.log("DERMFIX - SHIPROCKET SRC CHECKOUT INTEGRATION TEST SUITE");
  console.log("==========================================================\n");

  let passed = 0;
  let failed = 0;

  function record(title, fn) {
    try {
      fn();
      console.log(`PASS: ${title}`);
      passed++;
    } catch (e) {
      console.error(`FAIL: ${title} -> ${e.message}`);
      failed++;
    }
  }

  async function recordAsync(title, fn) {
    try {
      await fn();
      console.log(`PASS: ${title}`);
      passed++;
    } catch (e) {
      console.error(`FAIL: ${title} -> ${e.message}`);
      failed++;
    }
  }

  // TEST 1: Validation of empty cart
  record("Empty cart rejects with descriptive error", () => {
    assert.throws(
      () => validateCartProducts([]),
      /Cart is empty/
    );
  });

  // TEST 2: Dynamic single item cart mapping
  await recordAsync("Single item mapped to Shiprocket cart_data format", async () => {
    const singleItem = [
      {
        productId: {
          _id: "673f8b0e12a45c7890abcd12",
          name: "Ride Fresh",
          salePrice: 149,
          images: ["https://res.cloudinary.com/acsf1w0m/image/upload/v1791013729/products/c0pgweu7keg4wh4dz6wc.jpg"]
        },
        quantity: 1,
        size: "10"
      }
    ];

    const payload = await fetchCartProducts(singleItem, {
      name: "Sabari",
      email: "test@dermfix.in",
      mobile: "9876543210"
    });

    assert(payload.cart_data, "Payload has cart_data");
    assert(Array.isArray(payload.cart_data.items), "cart_data has items array");
    assert.strictEqual(payload.cart_data.items.length, 1);
    assert.strictEqual(payload.cart_data.items[0].catalog_data.price, 149);
    assert.strictEqual(payload.cart_data.items[0].catalog_data.name, "Ride Fresh");
    assert.strictEqual(payload.cart_data.custom_attributes.customer_email, "test@dermfix.in");
  });

  // TEST 3: Multi-product cart mapping
  await recordAsync("Multiple products mapped correctly", async () => {
    const multiItems = [
      {
        productId: {
          _id: "673f8b0e12a45c7890abcd12",
          name: "Ride Fresh",
          salePrice: 149,
          images: ["https://example.com/item1.png"]
        },
        quantity: 2,
        size: "10"
      },
      {
        productId: {
          _id: "673f8b0e12a45c7890abcd99",
          name: "Post Exposure Recovery Serum",
          salePrice: 799,
          images: ["https://example.com/item2.png"]
        },
        quantity: 1,
        size: "30ML"
      }
    ];

    const payload = await fetchCartProducts(multiItems);
    assert.strictEqual(payload.cart_data.items.length, 2);
    assert.strictEqual(payload.cart_data.items[0].quantity, 2);
    assert.strictEqual(payload.cart_data.items[1].quantity, 1);
    assert.strictEqual(payload.cart_data.items[1].catalog_data.price, 799);
  });

  // TEST 4: HMAC generation algorithm & headers
  record("HMAC generation produces correct headers and Base64 format", () => {
    const samplePayload = {
      cart_data: { items: [{ variant_id: "2", quantity: 1 }] },
      redirect_url: "https://dermfix.in/",
      timestamp: "2026-11-08T08:00:00.000Z"
    };

    const { signature, apiKey, headers, rawBody } = generateHmac(samplePayload);
    assert(signature, "Signature exists");
    assert(typeof signature === "string" && signature.length > 20, "Signature is valid Base64 string");
    assert.strictEqual(headers["Content-Type"], "application/json");
    assert.strictEqual(headers["X-Api-Key"], apiKey);
    assert.strictEqual(headers["X-Api-HMAC-SHA256"], signature);
    assert(!apiKey.includes("Bearer"), "API Key does not contain Bearer prefix");
  });

  // TEST 5: Live Shiprocket Checkout API execution
  await recordAsync("Live Shiprocket Checkout Token API call succeeds with HTTP 200", async () => {
    const cartItems = [
      {
        productId: {
          _id: "673f8b0e12a45c7890abcd12",
          name: "Ride Fresh",
          salePrice: 149,
          images: ["https://res.cloudinary.com/acsf1w0m/image/upload/v1791013729/products/c0pgweu7keg4wh4dz6wc.jpg"]
        },
        quantity: 1,
        size: "10"
      }
    ];

    const result = await executeFullCheckout({
      items: cartItems,
      customer: {
        name: "Test Customer",
        email: "support@dermfix.in",
        mobile: "9999999999"
      }
    });

    assert.strictEqual(result.status, 200, "Status is HTTP 200");
    assert.strictEqual(result.success, true, "Result success flag is true");
    assert(result.token, "Result contains active session token");
    assert(result.order_id, "Result contains active order_id");
    assert(result.signature, "HMAC signature is recorded");
    assert(result.apiKey, "API Key is recorded");

    console.log(`   -> Received live token: ${result.token}`);
    console.log(`   -> Received live order_id: ${result.order_id}`);
  });

  console.log("\n==========================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
