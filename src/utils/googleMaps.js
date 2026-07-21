let loaderPromise = null;

const DEFAULT_MATRIX_API_URL = "/api/matrix-route";
const DEFAULT_ORIGIN = { lat: -23.50189, lon: -46.62529 };

const formatDistance = (distanceKm) => `${Number(distanceKm).toFixed(1)} km`;
const formatDuration = (durationMin) => `${Math.round(Number(durationMin))} min`;

const getMatrixApiUrl = () =>
  (process.env.REACT_APP_MATRIX_API_URL || DEFAULT_MATRIX_API_URL).replace(/\/$/, "");

export const loadGoogleMaps = (apiKey) => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps only runs in browser"));
  }

  if (window.google?.maps) return Promise.resolve(window.google);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (!apiKey) {
      reject(new Error("Missing Google Maps API key"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google?.maps ? resolve(window.google) : reject(new Error("Google Maps failed to load"));
    script.onerror = () => reject(new Error("Google Maps script error"));
    document.head.appendChild(script);
  });

  return loaderPromise;
};

const geocodeDestination = async (destination) => {
  const url = `/api/geocode?${new URLSearchParams({ address: destination }).toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Destination geocoding failed");

  const result = await response.json();
  const lat = Number.parseFloat(result?.lat);
  const lon = Number.parseFloat(result?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Destination not found");
  }

  return { lat, lon };
};

const getDistanceMatrixFromAxion = async (destination) => {
  const destinationCoordinates = await geocodeDestination(destination);
  const url = new URL(
    getMatrixApiUrl(),
    typeof window === "undefined" ? "https://anne-tom-react-site.vercel.app" : window.location.origin
  );
  url.search = new URLSearchParams({
    olat: String(DEFAULT_ORIGIN.lat),
    olon: String(DEFAULT_ORIGIN.lon),
    dlat: String(destinationCoordinates.lat),
    dlon: String(destinationCoordinates.lon),
  }).toString();

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Matrix route request failed");

  const route = await response.json();
  if (!Number.isFinite(route?.distance_km) || !Number.isFinite(route?.duration_min)) {
    throw new Error("Matrix route response is invalid");
  }

  return {
    distanceText: formatDistance(route.distance_km),
    durationText: formatDuration(route.duration_min),
  };
};

export const getDistanceMatrix = async ({ apiKey, destination }) => {
  if (!apiKey || apiKey === "AIzaSy..." || apiKey.includes("KEY")) {
    return getDistanceMatrixFromAxion(destination);
  }

  try {
    const google = await loadGoogleMaps(apiKey);
    return new Promise((resolve, reject) => {
      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [DEFAULT_ORIGIN],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status !== "OK") return reject(new Error(`DistanceMatrix status: ${status}`));
          const element = response?.rows?.[0]?.elements?.[0];
          if (!element || element.status !== "OK") {
            return reject(new Error("DistanceMatrix invalid response"));
          }
          return resolve({
            distanceText: element.distance?.text || "",
            durationText: element.duration?.text || "",
          });
        }
      );
    });
  } catch (error) {
    console.warn("Google DistanceMatrix failed, falling back to Axion Matrix...", error);
    return getDistanceMatrixFromAxion(destination);
  }
};
