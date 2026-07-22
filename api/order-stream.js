// Vercel serverless — Server-Sent Events (SSE) para rastreamento em tempo real
module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { orderId } = req.query || {};
  if (!orderId) {
    res.write(`data: ${JSON.stringify({ error: "order_id_required" })}\n\n`);
    return res.end();
  }

  // Envia status inicial
  res.write(`data: ${JSON.stringify({ orderId, status: "open", timestamp: new Date().toISOString() })}\n\n`);

  // Simula evento de atualização via stream
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ orderId, status: "preparing", timestamp: new Date().toISOString() })}\n\n`);
  }, 10000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
};
