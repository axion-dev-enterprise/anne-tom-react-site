// Vercel serverless — Health Check & Diagnostics API
module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const startTime = Date.now();
  const envCheck = {
    mercadopagoToken: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
    atApiBaseUrl: Boolean(process.env.REACT_APP_AT_API_BASE_URL),
    axionPayKey: Boolean(process.env.REACT_APP_AXIONPAY_API_KEY || process.env.REACT_APP_AXION_PAY_KEY),
  };

  const responsePayload = {
    status: "ok",
    app: "anne-tom-react-site",
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    environment: process.env.NODE_ENV || "production",
    services: {
      mercadopago: envCheck.mercadopagoToken ? "configured" : "unconfigured",
      atBackendApi: envCheck.atApiBaseUrl ? "configured" : "fallback_mode",
      axionPay: envCheck.axionPayKey ? "configured" : "unconfigured",
    },
    version: "0.1.1",
  };

  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  return res.status(200).json(responsePayload);
};
