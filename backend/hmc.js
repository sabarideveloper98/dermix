
const API_KEY = "PIGG1mlDcpi2xFC5";
const SECRET_KEY = "gIrIcowVkJMYglYARjpEUjlNH3n40MhE";

const requestBody = {
    productName: "Test Product",
    price: 500
};

// Convert request body to JSON
const payload = JSON.stringify(requestBody);

// Generate HMAC SHA256
const signature = createHmac("sha256", SECRET_KEY)
    .update(payload, "utf8")
    .digest("hex");

// Display headers
console.log("\nGenerated API Headers:");
console.log("-----------------------------");
console.log("X-Api-Key: Bearer " + API_KEY);
console.log("X-Api-HMAC-SHA256: " + signature);
console.log("-----------------------------");