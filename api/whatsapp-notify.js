// Vercel serverless — Disparador de Notificações WhatsApp de Pedidos
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { phone, customerName, orderId, status } = req.body || {};

  if (!phone || !orderId || !status) {
    return res.status(400).json({ error: "missing_fields", message: "Telefone, pedido e status são obrigatórios." });
  }

  const cleanPhone = String(phone).replace(/\D/g, "");
  const messages = {
    open: `🍕 Olá ${customerName || "Cliente"}! Recebemos seu pedido #${orderId} na Pizzaria Anne & Tom!`,
    preparing: `🔥 Seu pedido #${orderId} já está no forno a lenha sendo preparado com carinho!`,
    out_for_delivery: `🛵 Oba! Seu pedido #${orderId} acabou de sair para entrega!`,
    done: `❤️ Pedido #${orderId} entregue! Bom apetite e obrigado por escolher a Anne & Tom!`,
  };

  const textMessage = messages[status] || `Status do pedido #${orderId}: ${status}`;
  console.log(`[whatsapp-notify] Enviando para 55${cleanPhone}: ${textMessage}`);

  // Se houver URL da API WhatsApp configurada
  const waApiUrl = process.env.WHATSAPP_API_URL;
  const waApiToken = process.env.WHATSAPP_API_TOKEN;

  if (waApiUrl && waApiToken) {
    try {
      await fetch(`${waApiUrl}/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${waApiToken}`,
        },
        body: JSON.stringify({
          phone: `55${cleanPhone}`,
          message: textMessage,
        }),
      });
    } catch (err) {
      console.warn("[whatsapp-notify] Erro ao integrar com API WhatsApp:", err.message);
    }
  }

  return res.status(200).json({
    ok: true,
    phone: cleanPhone,
    status,
    messageDispatched: textMessage,
    timestamp: new Date().toISOString(),
  });
};
