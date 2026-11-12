import mongoose from "mongoose";
import { executeFullCheckout, executeCheckoutApi } from "../../test-checkout.js";
import { generateHmac } from "../../generate.js";
import { fetchCartProducts } from "../../fetch-products.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import StockHistory from "../models/StockHistory.js";
import { sendEmail } from "../utils/email.js";

/**
 * Controller: Process Checkout Workflow (fetch-products -> generate -> test-checkout)
 * Endpoint: POST /api/checkout/process
 */
export async function processCheckout(req, res) {
  try {
    const { items, customer, redirectUrl } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add items before checking out."
      });
    }

    const customerDetails = customer || {};
    if (req.user) {
      customerDetails.email = customerDetails.email || req.user.email;
      customerDetails.name = customerDetails.name || req.user.name;
      customerDetails.mobile = customerDetails.mobile || req.user.mobile;
    }

    // Ensure all items have live, validated product information from the database
    const resolvedItems = [];
    for (const item of items) {
      const rawProd = item.productId || item.product || item;
      const prodId = typeof rawProd === 'object' && rawProd?._id
        ? rawProd._id
        : (typeof rawProd === 'string' ? rawProd : item._id);

      let dbProduct = null;
      if (prodId && mongoose.isValidObjectId(prodId)) {
        dbProduct = await Product.findById(prodId).populate('sizes.size').lean();
      }

      const quantity = Math.max(1, Number(item.quantity) || 1);
      const sizeName = item.size || "Standard";

      if (dbProduct) {
        if (dbProduct.status === 'inactive') {
          return res.status(400).json({
            success: false,
            message: `Product "${dbProduct.name}" is currently unavailable.`
          });
        }
        if (dbProduct.qty <= 0) {
          return res.status(400).json({
            success: false,
            message: `Product "${dbProduct.name}" is out of stock.`
          });
        }
        if (quantity > dbProduct.qty) {
          return res.status(400).json({
            success: false,
            message: `Requested quantity for "${dbProduct.name}" exceeds available stock (${dbProduct.qty} available).`
          });
        }

        // Calculate size-specific price
        let calculatedPrice = dbProduct.salePrice || dbProduct.mrpPrice;
        if (Array.isArray(dbProduct.sizes) && dbProduct.sizes.length > 0) {
          const matchedSize = dbProduct.sizes.find(
            (s) => (s.size ? s.size.name : s.name) === sizeName
          );
          if (matchedSize && matchedSize.salePrice) {
            calculatedPrice = Number(matchedSize.salePrice);
          }
        }

        resolvedItems.push({
          ...item,
          productId: {
            ...dbProduct,
            salePrice: calculatedPrice,
          },
          quantity,
          size: sizeName,
        });
      } else {
        resolvedItems.push(item);
      }
    }

    const frontendBase = (process.env.FRONTEND_URL || "https://dermfix.in").replace(/\/+$/, "");
    const defaultRedirect = `${frontendBase}/payment-response`;
    const finalRedirectUrl = redirectUrl || defaultRedirect;

    // Execute the 3-step sequence
    const result = await executeFullCheckout({
      items: resolvedItems,
      customer: customerDetails,
      redirectUrl: finalRedirectUrl
    });

    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.message || "Failed to initiate Shiprocket checkout",
        error: result.error
      });
    }

    const checkoutUrl = `https://fastrr.shiprocket.com/checkout?token=${result.token}`;

    return res.status(200).json({
      success: true,
      token: result.token,
      order_id: result.order_id,
      redirectUrl: finalRedirectUrl,
      checkoutUrl,
      expires_at: result.data?.expires_at,
      data: result.data
    });
  } catch (error) {
    console.error("Shiprocket Checkout Process Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during checkout process"
    });
  }
}

/**
 * Controller: Query Order Details from Shiprocket
 * Endpoint: POST /api/shiprocket/order-details
 */
