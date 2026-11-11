import "dotenv/config";
import { fetchCartProducts } from "./fetch-products.js";
import { generateHmac } from "./generate.js";

const CHECKOUT_API_URL =
  process.env.SHIPROCKET_CHECKOUT_BASE_URL
    ? `${process.env.SHIPROCKET_CHECKOUT_BASE_URL}/api/v1/access-token/checkout`
    : "https://checkout-api.shiprocket.com/api/v1/access-token/checkout";

/**
 * Executes the authenticated Shiprocket Checkout Access Token API
 * @param {string} body - Exact signed JSON request body
 * @param {object} headers - Headers containing X-Api-Key and X-Api-HMAC-SHA256
 * @returns {Promise<object>} API response result
 */
export async function executeCheckoutApi(body, headers) {
  try {
    const response = await fetch(CHECKOUT_API_URL, {
      method: "POST",
      headers,
      body
    });

    const responseText = await response.text();
    let result = null;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    if (!response.ok) {
      const errorMessage =
        result?.error ||
        result?.result ||
        result?.message ||
        `Shiprocket API responded with HTTP ${response.status}`;
      return {
        success: false,
        status: response.status,
        message: errorMessage,
        error: result
      };
    }

    // Success response format from Shiprocket Postman documentation:
    // { ok: true, result: { token: "...", expires_at: "...", data: { order_id: "..." } } }
    const token = result?.result?.token || result?.token || result?.data?.token;
    const order_id =
      result?.result?.data?.order_id ||
      result?.data?.order_id ||
      result?.order_id;

    if (!token) {
      return {
        success: false,
        status: response.status,
        message: "Checkout token missing from Shiprocket response",
        error: result
      };
    }

    return {
      success: true,
      status: response.status,
      token,
      order_id,
      data: result?.result || result
    };
  } catch (err) {
    console.error("Execute checkout API network error:", err.message);
    return {
      success: false,
      status: 500,
      message: `Network failure connecting to Shiprocket: ${err.message}`,
      error: err.message
    };
  }
}

/**
 * Sequential execution flow:
 * Step 1: fetch-products.js (Fetch & map actual Dermfix cart products)
 * Step 2: generate.js (Generate HMAC-SHA256 Base64 signature and headers)
 * Step 3: test-checkout.js (Execute authenticated checkout endpoint)
 *
 * @param {object} params
 * @param {Array} params.items - Customer cart items
 * @param {object} [params.customer] - Customer details (name, email, mobile)
 * @param {string} [params.redirectUrl] - Customer redirect URL
 * @returns {Promise<object>}
 */
export async function executeFullCheckout({ items, customer = {}, redirectUrl = "https://dermfix.in/" }) {
  // Step 1: Fetch and prepare product payload from customer cart
  const payload = await fetchCartProducts(items, customer, redirectUrl);

  // Step 2: Generate HMAC-SHA256 signature from exact request body
  const { signature, apiKey, rawBody, headers } = generateHmac(payload);

  // Step 3: Execute authenticated Shiprocket checkout endpoint
  const checkoutResponse = await executeCheckoutApi(rawBody, headers);

  return {
    ...checkoutResponse,
    payload,
    signature,
    apiKey
  };
}

// Preserve existing CLI execution when run via `node test-checkout.js`
if (process.argv[1] && process.argv[1].endsWith("test-checkout.js")) {
  const sampleItems = [
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
  ];

  console.log("Running Shiprocket checkout integration test...");
  executeFullCheckout({ items: sampleItems })
    .then((res) => {
      console.log("HTTP Status:", res.status);
      console.log("Checkout Result:", JSON.stringify(res, null, 2));
    })
    .catch((err) => {
      console.error("Test failed:", err);
      process.exit(1);
    });
}