// Vercel serverless — Webhook para notificações de pagamento Mercado Pago
// Configurar no Mercado Pago: URL para https://anne-tom-react-site.vercel.app/api/pix-webhook

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  console.log("[pix-webhook] received:", JSON.stringify(req.body));

  const { action, data, type } = req.body || {};

  // MP envia: { action: "payment.created", data: { id: "12345" }, type: "payment" }
  if (type === "payment" && data?.id) {
    console.log(`[pix-webhook] Payment ${data.id} event: ${action}`);
    // Aqui você pode buscar o payment na API do MP e atualizar o pedido no backend
    // Exemplo:
    //   const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    //   const mp = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
    //     headers: { Authorization: `Bearer ${token}` }
    //   });
    //   const payment = await mp.json();
    //   // Atualizar order no banco de dados conforme status do payment
  }

  // MP também envia tópicos: { topic: "payment", id: "12345" }
  if (req.query.topic === "payment" && req.query.id) {
    console.log(`[pix-webhook] Payment notification for id=${req.query.id}`);
  }

  // Sempre retorna 200 para o MP confirmar recebimento
  return res.status(200).json({ received: true });
};