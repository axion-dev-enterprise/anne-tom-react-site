// Vercel serverless — Gerador de Comprovante / Ticket de Impressão Térmica (ESC/POS) para Cozinha
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { orderId = "PEDIDO-1234", customerName = "Cliente", items = [], total = 0, address = "" } = req.body || req.query || {};

  const nowStr = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const ticketLines = [
    "========================================",
    "       PIZZARIA ANNE & TOM              ",
    "  Rua Pedro Doll, 555 - Santana, SP     ",
    "========================================",
    `PEDIDO: #${orderId}`,
    `DATA:   ${nowStr}`,
    `CLIENTE:${customerName}`,
    `ENDEREÇO:${address || "Balcão / Retirada"}`,
    "----------------------------------------",
    "ITENS DO PEDIDO:",
  ];

  if (Array.isArray(items) && items.length) {
    items.forEach((item) => {
      ticketLines.push(`* ${item.quantidade || 1}x ${item.nome || item.name} (${item.tamanho || "G"})`);
      if (item.sabores) ticketLines.push(`  Sabores: ${item.sabores.join(" / ")}`);
      if (item.obs) ticketLines.push(`  Obs: ${item.obs}`);
    });
  } else {
    ticketLines.push("* 1x Pizza Grande Anne & Tom");
  }

  ticketLines.push("----------------------------------------");
  ticketLines.push(`TOTAL FINAL: R$ ${Number(total).toFixed(2)}`);
  ticketLines.push("========================================");
  ticketLines.push("      OBRIGADO PELA PREFERÊNCIA!        ");
  ticketLines.push("\n\n\x1dV\x41\x03"); // Comando ESC/POS para cortar papel

  const plainTextTicket = ticketLines.join("\n");

  if (req.query.format === "json") {
    return res.status(200).json({ ok: true, ticket: plainTextTicket, orderId });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.status(200).send(plainTextTicket);
};
