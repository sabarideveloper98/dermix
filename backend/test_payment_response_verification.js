import "dotenv/config";
import assert from "node:assert";
import mongoose from "mongoose";
import { verifyPaymentAndOrder } from "./src/controllers/shiprocketCheckout.controller.js";

async function runPaymentResponseTests() {
  console.log("==========================================================");
  console.log("PAYMENT RESPONSE & VERIFICATION TEST SUITE");
  console.log("==========================================================\n");

  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("Connected to MongoDB Atlas for testing.");
    }
  } catch (dbErr) {
    console.warn("MongoDB connection warning in test (testing in offline mode):", dbErr.message);
  }

  let passed = 0;
  let failed = 0;

  function createMockRes() {
    let statusCode = 200;
    let jsonBody = null;
    return {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonBody = data;
            return { statusCode, jsonBody };
          }
        };
      },
      json: (data) => {
        jsonBody = data;
        return { statusCode, jsonBody };
      },
      get: () => ({ statusCode, jsonBody })
    };
  }

  // TEST 1: Missing order_id parameter
  console.log("Test 1: Verification without order_id");
  {
    const mockRes = createMockRes();
    const req = { query: {}, body: {} };
    await verifyPaymentAndOrder(req, mockRes);
    const { statusCode, jsonBody } = mockRes.get();
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonBody.success, false);
    console.log("PASS: Missing order_id rejected with HTTP 400");
    passed++;
  }

  // TEST 2: Querying live Shiprocket Order ID
  console.log("\nTest 2: Live Shiprocket Order ID verification");
  {
    const mockRes = createMockRes();
    const req = {
      query: {
        order_id: "6aefe2a970f4a403e9fe01fe"
      },
      body: {}
    };
    await verifyPaymentAndOrder(req, mockRes);
    const { statusCode, jsonBody } = mockRes.get();
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonBody.success, true);
    assert(jsonBody.paymentDetails, "Has paymentDetails");
    assert(jsonBody.orderDetails, "Has orderDetails");
    assert.strictEqual(jsonBody.paymentStatus, "Pending");
    assert.strictEqual(jsonBody.orderDetails.shiprocketOrderId, "6aefe2a970f4a403e9fe01fe");
    console.log("PASS: Live Shiprocket Order verified. Status: " + jsonBody.paymentStatus);
    console.log("   -> Order ID:", jsonBody.orderDetails.orderId);
    console.log("   -> Amount:", jsonBody.orderDetails.totalAmount);
    passed++;
  }

  // TEST 3: Security verification: ost=SUCCESS in query parameter alone cannot mark an unpaid (CREATED) order as Paid
  console.log("\nTest 3: Anti-tampering check (query ost=SUCCESS with live unpaid Shiprocket order)");
  {
    const mockRes = createMockRes();
    const req = {
      query: {
        order_id: "6aefe2a970f4a403e9fe01fe",
        ost: "SUCCESS"
      },
      body: {}
    };
    await verifyPaymentAndOrder(req, mockRes);
    const { statusCode, jsonBody } = mockRes.get();
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonBody.success, true);
    // Because Shiprocket live API reports CREATED (payment not actually captured yet),
    // the backend correctly maintains paymentStatus as Pending instead of trusting frontend query
    assert.strictEqual(jsonBody.paymentStatus, "Pending");
    console.log("PASS: Backend verified live order with Shiprocket. Prevented premature status promotion to Paid.");
    passed++;
  }

  // TEST 4: Verification of Failed payment response
  console.log("\nTest 4: Verification of Failed payment parameter");
  {
    const mockRes = createMockRes();
    const req = {
      query: {
        order_id: "non_existent_or_failed_id_12345",
        ost: "FAILED"
      },
      body: {}
    };
    await verifyPaymentAndOrder(req, mockRes);
    const { statusCode, jsonBody } = mockRes.get();
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonBody.success, true);
    assert.strictEqual(jsonBody.paymentStatus, "Failed");
    assert.strictEqual(jsonBody.orderStatus, "FAILED");
    assert(jsonBody.paymentDetails.failureReason, "Has failureReason");
    console.log("PASS: Failed payment verified. Reason: " + jsonBody.paymentDetails.failureReason);
    passed++;
  }

  console.log("\n==========================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  try {
    await mongoose.disconnect();
  } catch {}

  if (failed > 0) {
    process.exit(1);
  }
}

runPaymentResponseTests();
