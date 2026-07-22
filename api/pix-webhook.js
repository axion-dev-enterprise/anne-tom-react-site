// Vercel serverless — Webhook para notificações de pagamento Mercado Pago
// Configurar no Mercado Pago: URL para https://anne-tom-react-site.vercel.app/api/pix-webhook

const MERCADOPAGO_API = "https://api.mercadopago.com/v1/payments";

module.exports = async (req, res) => {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // Tratamento de testes de ping do Mercado Pago
  if (req.method === "GET") {
    return res.status(200).json({ status: "online", service: "annetom-pix-webhook" });
  }

  try {
    const { action, data, type } = req.body || {};
    const paymentId = data?.id || (req.query.topic === "payment" ? req.query.id : null);

    console.log(`[pix-webhook] Recebido evento: action=${action}, type=${type}, id=${paymentId}`);

    if (paymentId) {
      const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (token) {
        const mpRes = await fetch(`${MERCADOPAGO_API}/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (mpRes.ok) {
          const paymentInfo = await mpRes.json();
          console.log(`[pix-webhook] Status do Pagamento ${paymentId}: ${paymentInfo.status} (${paymentInfo.status_detail})`);
          
          const externalRef = paymentInfo.external_reference;
          const status = paymentInfo.status; // approved, pending, rejected, etc.

          // Se tiver URL da API desktop, repassa o evento de pagamento
          const atApiUrl = process.env.REACT_APP_AT_API_BASE_URL || "https://api.annetom.com";
          if (externalRef && status === "approved") {
            try {
              await fetch(`${atApiUrl}/api/orders/${externalRef}/payment-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentId,
                  status: "approved",
                  provider: "mercadopago",
                  updatedAt: new Date().toISOString()
                })
              });
              console.log(`[pix-webhook] Pedido ${externalRef} atualizado para PAGO no backend!`);
            } catch (backendErr) {
              console.warn(`[pix-webhook] Não foi possível avisar backend local:`, backendErr.message);
            }
          }
        }
      }
    }

    return res.status(200).json({ received: true, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("[pix-webhook] Erro de processamento:", err);
    return res.status(200).json({ received: true, error: err.message });
  }
};