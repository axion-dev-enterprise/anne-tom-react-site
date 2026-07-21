const MATRIX_API_URL = "https://matrix.axionenterprise.cloud/route";
const COORDINATE_KEYS = ["olat", "olon", "dlat", "dlon"];

const isCoordinate = (value) =>
  typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));

module.exports = async (request, response) => {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const params = new URLSearchParams();
  for (const key of COORDINATE_KEYS) {
    const value = request.query[key];
    if (!isCoordinate(value)) {
      return response.status(400).json({ error: `invalid_parameter:${key}` });
    }
    params.set(key, value);
  }

  try {
    const upstream = await fetch(`${MATRIX_API_URL}?${params.toString()}`);
    const body = await upstream.json();
    return response.status(upstream.status).json(body);
  } catch {
    return response.status(502).json({ error: "matrix_unavailable" });
  }
};
