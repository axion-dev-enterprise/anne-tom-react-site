// src/utils/leafletMap.js
let leafletPromise = null;

export const loadLeaflet = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet can only be loaded in browser environment"));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletPromise) {
    return leafletPromise;
  }

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error("Leaflet script loaded but window.L is undefined"));
      }
    };
    script.onerror = (err) => {
      leafletPromise = null;
      reject(err);
    };
    document.body.appendChild(script);
  });

  return leafletPromise;
};
