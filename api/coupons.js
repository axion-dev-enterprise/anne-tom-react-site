// Vercel serverless — Endpoint e motor de validação de cupons
const VALID_COUPONS = {
  ANNETOM10: { type: "percentage", value: 10, minSubtotal: 30, description: "10% de desconto na sua compra" },
  FRETEGRATIS: { type: "fixed_shipping", value: 0, minSubtotal: 80, description: "Frete Grátis acima de R$ 80" },
  BEMVINDO15: { type: "fixed_discount", value: 15, minSubtotal: 50, description: "R$ 15 de desconto no seu pedido" },
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { code, subtotal = 0 } = req.body || {};
  const normalizedCode = String(code || "").toUpperCase().trim();

  if (!normalizedCode) {
    return res.status(400).json({ error: "code_required", message: "Informe um código de cupom." });
  }

  const coupon = VALID_COUPONS[normalizedCode];
  if (!coupon) {
    return res.status(404).json({ error: "coupon_not_found", message: "Cupom inválido ou expirado." });
  }

  if (subtotal < coupon.minSubtotal) {
    return res.status(400).json({
      error: "min_subtotal_not_met",
      message: `Este cupom exige um subtotal mínimo de R$ ${coupon.minSubtotal.toFixed(2)}.`,
    });
  }

  let calculatedDiscount = 0;
  if (coupon.type === "percentage") {
    calculatedDiscount = Number(((subtotal * coupon.value) / 100).toFixed(2));
  } else if (coupon.type === "fixed_discount") {
    calculatedDiscount = Math.min(coupon.value, subtotal);
  }

  return res.status(200).json({
    ok: true,
    code: normalizedCode,
    type: coupon.type,
    value: coupon.value,
    discountAmount: calculatedDiscount,
    description: coupon.description,
  });
};
