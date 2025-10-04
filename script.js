document.getElementById("payBtn").addEventListener("click", async () => {
  const amount = document.getElementById("amount").value;
  const method = document.getElementById("method").value;
  const result = document.getElementById("result");

  result.textContent = "جاري إنشاء عملية الدفع...";

  try {
    const res = await fetch("/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, method }),
    });

    const data = await res.json();
    if (data.payment_url) {
      result.innerHTML = `<a href="${data.payment_url}" target="_blank">اضغط هنا لإتمام الدفع</a>`;
    } else {
      result.textContent = "حدث خطأ أثناء إنشاء الدفع.";
      console.error(data);
    }
  } catch (err) {
    result.textContent = "فشل الاتصال بالخادم.";
    console.error(err);
  }
});
