// Vercel serverless — Cria preferência de pagamento via cartão (Mercado Pago)
const MERCADOPAGO_API = "https://api.mercadopago.com/checkout/preferences";

module.exports = async (req, res) => {
  // Configuração CORS
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("[create-card] MERCADOPAGO_ACCESS_TOKEN not set");
    return res.status(500).json({ error: "missing_mercadopago_token" });
  }

  const { amount, description, payerEmail, payerName, externalReference } = req.body || {};

  if (typeof amount !== "number" || amount <= 0 || isNaN(amount)) {
    return res.status(400).json({ error: "invalid_amount", message: "O valor deve ser um número positivo." });
  }

  const hostOrigin = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : "https://annetom.com");
  const successUrl = `${hostOrigin}/confirmacao`;
  const failureUrl = `${hostOrigin}/checkout?status=erro`;
  const pendingUrl = `${hostOrigin}/checkout?status=pago`;

  try {
    const mpResponse = await fetch(MERCADOPAGO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: description || "Pedido Anne & Tom",
            quantity: 1,
            unit_price: Number(amount.toFixed(2)),
            currency_id: "BRL",
          },
        ],
        payer: {
          email: payerEmail || "cliente@annetom.com.br",
          ...(payerName ? { name: payerName } : {}),
        },
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        auto_return: "approved",
        ...(externalReference ? { external_reference: String(externalReference) } : {}),
        statement_descriptor: "ANNE_TOM",
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("[create-card] MP error:", mpResponse.status, mpData);
      return res.status(mpResponse.status).json({
        error: mpData?.message || mpData?.error || "mercadopago_error",
        details: mpData,
      });
    }

    return res.status(201).json({
      id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      checkoutUrl: mpData.init_point || null,
      status: "pending",
      provider: "mercadopago",
      providerReference: String(mpData.id),
      transactionId: mpData.id,
    });
  } catch (err) {
    console.error("[create-card] network error:", err);
    return res.status(502).json({ error: "upstream_unavailable", message: err.message });
  }
};