import { API_BASE } from "../config";

/**
 * Executes the complete Shiprocket checkout workflow on the frontend:
 * 1. Checks cart items.
 * 2. Sends cart items and customer info to backend POST /api/checkout/process
 * 3. Backend runs fetch-products -> generate (HMAC) -> test-checkout (Shiprocket API)
 * 4. On receiving active token, dispatches window.HeadlessCheckout.addToCart(event, token)
 * 5. Handles loading indicators, double-click protection, and graceful error messages.
 *
 * @param {object} options
 * @param {Event} options.event - Click event
 * @param {object} options.cart - Cart context object
 * @param {object} [options.user] - Authenticated user context (optional)
 * @param {Function} [options.navigate] - react-router navigate function
 * @param {Function} [options.setLoading] - Loading state setter
 * @param {Function} [options.onSuccess] - Optional success callback
 * @param {Function} [options.onError] - Optional error callback
 */
export async function triggerCheckoutWorkflow({
  event,
  cart,
  user = null,
  navigate = null,
  setLoading = null,
  onSuccess = null,
  onError = null
}) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    const msg = "Your cart is empty. Please add products before checking out.";
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
        items: cart.items,
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

    // Close offcanvas mini-cart if open
    const closeBtn = document.querySelector("#shoppingCart .btn-close-popup");
    if (closeBtn) {
      closeBtn.click();
    }

    if (onSuccess) {
      onSuccess(result);
    }

    // Launch Shiprocket Headless Checkout drawer
    if (window.HeadlessCheckout && typeof window.HeadlessCheckout.addToCart === "function") {
      window.HeadlessCheckout.addToCart(event, token, {
        fallbackUrl,
        isInitiatedFromApp: false
      });
    } else {
      console.warn("Shiprocket HeadlessCheckout SDK not loaded yet. Falling back to native checkout.");
      if (navigate) {
        navigate("/checkout");
      }
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
