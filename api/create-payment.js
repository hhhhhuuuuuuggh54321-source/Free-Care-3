export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, method } = req.body;

  if (!amount || !method) {
    return res.status(400).json({ error: "المبلغ وطريقة الدفع مطلوبان" });
  }

  try {
    // 🔑 ضع مفتاح Paymob الخاص بك هنا
    const PAYMOB_API_KEY = "egy_sk_test_054f13db8ec2fda4800e01b9a0f4bd5d6d92e18c39f2af47f49f3c47aa795cbe";

    // الخطوة 1: إنشاء auth token من Paymob
    const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    });

    const authData = await authResponse.json();
    if (!authData.token) {
      return res.status(401).json({ error: "Auth with Paymob failed", detail: authData });
    }

    // الخطوة 2: إنشاء طلب دفع
    const orderResponse = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authData.token,
        delivery_needed: false,
        amount_cents: amount * 100,
        currency: "EGP",
        items: [],
      }),
    });

    const orderData = await orderResponse.json();

    // الخطوة 3: إنشاء رابط الدفع
    const paymentKeyResponse = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authData.token,
        amount_cents: amount * 100,
        currency: "EGP",
        order_id: orderData.id,
        billing_data: {
          apartment: "NA",
          email: "user@test.com",
          floor: "NA",
          first_name: "Test",
          last_name: "User",
          phone_number: "+201000000000",
          street: "NA",
          building: "NA",
          shipping_method: "NA",
          postal_code: "NA",
          city: "Cairo",
          country: "EG",
          state: "NA",
        },
        integration_id: 1234567, // ← استبدلها بالـ Integration ID من حسابك
      }),
    });

    const paymentKeyData = await paymentKeyResponse.json();

    const payment_url = `https://accept.paymob.com/api/acceptance/iframes/1234567?payment_token=${paymentKeyData.token}`;

    res.status(200).json({ payment_url });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الدفع", detail: error.message });
  }
}
