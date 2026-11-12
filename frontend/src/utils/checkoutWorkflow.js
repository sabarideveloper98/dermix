import { API_BASE } from "../config";

/**
 * Executes the complete Shiprocket checkout workflow on the frontend:
 * 1. Checks cart items or custom Buy Now items.
 * 2. Sends items and customer info to backend POST /api/checkout/process
 * 3. Backend runs fetch-products -> generate (HMAC) -> test-checkout (Shiprocket API)
 * 4. On receiving active token, dispatches window.HeadlessCheckout.addToCart(event, token) or redirects to checkoutUrl
 * 5. Handles loading indicators, double-click protection, and graceful error messages.
 *
 * @param {object} options
 * @param {Event} options.event - Click event
 * @param {object} [options.cart] - Cart context object (optional if items provided)
 * @param {Array} [options.items] - Direct checkout items (e.g., for Buy Now)
 * @param {object} [options.user] - Authenticated user context (optional)
 * @param {Function} [options.navigate] - react-router navigate function
 * @param {Function} [options.setLoading] - Loading state setter
 * @param {Function} [options.onSuccess] - Optional success callback
 * @param {Function} [options.onError] - Optional error callback
 */
export async function triggerCheckoutWorkflow({
  event,
  cart = null,
  items = null,
  user = null,
  navigate = null,
  setLoading = null,
  onSuccess = null,
  onError = null
}) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const checkoutItems = items || (cart && cart.items);

  if (!checkoutItems || !Array.isArray(checkoutItems) || checkoutItems.length === 0) {
    const msg = "Please select a product before checking out.";
    alert(msg);
    if (onError) onError(msg);
    return;
  }

  // Prevent multiple simultaneous checkout requests
  if (setLoading) setLoading(true);

  try {
    const customer = {
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || ""
    };

    const redirectUrl = `${window.location.origin}/payment-response`;
    const fallbackUrl = `${window.location.origin}/checkout`;

    const response = await fetch(`${API_BASE}/checkout/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem("token")
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : {})
      },
      body: JSON.stringify({
        items: checkoutItems,
        customer,
        redirectUrl
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success || !result.token) {
      const errorMsg =
        result?.message ||
        result?.error ||
        "Failed to initiate Shiprocket checkout. Please try again.";
      console.error("Checkout process error:", result);
      alert(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    const token = result.token;
    console.log("Shiprocket Checkout Token Generated:", token);

    // Save order_id to sessionStorage for immediate return verification
    if (result.order_id) {
      sessionStorage.setItem("lastShiprocketOrderId", result.order_id);
    }

    // Close offcanvas mini-cart if open
    const closeBtn = document.querySelector("#shoppingCart .btn-close-popup");
    if (closeBtn) {
      closeBtn.click();
    }

    if (onSuccess) {
      onSuccess(result);
    }

    const checkoutUrl = result.checkoutUrl || `https://fastrr.shiprocket.com/checkout?token=${token}`;

    // Launch Shiprocket Headless Checkout drawer or redirect to checkoutUrl
    if (window.HeadlessCheckout && typeof window.HeadlessCheckout.addToCart === "function") {
      try {
        window.HeadlessCheckout.addToCart(event, token, {
          fallbackUrl: checkoutUrl,
          isInitiatedFromApp: false
        });
      } catch (sdkErr) {
        console.warn("HeadlessCheckout.addToCart encountered error, redirecting to checkoutUrl:", sdkErr);
        window.location.href = checkoutUrl;
      }
    } else {
      console.warn("Shiprocket HeadlessCheckout SDK not active. Redirecting directly to checkoutUrl.");
      window.location.href = checkoutUrl;
    }
  } catch (err) {
    console.error("Checkout integration error:", err);
    const errorMsg = "A network error occurred while connecting to Checkout. Please try again.";
    alert(errorMsg);
    if (onError) onError(errorMsg);
  } finally {
    if (setLoading) setLoading(false);
  }
}
