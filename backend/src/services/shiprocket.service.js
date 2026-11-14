import dotenv from 'dotenv';
dotenv.config();
import Order from '../models/Order.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import Product from '../models/Product.js';

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
      const errDetails = data.errors ? (typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors)) : '';
      const errMsg = [data.message, errDetails].filter(Boolean).join(': ') || 'Failed to create order in Shiprocket';
      throw new Error(errMsg);
    }
  } catch (error) {
    console.error("Shiprocket Create Order Error:", error);
    throw error;
  }
};

/**
 * Sanitizes phone number to 10-digit Indian mobile format accepted by Shiprocket
 */
const sanitizeMobileNumber = (rawPhone) => {
  if (!rawPhone) return '9876543210';
  const cleaned = String(rawPhone).replace(/\D/g, '');
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return cleaned;
  }
  if (cleaned.length === 11 && cleaned.startsWith('0') && /^[6-9]/.test(cleaned.substring(1))) {
    return cleaned.substring(1);
  }
  if (cleaned.length === 12 && cleaned.startsWith('91') && /^[6-9]/.test(cleaned.substring(2))) {
    return cleaned.substring(2);
  }
  if (cleaned.length >= 10) {
    const last10 = cleaned.slice(-10);
    if (/^[6-9]/.test(last10)) return last10;
  }
  return '9876543210';
};

/**
 * Automatically synchronizes a Dermfix order to the Shiprocket portal.
 * Handles idempotency, payload formatting, DB updates, and non-blocking error capture.
 *
 * @param {string|mongoose.Types.ObjectId|object} orderIdOrDoc
 * @param {object} options - { forceRetry: boolean, throwOnError: boolean }
 * @returns {Promise<{success: boolean, order?: object, shiprocketResponse?: object, error?: string}>}
 */
