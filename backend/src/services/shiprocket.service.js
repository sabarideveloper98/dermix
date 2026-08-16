import dotenv from 'dotenv';
dotenv.config();

const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';

let shiprocketToken = null;
let tokenExpiry = null;

export const authenticateShiprocket = async () => {
  if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
    return shiprocketToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials are not configured in environment variables.');
  }

  try {
    const response = await fetch(`${SHIPROCKET_API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      shiprocketToken = data.token;
      // Shiprocket tokens typically last 10 days. We'll set expiry to 9 days to be safe.
      tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 9);
      return shiprocketToken;
    } else {
      console.error("Shiprocket Auth Error:", data);
      throw new Error(data.message || 'Failed to authenticate with Shiprocket');
    }
  } catch (error) {
    console.error("Shiprocket Auth Error:", error);
    throw error;
  }
};

export const createShiprocketOrder = async (orderData) => {
  const token = await authenticateShiprocket();

  try {
    const response = await fetch(`${SHIPROCKET_API}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (response.ok && data.order_id) {
      return data;
    } else {
      console.error("Shiprocket Create Order Error:", data);
      throw new Error(data.message || 'Failed to create order in Shiprocket');
    }
  } catch (error) {
    console.error("Shiprocket Create Order Error:", error);
    throw error;
  }
};

export const getShiprocketTracking = async (shipmentId) => {
  const token = await authenticateShiprocket();

  try {
    const response = await fetch(`${SHIPROCKET_API}/courier/track/shipment/${shipmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      console.error("Shiprocket Tracking Error:", data);
      throw new Error(data.message || 'Failed to fetch tracking data');
    }
  } catch (error) {
    console.error("Shiprocket Tracking Error:", error);
    throw error;
  }
};

export const getShippingRate = async (deliveryPincode, weight = 0.5, cod = 0) => {
  const token = await authenticateShiprocket();
  const pickupPincode = '600053'; // Default to warehouse pincode based on our earlier config

  try {
    const response = await fetch(`${SHIPROCKET_API}/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.status === 200 && data.data && data.data.available_courier_companies) {
      const couriers = data.data.available_courier_companies;
      if (couriers.length > 0) {
        // Select the Recommended Courier by Shiprocket (to match the dashboard)
        let targetCourier;
        if (data.data.recommended_courier_company_id) {
          targetCourier = couriers.find(c => c.courier_company_id === data.data.recommended_courier_company_id);
        }
        if (!targetCourier) {
          targetCourier = couriers.reduce((prev, curr) => (prev.rating > curr.rating) ? prev : curr);
        }

        const freightCharge = Number(targetCourier.freight_charge || targetCourier.rate || 0);
        const smartOrderCharge = Number(targetCourier.whatsapp_charges || targetCourier.smart_order_charge || 0);
        return freightCharge + smartOrderCharge;
      }
    }

    // Return a fallback shipping rate if API fails or no couriers found
    return 60;
  } catch (error) {
    console.error("Shiprocket Shipping Rate Error:", error);
    return 60; // Fallback
  }
};
