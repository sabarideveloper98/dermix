import dotenv from 'dotenv';
import { authenticateShiprocket } from './src/services/shiprocket.service.js';

dotenv.config();
const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';

(async () => {
  try {
    const token = await authenticateShiprocket();
    
    // Let's try to get pickup locations
    const response = await fetch(`${SHIPROCKET_API}/settings/company/pickup`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log("Pickup Locations:", data);
  } catch (error) {
    console.error("Test Error:", error);
  }
})();
