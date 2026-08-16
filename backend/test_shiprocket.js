import { authenticateShiprocket } from './src/services/shiprocket.service.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  const token = await authenticateShiprocket();
  const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=600053&delivery_postcode=600028&weight=0.5&cod=0`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.data && data.data.available_courier_companies) {
    const couriers = data.data.available_courier_companies;
    const minRateCourier = couriers.reduce((prev, curr) => prev.rate < curr.rate ? prev : curr);
    console.log("Min Courier:", {
      name: minRateCourier.courier_name,
      rate: minRateCourier.rate,
      freight_charge: minRateCourier.freight_charge,
      smart_order_charge: minRateCourier.smart_order_charge
    });
    
    const freightCharge = Number(minRateCourier.freight_charge || minRateCourier.rate || 0);
    const smartOrderCharge = Number(minRateCourier.smart_order_charge || 0);
    console.log("Calculated Total:", freightCharge + smartOrderCharge);
  }
}
run();