export const syncOrderToShiprocket = async (orderIdOrDoc, options = {}) => {
  const { forceRetry = false, throwOnError = false } = options;
  let order = null;

  try {
    // 1. Resolve order document with populated references
    const orderId = (orderIdOrDoc && orderIdOrDoc._id) ? orderIdOrDoc._id : orderIdOrDoc;
    order = await Order.findById(orderId)
      .populate('userId')
      .populate('addressId')
      .populate('products.productId');

    if (!order) {
      const msg = `Order not found for Shiprocket synchronization: ${orderIdOrDoc}`;
      console.warn(msg);
      if (throwOnError) throw new Error(msg);
      return { success: false, error: msg };
    }

    // 2. Validate Order Placement & Payment Status
    // Do not send unpaid, failed, or cancelled orders to Shiprocket
    const isCancelled = order.deliveryStatus === 'Cancelled';
    const isPaid = order.paymentStatus === 'Paid';
    const isCod = String(order.paymentMethod || '').toUpperCase() === 'COD';

    if (isCancelled) {
      console.log(`[Shiprocket Sync] Order ${order.orderNumber} is cancelled. Skipping sync.`);
      return { success: false, message: 'Order is cancelled. Cannot sync to Shiprocket.', order };
    }

    if (!isPaid && !isCod) {
      console.log(`[Shiprocket Sync] Order ${order.orderNumber} is unpaid (paymentStatus: ${order.paymentStatus}). Skipping sync until payment succeeds.`);
      return { success: false, message: 'Order is not paid or confirmed.', order };
    }

    // 3. Idempotency Check: if already successfully synced, avoid duplicate
    if (!forceRetry && order.shiprocketSyncStatus === 'SUCCESS' && order.shiprocketOrderId) {
      console.log(`[Shiprocket Sync] Order ${order.orderNumber} already synced (ID: ${order.shiprocketOrderId}). Skipping duplicate.`);
      return { success: true, alreadySynced: true, order };
    }

    // 4. Resolve customer details
    const user = order.userId || {};
    const address = order.addressId || {};

    const rawName = (address.firstName
      ? `${address.firstName} ${address.lastName || ''}`
      : user.name || 'Valued Customer'
    ).trim();

    const nameParts = rawName.split(/\s+/);
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || '.';

    let email = user.email || address.email || '';
    if (!email || email.includes('customer_') || !email.includes('@')) {
      email = 'support@dermfix.in';
    }

    const phone = sanitizeMobileNumber(address.mobile || user.mobile || address.phone);

    // 5. Resolve address fields
    let street1 = (address.street1 || 'Street Address').trim();
    if (street1.length < 3) {
      street1 = `${street1}, ${address.district || 'City'}`;
    }
    const street2 = (address.street2 || address.landmark || '').trim();
    const city = (address.district || 'Chennai').trim();
    const state = (address.state || 'Tamil Nadu').trim();
    const pincode = String(address.pincode || '600053').replace(/\D/g, '').slice(0, 6);

    // 6. Resolve line items
    let items = [];
    if (Array.isArray(order.products) && order.products.length > 0) {
      items = order.products.map((item, idx) => {
        const prod = item.productId || {};
        const pName = (prod.name || `Dermfix Product ${idx + 1}`).substring(0, 100);
        const pSku = (prod.sku || (prod._id ? String(prod._id).substring(0, 8) : `DF-SKU-${idx + 1}`)).toUpperCase();
        const pUnits = Math.max(1, Number(item.quantity) || 1);
        const pPrice = Math.max(1, Math.round(Number(item.price || prod.salePrice || 1)));

        return {
          name: pName,
          sku: pSku,
          units: pUnits,
          selling_price: pPrice,
          discount: 0,
          tax: 0,
          hsn: 330499
        };
      });
    }

    if (items.length === 0) {
      items = [
        {
          name: 'Dermfix Skincare Order',
          sku: 'DF-GENERAL-01',
          units: 1,
          selling_price: Math.max(1, Math.round(Number(order.totalPrice) || 1)),
          discount: 0,
          tax: 0,
          hsn: 330499
        }
      ];
    }

    // 7. Format order date (YYYY-MM-DD HH:mm)
    const orderDate = new Date(order.createdAt || Date.now())
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // 8. Payment method
    const paymentMethod = isCod ? 'COD' : 'Prepaid';

    // 9. Pickup location: active verified location in Shiprocket account is 'warehouse'
    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'warehouse';

    // 10. Build Shiprocket Adhoc Order Payload
    const shiprocketPayload = {
      order_id: order.orderNumber,
      order_date: orderDate,
      pickup_location: pickupLocation,
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: street1,
      billing_address_2: street2,
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: 'India',
      billing_email: email,
      billing_phone: phone,
      shipping_is_billing: true,
      order_items: items,
      payment_method: paymentMethod,
      sub_total: Math.max(1, Math.round(Number(order.totalPrice) || 0)),
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    console.log(`[Shiprocket Sync] Sending order ${order.orderNumber} to Shiprocket adhoc API...`);

    // 11. Call Shiprocket API
    const srResponse = await createShiprocketOrder(shiprocketPayload);

    // 12. Save returned Shiprocket reference against Dermfix Order
    order.shiprocketOrderId = String(srResponse.order_id);
    order.shiprocketShipmentId = String(srResponse.shipment_id || '');
    order.shiprocketChannelOrderId = order.orderNumber;
    order.shiprocketStatus = srResponse.status || 'NEW';
    order.shiprocketSyncStatus = 'SUCCESS';
    order.shiprocketSyncedAt = new Date();
    order.shiprocketSyncError = '';
    order.shiprocketResponse = srResponse;

    await order.save();

    console.log(`[Shiprocket Sync] Successfully synced order ${order.orderNumber} -> Shiprocket Order ID: ${order.shiprocketOrderId}, Shipment ID: ${order.shiprocketShipmentId}`);

    return {
      success: true,
      order,
      shiprocketResponse: srResponse
    };
  } catch (error) {
    console.error(`[Shiprocket Sync Error] Failed syncing order ${order?.orderNumber || orderIdOrDoc}:`, error.message);

    if (order) {
      try {
        order.shiprocketSyncStatus = 'FAILED';
        order.shiprocketSyncError = error.message || 'Failed to sync with Shiprocket';
        await order.save();
      } catch (saveErr) {
        console.error('[Shiprocket Sync Error] Failed to update error status on order:', saveErr.message);
      }
    }

    if (throwOnError) {
      throw error;
    }

    return {
      success: false,
      error: error.message,
      order
    };
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
