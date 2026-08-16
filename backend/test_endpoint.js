const run = async () => {
  const response = await fetch('http://localhost:5001/api/orders/shiprocket/shipping-rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pincode: '600028',
      products: [
        {
          productId: { _id: "6a6f5aba613972c8a040c7d8", isShippingPaid: true },
          quantity: 1
        }
      ]
    })
  });
  const data = await response.json();
  console.log(data);
};
run();
