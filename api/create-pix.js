// Vercel serverless — Cria pagamento PIX via Mercado Pago
const MERCADOPAGO_API = "https://api.mercadopago.com/v1/payments";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("[create-pix] MERCADOPAGO_ACCESS_TOKEN not set");
    return res.status(500).json({ error: "missing_mercadopago_token" });
  }

  const { amount, description, payerEmail, payerName, externalReference } = req.body || {};

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "invalid_amount" });
  }

  try {
    const mpResponse = await fetch(MERCADOPAGO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Idempotency-Key": req.headers["idempotency-key"] || `${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: Number(amount.toFixed(2)),
        description: description || "Pedido Anne & Tom",
        payment_method_id: "pix",
        payer: {
          email: payerEmail || "cliente@annetom.com.br",
          ...(payerName ? { first_name: payerName.split(" ")[0], last_name: payerName.split(" ").slice(1).join(" ") } : {}),
        },
        ...(externalReference ? { external_reference: String(externalReference) } : {}),
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("[create-pix] MP error:", mpResponse.status, mpData);
      return res.status(mpResponse.status).json({
        error: mpData?.message || mpData?.error || "mercadopago_error",
        details: mpData,
      });
    }

    const transactionData = mpData.point_of_interaction?.transaction_data || {};

    return res.status(201).json({
      id: mpData.id,
      status: mpData.status,
      status_detail: mpData.status_detail,
      transaction_amount: mpData.transaction_amount,
      date_created: mpData.date_created,
      date_of_expiration: mpData.date_of_expiration,
      // Pix copy-paste
      pix_payload: transactionData.qr_code || null,
      qr_code_base64: transactionData.qr_code_base64 || null,
      ticket_url: transactionData.ticket_url || null,
      // Raw for debugging
      provider: "mercadopago",
      providerReference: String(mpData.id),
      transactionId: mpData.id,
    });
  } catch (err) {
    console.error("[create-pix] network error:", err);
    return res.status(502).json({ error: "upstream_unavailable", message: err.message });
  }
};