import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_URL = "https://api.dermfix.in/api/shiprocket/catalog/products";

/**
 * Validates cart items for checkout
 * @param {Array} cartItems
 */
export function validateCartProducts(cartItems) {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Cart is empty. Please add items to cart before checkout.");
  }

  for (const item of cartItems) {
    const qty = Number(item.quantity);
    if (!qty || qty <= 0) {
      throw new Error("Invalid product quantity in cart.");
    }
    const prod = item.productId || item;
    if (!prod) {
      throw new Error("Missing product data for cart item.");
    }
  }
  return true;
}

/**
 * Resolves local or relative image URL to an absolute URL
 */
function resolveImageUrl(image) {
  if (!image) {
    return "https://res.cloudinary.com/acsf1w0m/image/upload/v1791013729/products/c0pgweu7keg4wh4dz6wc.jpg";
  }
  if (typeof image === "string") {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    if (image.startsWith("/")) {
      return `https://api.dermfix.in${image}`;
    }
    return `https://api.dermfix.in/${image}`;
  }
  if (typeof image === "object" && image.src) {
    return resolveImageUrl(image.src);
  }
  return "https://res.cloudinary.com/acsf1w0m/image/upload/v1791013729/products/c0pgweu7keg4wh4dz6wc.jpg";
}

/**
 * Maps customer cart items to the exact Shiprocket SRC checkout payload
 * @param {Array} cartItems - Customer's cart items
 * @param {Object} [customerInfo] - Customer details (optional)
 * @param {string} [redirectUrl] - Customer redirect URL after checkout
 * @returns {Object} Shiprocket checkout payload
 */
export async function fetchCartProducts(cartItems, customerInfo = {}, redirectUrl = "https://dermfix.in/") {
  validateCartProducts(cartItems);

  // Load cached products.json if available to map variant IDs accurately
  let localCatalog = [];
  try {
    const productsPath = path.join(__dirname, "products.json");
    if (fs.existsSync(productsPath)) {
      localCatalog = JSON.parse(fs.readFileSync(productsPath, "utf8"));
    }
  } catch (err) {
    console.warn("Could not read local products.json:", err.message);
  }

  const items = cartItems.map((item, index) => {
    const prod = item.productId && typeof item.productId === "object" ? item.productId : item;
    const quantity = Number(item.quantity) || 1;
    const sizeName = item.size || "Standard";

    // Determine price
    let salePrice = Number(prod.salePrice || prod.price || 0);
    if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
      const matchedSize = prod.sizes.find(
        (s) => (s.size ? s.size.name : s.name) === sizeName
      );
      if (matchedSize && matchedSize.salePrice) {
        salePrice = Number(matchedSize.salePrice);
      }
    }

    // Determine variant ID
    let variantId = null;
    const prodTitle = (prod.name || prod.title || "").trim().toLowerCase();

    // Try matching with local catalog
    const catalogMatch = localCatalog.find(
      (cp) =>
        (cp.title && cp.title.trim().toLowerCase() === prodTitle) ||
        String(cp.id) === String(prod._id || prod.id)
    );

    if (catalogMatch && Array.isArray(catalogMatch.variants) && catalogMatch.variants.length > 0) {
      const sizeMatch = catalogMatch.variants.find(
        (v) => (v.title && v.title.toLowerCase() === sizeName.toLowerCase()) ||
               (v.option_values && v.option_values.some((ov) => ov.value === sizeName))
      );
      variantId = sizeMatch ? String(sizeMatch.id) : String(catalogMatch.variants[0].id);
    }

    // Fallback variant_id if not matched in catalog
    if (!variantId) {
      if (item.variant_id) {
        variantId = String(item.variant_id);
      } else if (prod._id) {
        variantId = `${prod._id}_${sizeName.replace(/\s+/g, "_")}`;
      } else {
        variantId = String(index + 1);
      }
    }

    // Determine image URL
    let imageSrc = null;
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      imageSrc = prod.images[0];
    } else if (prod.image) {
      imageSrc = prod.image;
    }
    const finalImageUrl = resolveImageUrl(imageSrc);

    return {
      variant_id: String(variantId),
      quantity,
      catalog_data: {
        price: salePrice,
        name: prod.name || prod.title || `Product ${index + 1}`,
        image_url: finalImageUrl
      }
    };
  });

  const payload = {
    cart_data: {
      items,
      custom_attributes: {
        source: "dermfix_web",
        ...(customerInfo?.email ? { customer_email: customerInfo.email } : {}),
        ...(customerInfo?.name ? { customer_name: customerInfo.name } : {}),
        ...(customerInfo?.mobile ? { customer_phone: customerInfo.mobile } : {})
      },
      mobile_app: false
    },
    redirect_url: redirectUrl || "https://dermfix.in/",
    timestamp: new Date().toISOString()
  };

  return payload;
}

/**
 * Synchronize a product to Shiprocket if required
 */
export async function syncProductIfRequired(product) {
  const apiKey = (process.env.API_KEY || process.env.SHIPROCKET_API_KEY || "").replace(/^Bearer\s+/i, "");
  const secretKey = process.env.API_SECRET_KEY || process.env.SHIPROCKET_SECRET_KEY;
  if (!apiKey || !secretKey) return false;

  const crypto = await import("node:crypto");
  const requestBody = JSON.stringify(product);
  const hmac = crypto.createHmac("sha256", secretKey).update(requestBody, "utf8").digest("base64");

  const response = await fetch("https://checkout-api.shiprocket.com/wh/v1/custom/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      "X-Api-HMAC-SHA256": hmac
    },
    body: requestBody
  });

  return response.ok;
}

/**
 * Existing function: Fetch all products from Dermfix catalog API and generate products.json
 */
export async function fetchAllProducts() {
  try {
    let page = 1;
    const limit = 100;
    let allProducts = [];
    let total = 0;

    do {
      const response = await fetch(
        `${API_URL}?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }

      const result = await response.json();
      const products = result.data?.products || [];

      total = result.data?.total || 0;
      allProducts.push(...products);

      console.log(`Fetched page ${page}: ${products.length} products`);

      if (products.length === 0) break;

      page++;
    } while (allProducts.length < total);

    const outputPath = path.join(__dirname, "products.json");

    fs.writeFileSync(
      outputPath,
      JSON.stringify(allProducts, null, 2),
      "utf8"
    );

    console.log("\nProduct JSON generated successfully!");
    console.log(`Total products: ${allProducts.length}`);
    console.log(`Saved to: ${outputPath}`);

    return allProducts;
  } catch (error) {
    console.error("Product fetching failed:", error.message);
    throw error;
  }
}

// Only run automatically when executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith("fetch-products.js")) {
  fetchAllProducts();
}
