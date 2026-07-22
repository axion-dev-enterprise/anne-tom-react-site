// Vercel serverless — Cancelamento de Pedido e Disparo de Estorno no Mercado Pago
const MERCADOPAGO_API = "https://api.mercadopago.com/v1/payments";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { orderId, paymentId, reason } = req.body || {};
  if (!orderId) {
    return res.status(400).json({ error: "order_id_required", message: "Informe o ID do pedido." });
  }

  let refundSuccess = false;
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (paymentId && token) {
    try {
      const refundRes = await fetch(`${MERCADOPAGO_API}/${paymentId}/refunds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Idempotency-Key": `refund-${orderId}-${Date.now()}`,
        },
      });

      if (refundRes.ok) {
        refundSuccess = true;
        console.log(`[cancel-order] Estorno do pagamento ${paymentId} realizado com sucesso.`);
      } else {
        const errData = await refundRes.json();
        console.warn(`[cancel-order] Falha no estorno no Mercado Pago:`, errData);
      }
    } catch (err) {
      console.error("[cancel-order] Erro de rede ao solicitar estorno:", err.message);
    }
  }

  return res.status(200).json({
    ok: true,
    orderId,
    status: "cancelled",
    refunded: refundSuccess,
    reason: reason || "Cancelado pelo usuário / estabelecimento",
    cancelledAt: new Date().toISOString(),
  });
};
