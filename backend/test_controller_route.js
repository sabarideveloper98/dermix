import "dotenv/config";
import assert from "node:assert";
import { processCheckout } from "./src/controllers/shiprocketCheckout.controller.js";

async function testController() {
  console.log("Testing processCheckout controller...");

  // Mock Request with empty cart
  let statusCaptured = null;
  let jsonCaptured = null;

  const mockRes = {
    status: (code) => {
      statusCaptured = code;
      return mockRes;
    },
    json: (data) => {
      jsonCaptured = data;
      return mockRes;
    }
  };

  // Case 1: Empty cart
  await processCheckout({ body: { items: [] } }, mockRes);
  assert.strictEqual(statusCaptured, 400);
  assert.strictEqual(jsonCaptured.success, false);
  console.log("PASS: Controller correctly rejects empty cart with HTTP 400");

  // Case 2: Valid cart items
  const validReq = {
    body: {
      items: [
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
      ],
      customer: {
        name: "Test User",
        email: "test@dermfix.in",
        mobile: "9876543210"
      }
    }
  };

  await processCheckout(validReq, mockRes);
  assert.strictEqual(statusCaptured, 200);
  assert.strictEqual(jsonCaptured.success, true);
  assert(jsonCaptured.token, "Controller returns checkout token");
  assert(jsonCaptured.order_id, "Controller returns order_id");
  console.log("PASS: Controller executes full checkout sequence and returns HTTP 200 with active token:", jsonCaptured.token);

  console.log("ALL CONTROLLER TESTS PASSED!");
}

testController();