export async function getShiprocketOrderDetails(req, res) {
  try {
    const orderId = req.body.order_id || req.query.order_id || req.body.oid || req.query.oid;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "order_id is required" });
    }

    const payload = {
      order_id: String(orderId),
      timestamp: new Date().toISOString()
    };

    const { rawBody, headers } = generateHmac(payload);

    const response = await fetch(
      "https://checkout-api.shiprocket.com/api/v1/custom-platform-order/details",
      {
        method: "POST",
        headers,
        body: rawBody
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Fetch Shiprocket Order Details Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Backend Payment Verification
 * Endpoint: GET & POST /api/checkout/verify-payment
 * Verifies payment status directly with Shiprocket API and database.
 */
export async function verifyPaymentAndOrder(req, res) {
  try {
    const orderId =
      req.query.order_id ||
      req.query.oid ||
      req.body.order_id ||
      req.body.oid;
    const ostParam =
      req.query.ost ||
      req.query.status ||
      req.body.ost ||
      req.body.status;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing order_id / oid parameter for payment verification."
      });
    }

    // 1. Fetch verified order and payment status from Shiprocket
    let shiprocketOrder = null;
    try {
      const payload = {
        order_id: String(orderId),
        timestamp: new Date().toISOString()
      };
      const { rawBody, headers } = generateHmac(payload);

      const srRes = await fetch(
        "https://checkout-api.shiprocket.com/api/v1/custom-platform-order/details",
        {
          method: "POST",
          headers,
          body: rawBody
        }
      );

      if (srRes.ok) {
        const srData = await srRes.json();
        shiprocketOrder = srData?.result || srData?.data || null;
      }
    } catch (srErr) {
      console.warn("Shiprocket Order Details API lookup warning:", srErr.message);
    }

    // 2. Determine verified payment status
    const rawStatus = String(shiprocketOrder?.status || ostParam || "PENDING").toUpperCase();
    const rawPaymentStatus = String(shiprocketOrder?.payment_status || "").toLowerCase();
    const payments = Array.isArray(shiprocketOrder?.payments) ? shiprocketOrder.payments : [];
    const primaryPayment = payments[0] || {};

    let paymentStatus = "Pending";
    let orderStatus = "PENDING";
    let isSuccess = false;

    if (rawStatus === "SUCCESS" || rawPaymentStatus === "success") {
      paymentStatus = "Paid";
      orderStatus = "SUCCESS";
      isSuccess = true;
    } else if (rawStatus === "FAILED" || rawPaymentStatus === "failed") {
      paymentStatus = "Failed";
      orderStatus = "FAILED";
    }

    // 3. Search database for existing order to prevent duplicates
    let existingOrder = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existingOrder = await Order.findOne({
          $or: [
            { shiprocketOrderId: String(orderId) },
            { transactionId: primaryPayment.txn_id || String(orderId) }
          ]
        })
          .populate("userId")
          .populate("addressId")
          .populate("products.productId");
      } catch (dbFindErr) {
        console.warn("DB find order warning:", dbFindErr.message);
      }
    }

    // 4. If payment is verified SUCCESS and order not created yet, create it atomically
    if (isSuccess && !existingOrder && mongoose.connection.readyState === 1) {
      const customerEmail = shiprocketOrder?.email || shiprocketOrder?.shipping_address?.email;
      const customerPhone = shiprocketOrder?.phone || shiprocketOrder?.shipping_address?.phone;
      const shippingAddr = shiprocketOrder?.shipping_address || {};

      let user = null;
      if (customerEmail) {
        user = await User.findOne({ email: customerEmail });
      }
      if (!user && customerPhone) {
        user = await User.findOne({ mobile: customerPhone });
      }
      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-8);
        user = await User.create({
          name: `${shippingAddr.first_name || "Customer"} ${shippingAddr.last_name || ""}`.trim(),
          email: customerEmail || `customer_${Date.now()}@dermfix.in`,
          mobile: customerPhone || "9999999999",
          password: randomPassword
        });
      }

      const address = await Address.create({
        userId: user._id,
        street1: shippingAddr.line1 || "Street Address",
        street2: shippingAddr.line2 || "",
        district: shippingAddr.city || "City",
        state: shippingAddr.state || "State",
        pincode: shippingAddr.pincode || "000000",
        landmark: shippingAddr.landmark || ""
      });

      const rawItems = shiprocketOrder?.cart_data?.items || [];
      const orderItems = [];

      for (const item of rawItems) {
        let product = null;
        if (item.variant_id) {
          const potentialId = String(item.variant_id).split("_")[0];
          if (potentialId.length === 24) {
            product = await Product.findById(potentialId);
          }
        }
        if (!product) {
          product = await Product.findOne();
        }

        if (product) {
          const itemPrice = Number(
            item.item_catalog_data?.price ||
            item.price ||
            product.salePrice ||
            0
          );
          const itemQty = Number(item.quantity) || 1;

          orderItems.push({
            productId: product._id,
            quantity: itemQty,
            price: itemPrice,
            size: item.size || "Standard"
          });

          try {
            product.qty = Math.max(0, (product.qty || 0) - itemQty);
            await product.save();

            await StockHistory.create({
              productId: product._id,
              changeType: "remove",
              quantity: itemQty,
              reason: `Shiprocket Checkout Order #${orderId}`
            });
          } catch (stockErr) {
            console.warn("Stock adjustment warning:", stockErr.message);
          }
        }
      }

      const totalPayable = Number(
        shiprocketOrder?.total_amount_payable ||
        shiprocketOrder?.subtotal_price ||
        0
      );

      existingOrder = await Order.create({
        orderNumber: `DF-SRC-${Date.now().toString().slice(-6)}`,
        userId: user._id,
        products: orderItems,
        addressId: address._id,
        totalPrice: totalPayable,
        paymentStatus: "Paid",
        deliveryStatus: "Confirmed",
        shiprocketOrderId: String(orderId),
        shiprocketCheckoutId: String(orderId),
        transactionId: primaryPayment.txn_id || shiprocketOrder?.fastrr_order_id || String(orderId),
        paymentReferenceId: primaryPayment.pg_transaction_id || shiprocketOrder?.fastrr_order_id || "",
        paymentMethod: primaryPayment.payment_method || shiprocketOrder?.payment_type || "Online",
        paymentAmount: totalPayable,
        paymentDate: primaryPayment.created_at ? new Date(primaryPayment.created_at) : new Date(),
        shippingCharges: Number(shiprocketOrder?.shipping_charges || 0),
        discountAmount: Number(shiprocketOrder?.total_discount || 0)
      });

      // Reload with populated refs
      existingOrder = await Order.findById(existingOrder._id)
        .populate("userId")
        .populate("addressId")
        .populate("products.productId");

      if (user.email && !user.email.includes("customer_")) {
        try {
          await sendEmail({
            to: user.email,
            subject: `Order Confirmation - ${existingOrder.orderNumber}`,
            html: `<p>Thank you for your purchase!</p><p>Order Number: <strong>${existingOrder.orderNumber}</strong></p><p>Amount: ₹${existingOrder.totalPrice.toFixed(2)}</p>`
          });
        } catch (emailErr) {
          console.warn("Email dispatch error:", emailErr.message);
        }
      }
    } else if (isSuccess && existingOrder && existingOrder.paymentStatus !== "Paid") {
      existingOrder.paymentStatus = "Paid";
      existingOrder.deliveryStatus = "Confirmed";
      await existingOrder.save();
    }

    // 5. Build structured products list for display
    let displayProducts = [];
    if (shiprocketOrder?.cart_data?.items?.length) {
      displayProducts = shiprocketOrder.cart_data.items.map((it) => ({
        name: it.item_catalog_data?.name || it.name || "Dermfix Product",
        quantity: Number(it.quantity) || 1,
        price: Number(it.item_catalog_data?.price || it.price || 0),
        image: it.item_catalog_data?.image_url || it.image || ""
      }));
    } else if (existingOrder?.products?.length) {
      displayProducts = existingOrder.products.map((p) => ({
        name: p.productId?.name || "Dermfix Product",
        quantity: p.quantity,
        price: p.price,
        image: p.productId?.images?.[0] || ""
      }));
    }

    // 6. Build verified response payload
    const customerName =
      (shiprocketOrder?.shipping_address?.first_name
        ? `${shiprocketOrder.shipping_address.first_name} ${shiprocketOrder.shipping_address.last_name || ""}`.trim()
        : null) ||
      existingOrder?.userId?.name ||
      "Valued Customer";

    const customerEmail =
      shiprocketOrder?.email ||
      shiprocketOrder?.shipping_address?.email ||
      existingOrder?.userId?.email ||
      "";

    const customerMobile =
      shiprocketOrder?.phone ||
      shiprocketOrder?.shipping_address?.phone ||
      existingOrder?.userId?.mobile ||
      "";

    const subtotal = Number(
      shiprocketOrder?.subtotal_price ||
      existingOrder?.totalPrice ||
      displayProducts.reduce((acc, p) => acc + p.price * p.quantity, 0)
    );

    const shippingCharges = Number(
      shiprocketOrder?.shipping_charges ?? existingOrder?.shippingCharges ?? 0
    );

    const discountAmount = Number(
      shiprocketOrder?.total_discount ?? existingOrder?.discountAmount ?? 0
    );

    const totalAmount = Number(
      shiprocketOrder?.total_amount_payable ||
      existingOrder?.totalPrice ||
      subtotal + shippingCharges - discountAmount
    );

    const paymentAmount = Number(
      primaryPayment.amount ||
      existingOrder?.paymentAmount ||
      totalAmount
    );

    const transactionId =
      primaryPayment.txn_id ||
      existingOrder?.transactionId ||
      String(orderId);

    const paymentReferenceId =
      primaryPayment.pg_transaction_id ||
      shiprocketOrder?.fastrr_order_id ||
      existingOrder?.paymentReferenceId ||
      "";

    const paymentMethod =
      primaryPayment.payment_method ||
      shiprocketOrder?.payment_type ||
      existingOrder?.paymentMethod ||
      "Prepaid";

    const paymentDate =
      primaryPayment.created_at ||
      shiprocketOrder?.order_created_date ||
      existingOrder?.paymentDate ||
      existingOrder?.createdAt ||
      new Date().toISOString();

    const failureReason =
      rawStatus === "FAILED"
        ? (primaryPayment.payment_status || "Payment transaction was declined or failed.")
        : "";

    return res.status(200).json({
      success: true,
      paymentStatus,
      orderStatus,
      paymentDetails: {
        status: paymentStatus,
        transactionId,
        paymentReferenceId,
        paymentMethod,
        paymentAmount,
        paymentDate,
        gatewayResponse: primaryPayment.payment_status || rawStatus,
        gateway: primaryPayment.gateway || "Shiprocket Checkout",
        failureReason
      },
      orderDetails: {
        orderId: existingOrder?._id || String(orderId),
        orderNumber: existingOrder?.orderNumber || `DF-SRC-${String(orderId).slice(-6)}`,
        shiprocketOrderId: String(orderId),
        customerName,
        customerEmail,
        customerMobile,
        products: displayProducts,
        subtotalAmount: subtotal,
        shippingCharges,
        discountAmount,
        totalAmount
      }
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment status"
    });
  }
}

