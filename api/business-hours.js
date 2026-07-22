// Vercel serverless — API de horários de funcionamento e status da loja
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const isEmergencyClosed = process.env.STORE_EMERGENCY_CLOSED === "true";
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda...

  // Segunda a Quinta: 18h às 23h | Sexta a Domingo: 18h às 23:59h
  const isOpenDay = true;
  const openingHour = 18;
  const closingHour = currentDay === 5 || currentDay === 6 || currentDay === 0 ? 24 : 23;

  const isOpenNow = !isEmergencyClosed && currentHour >= openingHour && currentHour < closingHour;

  return res.status(200).json({
    isOpen: isOpenNow,
    isEmergencyClosed,
    schedule: {
      monThu: "18:00 - 23:00",
      friSun: "18:00 - 00:00",
    },
    message: isEmergencyClosed
      ? "Loja temporariamente fechada para manutenção."
      : isOpenNow
      ? "Pizzaria Aberta! Faça seu pedido agora."
      : "Pizzaria Fechada. Abriremos hoje às 18:00.",
  });
};
