import dotenv from 'dotenv';
import { authenticateShiprocket, createShiprocketOrder } from './src/services/shiprocket.service.js';

dotenv.config();

(async () => {
  try {
    const payload = {
        order_id: "TEST-" + Date.now(),
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: "warehouse",
        billing_customer_name: "Test",
        billing_last_name: "User",
        billing_address: "123 Test St",
        billing_address_2: "",
        billing_city: "Mumbai",
        billing_pincode: "400001",
        billing_state: "Maharashtra",
        billing_country: "India",
        billing_email: "test@example.com",
        billing_phone: "9999999999",
        shipping_is_billing: true,
        order_items: [{
          name: "Test Product",
          sku: "TEST-SKU",
          units: 1,
          selling_price: 100,
          discount: 0,
          tax: 0,
          hsn: 441122
        }],
        payment_method: "Prepaid",
        sub_total: 100,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5
      };

    const res = await createShiprocketOrder(payload);
    console.log("Create Order Response:", res);
  } catch (error) {
    console.error("Test Error:", error);
  }
})();
