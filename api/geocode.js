const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

const isCoordinate = (value) =>
  typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));

module.exports = async (request, response) => {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const { address, lat, lng } = request.query;
  let url;
  if (isCoordinate(lat) && isCoordinate(lng)) {
    url = `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
  } else if (typeof address === "string" && address.trim().length >= 5) {
    url = `${NOMINATIM_URL}/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(address)}`;
  } else {
    return response.status(400).json({ error: "invalid_address_or_coordinates" });
  }

  try {
    const upstream = await fetch(url, { headers: { "User-Agent": "AnneTomDelivery/1.0" } });
    if (!upstream.ok) return response.status(502).json({ error: "geocoding_unavailable" });
    const payload = await upstream.json();
    let result = Array.isArray(payload) ? payload[0] : payload;
    if (!result && typeof address === "string") {
      const street = address.split(",")[0]?.trim();
      if (street) {
        const fallbackUrl = `${NOMINATIM_URL}/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(
          `${street}, Sao Paulo, Brasil`
        )}`;
        const fallback = await fetch(fallbackUrl, {
          headers: { "User-Agent": "AnneTomDelivery/1.0" },
        });
        if (fallback.ok) result = (await fallback.json())[0];
      }
    }
    if (!result) return response.status(404).json({ error: "address_not_found" });
    return response.status(200).json(result);
  } catch {
    return response.status(502).json({ error: "geocoding_unavailable" });
  }
};