/**
 * Controller: Ingest Placed Order Webhook from Shiprocket
 * Endpoint: POST /api/shiprocket/order-webhook
 */
export async function handleOrderWebhook(req, res) {
  try {
    const webhookData = req.body;
    console.log("Shiprocket Order Webhook Received for Order ID:", webhookData.order_id || webhookData.platform_order_id);

    const shiprocketOrderId = String(webhookData.order_id || webhookData.platform_order_id || "");
    const customerEmail = webhookData.email || webhookData.shipping_address?.email;
    const customerPhone = webhookData.phone || webhookData.shipping_address?.phone;
    const shippingAddr = webhookData.shipping_address || {};

    // 1. Identify or create customer in DB
    let user = null;
    if (customerEmail) {
      user = await User.findOne({ email: customerEmail });
    }
    if (!user && customerPhone) {
      user = await User.findOne({ mobile: customerPhone });
    }
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        name: `${shippingAddr.first_name || "Customer"} ${shippingAddr.last_name || ""}`.trim(),
        email: customerEmail || `customer_${Date.now()}@dermfix.in`,
        mobile: customerPhone || "9999999999",
        password: randomPassword
      });
    }

    // 2. Identify or create shipping address in DB
    const address = await Address.create({
      userId: user._id,
      street1: shippingAddr.line1 || "Street Address",
      street2: shippingAddr.line2 || "",
      district: shippingAddr.city || "City",
      state: shippingAddr.state || "State",
      pincode: shippingAddr.pincode || "000000",
      landmark: shippingAddr.landmark || ""
    });

    // 3. Map order items
    const rawItems = webhookData.cart_data?.items || [];
    const orderItems = [];

    for (const item of rawItems) {
      let product = null;
      if (item.variant_id) {
        const potentialId = String(item.variant_id).split("_")[0];
        if (potentialId.length === 24) {
          product = await Product.findById(potentialId);
        }
      }
      if (!product) {
        product = await Product.findOne();
      }

      if (product) {
        const itemQty = Number(item.quantity) || 1;
        const itemPrice = Number(item.price || product.salePrice || 0);

        orderItems.push({
          productId: product._id,
          quantity: itemQty,
          price: itemPrice,
          size: item.size || "Standard"
        });

        // Deduct inventory and log stock history
        try {
          product.qty = Math.max(0, (product.qty || 0) - itemQty);
          await product.save();

          await StockHistory.create({
            productId: product._id,
            changeType: "remove",
            quantity: itemQty,
            reason: `Shiprocket Checkout Order #${shiprocketOrderId}`
          });
        } catch (stockErr) {
          console.warn("Stock adjustment warning:", stockErr.message);
        }
      }
    }

    // 4. Create Order (idempotently check first)
    const existing = await Order.findOne({ shiprocketOrderId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Order already ingested",
        orderId: existing._id,
        orderNumber: existing.orderNumber
      });
    }

    const totalAmount = Number(webhookData.total_amount_payable || webhookData.subtotal_price || 0);
    const paymentSuccess = String(webhookData.status).toUpperCase() === "SUCCESS" || String(webhookData.payment_status).toLowerCase() === "success";
    const primaryPayment = webhookData.payments?.[0] || {};

    const newOrder = await Order.create({
      orderNumber: `DF-SRC-${Date.now().toString().slice(-6)}`,
      userId: user._id,
      products: orderItems,
      addressId: address._id,
      totalPrice: totalAmount,
      paymentStatus: paymentSuccess ? "Paid" : "Pending",
      deliveryStatus: "Confirmed",
      shiprocketOrderId,
      shiprocketCheckoutId: shiprocketOrderId,
      transactionId: primaryPayment.txn_id || webhookData.fastrr_order_id || shiprocketOrderId,
      paymentReferenceId: primaryPayment.pg_transaction_id || webhookData.fastrr_order_id || "",
      paymentMethod: primaryPayment.payment_method || webhookData.payment_type || "Prepaid",
      paymentAmount: Number(primaryPayment.amount || totalAmount),
      paymentDate: primaryPayment.created_at ? new Date(primaryPayment.created_at) : new Date(),
      shippingCharges: Number(webhookData.shipping_charges || 0),
      discountAmount: Number(webhookData.total_discount || 0)
    });

    // 5. Send Email Confirmation
    if (user.email && !user.email.includes("customer_")) {
      try {
        await sendEmail({
          to: user.email,
          subject: `Order Confirmation - ${newOrder.orderNumber}`,
          html: `<p>Thank you for your order!</p><p>Order Number: <strong>${newOrder.orderNumber}</strong></p><p>Total Amount: ₹${newOrder.totalPrice.toFixed(2)}</p>`
        });
      } catch (emailErr) {
        console.warn("Confirmation email warning:", emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order placed webhook processed successfully",
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber
    });
  } catch (error) {
    console.error("Shiprocket Order Webhook Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process order webhook"
    });
  }
}
