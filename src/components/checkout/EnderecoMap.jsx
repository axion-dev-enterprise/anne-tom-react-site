// src/components/checkout/EnderecoMap.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { loadLeaflet } from "../../utils/leafletMap";

const DEFAULT_CENTER = { lat: -23.4983, lng: -46.6361 }; // Santana / Imirim - SP

const formatPreview = (address) => {
  if (!address) return "";
  const parts = [
    address.street,
    address.number ? `, ${address.number}` : "",
    address.neighborhood ? ` - ${address.neighborhood}` : "",
    address.city || address.state
      ? ` / ${[address.city, address.state].filter(Boolean).join(" - ")}`
      : "",
  ];
  return parts.join("").trim();
};

const buildAddressFromNominatim = (result) => {
  const address = result?.address || {};
  return {
    street: address.road || address.pedestrian || address.residential || address.suburb || "",
    number: address.house_number || "",
    neighborhood:
      address.neighbourhood || address.suburb || address.city_district || "",
    city: address.city || address.town || address.village || address.municipality || "São Paulo",
    state: address.state || "SP",
    postalCode: address.postcode || "",
    formatted: result?.display_name || "",
  };
};

const EnderecoMap = ({
  disabled = false,
  autoLocate = false,
  addressQuery = "",
  initialPosition = null,
  onAddressChange,
  onPositionChange,
}) => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const autoLocateRef = useRef(false);

  const [status, setStatus] = useState("loading"); // loading, ready, error
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  const reverseGeocodeCoords = useCallback(async (lat, lng, source = "map") => {
    try {
      setBusy(true);
      setMessage(source === "gps" ? "Obtendo endereço pelo GPS..." : "Identificando rua no mapa...");

      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (!res.ok) throw new Error("Falha ao consultar Nominatim");

      const data = await res.json();
      const address = buildAddressFromNominatim(data);
      setPreview(formatPreview(address) || data.display_name || "Endereço localizado");
      setMessage(source === "gps" ? "📍 Localização atualizada pelo GPS!" : "📍 Marcador atualizado!");
      setError("");

      onPositionChange?.({ lat, lng });
      onAddressChange?.(address);
    } catch (_err) {
      setPreview(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      setMessage("Marcador posicionado no mapa.");
      onPositionChange?.({ lat, lng });
    } finally {
      setBusy(false);
    }
  }, [onAddressChange, onPositionChange]);

  // Handle GPS location
  const handleGpsLocate = useCallback(() => {
    if (disabled) return;
    if (!navigator?.geolocation) {
      setError("GPS não suportado neste navegador.");
      return;
    }
    setBusy(true);
    setMessage("Solicitando GPS...");
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        reverseGeocodeCoords(lat, lng, "gps");
      },
      (err) => {
        setBusy(false);
        setError("Não foi possível obter sua localização atual via GPS.");
        console.warn("GPS error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [disabled, reverseGeocodeCoords]);

  // Handle address query search
  const handleAddressLocate = useCallback(async () => {
    if (disabled) return;
    const query = addressQuery || preview;
    if (!query || query.trim().length < 4) {
      setError("Digite um endereço ou CEP válido para buscar no mapa.");
      return;
    }
    try {
      setBusy(true);
      setMessage("Buscando endereço em São Paulo...");
      setError("");

      const fullQuery = query.toLowerCase().includes("são paulo")
        ? query
        : `${query}, Zona Norte, São Paulo - SP, Brasil`;

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`);
      const data = await res.json();

      if (!data || data.length === 0) {
        setError("Endereço não encontrado no mapa. Tente incluir número e bairro.");
        setBusy(false);
        return;
      }

      const best = data[0];
      const lat = parseFloat(best.lat);
      const lng = parseFloat(best.lon);

      if (leafletMapRef.current && markerRef.current) {
        leafletMapRef.current.setView([lat, lng], 16);
        markerRef.current.setLatLng([lat, lng]);
      }

      const address = buildAddressFromNominatim(best);
      setPreview(formatPreview(address) || best.display_name);
      setMessage("📍 Endereço localizado no mapa!");
      setError("");

      onPositionChange?.({ lat, lng });
      onAddressChange?.(address);
    } catch (_err) {
      setError("Não foi possível localizar este endereço no momento.");
    } finally {
      setBusy(false);
    }
  }, [addressQuery, disabled, onAddressChange, onPositionChange, preview]);

  // Initialize Leaflet Map
  useEffect(() => {
    let active = true;

    loadLeaflet()
      .then((L) => {
        if (!active || !mapContainerRef.current) return;

        // Prevent double init
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const startLat = initialPosition?.lat || DEFAULT_CENTER.lat;
        const startLng = initialPosition?.lng || DEFAULT_CENTER.lng;

        const map = L.map(mapContainerRef.current, {
          center: [startLat, startLng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // OpenStreetMap / CartoDB Voyager Streets Tile Layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);

        // Custom Leaflet Marker Icon
        const redIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
                  <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(239,68,68,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                  <div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:3px solid #ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px;">📍</div>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([startLat, startLng], {
          draggable: !disabled,
          icon: redIcon,
        }).addTo(map);

        marker.bindPopup("<b>📍 Seu Local de Entrega</b><br/>Arraste a marcação para ajustar").openPopup();

        // Marker Drag Event
        marker.on("dragend", () => {
          const { lat, lng } = marker.getLatLng();
          reverseGeocodeCoords(lat, lng, "drag");
        });

        // Map Click Event
        map.on("click", (e) => {
          if (disabled) return;
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          reverseGeocodeCoords(lat, lng, "click");
        });

        leafletMapRef.current = map;
        markerRef.current = marker;
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Leaflet init error:", err);
        if (active) setStatus("error");
      });

    return () => {
      active = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [disabled, initialPosition, reverseGeocodeCoords]);

  // Auto locate trigger
  useEffect(() => {
    if (disabled || status !== "ready" || autoLocateRef.current || !autoLocate) return;
    autoLocateRef.current = true;
    handleGpsLocate();
  }, [autoLocate, disabled, handleGpsLocate, status]);

  return (
    <div className="space-y-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGpsLocate}
            disabled={busy || disabled}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>🎯</span> Usar minha localização (GPS)
          </button>
          <button
            type="button"
            onClick={handleAddressLocate}
            disabled={busy || disabled}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>🔍</span> Buscar endereço no mapa
          </button>
        </div>

        {message && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
            {message}
          </span>
        )}
      </div>

      {/* Leaflet Interactive Map Container */}
      <div className="relative h-60 md:h-72 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100 shadow-md">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />
        
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-white text-xs font-semibold z-10 backdrop-blur-xs">
            <span className="animate-spin mr-2 text-amber-400">🌀</span> Carregando mapa interativo OpenStreetMap...
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-amber-300 text-xs font-semibold p-4 text-center z-10">
            ⚠️ Não foi possível carregar o mapa. Digite o endereço nos campos abaixo.
          </div>
        )}
      </div>

      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
        <span className="text-base">📌</span>
        <div>
          <span className="font-bold text-slate-900">Rua/Número detectados:</span>{" "}
          <span className="text-amber-700 font-medium">{preview || "Clique no mapa ou use o GPS para marcar."}</span>
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

export default EnderecoMap;
