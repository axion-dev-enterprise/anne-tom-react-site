const MATRIX_API_URL = "https://matrix.axionenterprise.cloud/route";
const COORDINATE_KEYS = ["olat", "olon", "dlat", "dlon"];

const isCoordinate = (value) =>
  typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));

/**
 * Calculates distance and estimated duration using Haversine formula
 * with urban driving factor and average speed estimation.
 */
function calculateHaversineFallback(olat, olon, dlat, dlon) {
  const R = 6371; // Earth radius in km
  const dLat = (dlat - olat) * (Math.PI / 180);
  const dLon = (dlon - olon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(olat * (Math.PI / 180)) *
      Math.cos(dlat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistanceKm = R * c;

  // Urban driving distance factor (~1.3x direct distance)
  const distanceKm = Math.round(directDistanceKm * 1.3 * 10) / 10;

  // Driving duration estimate (~25 km/h urban speed + 3 min base)
  const durationMin = Math.max(3, Math.round((distanceKm / 25) * 60 + 3));

  return { distance_km: distanceKm, duration_min: durationMin };
}

module.exports = async (request, response) => {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const params = new URLSearchParams();
  const coords = {};
  for (const key of COORDINATE_KEYS) {
    const value = request.query[key];
    if (!isCoordinate(value)) {
      return response.status(400).json({ error: `invalid_parameter:${key}` });
    }
    params.set(key, value);
    coords[key] = Number(value);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const upstream = await fetch(`${MATRIX_API_URL}?${params.toString()}`, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (upstream.ok) {
      const body = await upstream.json();
      if (Number.isFinite(body?.distance_km) && Number.isFinite(body?.duration_min)) {
        return response.status(200).json(body);
      }
    }
  } catch (_err) {
    // Upstream unavailable or timeout, proceed to fallback
  }

  const fallback = calculateHaversineFallback(
    coords.olat,
    coords.olon,
    coords.dlat,
    coords.dlon
  );

  return response.status(200).json(fallback);
};

