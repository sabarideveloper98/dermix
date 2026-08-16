import { authenticateShiprocket } from './src/services/shiprocket.service.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  const token = await authenticateShiprocket();
  const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=600053&delivery_postcode=600045&weight=0.5&cod=1`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.data && data.data.available_courier_companies) {
    const couriers = data.data.available_courier_companies;
    const rec = couriers.find(c => c.courier_company_id === data.data.recommended_courier_company_id);
    console.log(rec);
  }
}
run();
