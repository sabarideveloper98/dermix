import dotenv from 'dotenv';
import { authenticateShiprocket } from './src/services/shiprocket.service.js';

dotenv.config();
const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';

(async () => {
  try {
    const token = await authenticateShiprocket();
    
    const response = await fetch(`${SHIPROCKET_API}/courier/serviceability/?pickup_postcode=600053&delivery_postcode=400001&weight=0.5&cod=0`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    const couriers = data.data.available_courier_companies;
    if(couriers && couriers.length > 0) {
      const minRateCourier = couriers.reduce((prev, curr) => prev.rate < curr.rate ? prev : curr);
      console.log("Lowest Shipping Rate:", minRateCourier.rate);
    } else {
      console.log("No couriers available");
    }
  } catch (error) {
    console.error("Test Error:", error);
  }
})();
