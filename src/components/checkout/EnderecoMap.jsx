// src/components/checkout/EnderecoMap.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../../utils/googleMaps";

const DEFAULT_CENTER = { lat: -23.4983, lng: -46.6361 };

const extractComponent = (components, type) => {
  if (!Array.isArray(components)) return "";
  const found = components.find((item) => item.types?.includes(type));
  return found?.long_name || found?.short_name || "";
};

const buildAddressFromResult = (result) => {
  const components = result?.address_components || [];
  const street = extractComponent(components, "route");
  const number = extractComponent(components, "street_number");
  const neighborhood =
    extractComponent(components, "sublocality_level_1") ||
    extractComponent(components, "sublocality") ||
    extractComponent(components, "neighborhood");
  const city =
    extractComponent(components, "administrative_area_level_2") ||
    extractComponent(components, "locality");
  const state = extractComponent(components, "administrative_area_level_1");
  const postalCode = extractComponent(components, "postal_code");

  return {
    street,
    number,
    neighborhood,
    city,
    state,
    postalCode,
    formatted: result?.formatted_address || "",
  };
};

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
    street: address.road || address.pedestrian || address.residential || "",
    number: address.house_number || "",
    neighborhood:
      address.neighbourhood || address.suburb || address.city_district || "",
    city: address.city || address.town || address.village || address.municipality || "",
    state: address.state || "",
    postalCode: address.postcode || "",
    formatted: result?.display_name || "",
  };
};

const geocodeWithFallback = async ({ address, lat, lng }) => {
  const params = new URLSearchParams();
  if (address) params.set("address", address);
  if (lat != null && lng != null) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
  }
  const response = await fetch(`/api/geocode?${params.toString()}`);
  if (!response.ok) throw new Error("Address geocoding failed");
  return response.json();
};

const EnderecoMap = ({
  apiKey,
  disabled = false,
  autoLocate = false,
  addressQuery = "",
  initialPosition = null,
  onAddressChange,
  onPositionChange,
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const mapContainerRef = useRef(null);
  const pendingGeocodeRef = useRef(0);
  const autoLocateRef = useRef(false);
  
  // Use refs for functions to avoid dependency issues
  const reverseGeocodeRef = useRef();
  const setMarkerPositionRef = useRef();
  const notifyPositionRef = useRef();

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  const applyFallbackResult = useCallback(
    (result, source) => {
      const lat = Number(result?.lat);
      const lng = Number(result?.lon);
      const address = buildAddressFromNominatim(result);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Invalid geocoding response");
      }
      setPreview(formatPreview(address) || address.formatted || "");
      setMessage(
        source === "gps"
          ? "Localizacao atualizada pelo GPS."
          : "Endereco localizado."
      );
      setError("");
      onPositionChange?.({ lat, lng });
      onAddressChange?.(address);
    },
    [onAddressChange, onPositionChange]
  );

  const notifyPosition = useCallback(
    (position, address) => {
      if (position && onPositionChange) {
        onPositionChange({
          lat: position.lat(),
          lng: position.lng(),
        });
      }
      if (address && onAddressChange) {
        onAddressChange(address);
      }
    },
    [onAddressChange, onPositionChange]
  );

  // Store the latest notifyPosition in ref
  notifyPositionRef.current = notifyPosition;

  const reverseGeocode = useCallback(
    (google, latLng, source) => {
      if (!google || !latLng) return;
      const requestId = ++pendingGeocodeRef.current;
      const geocoder = geocoderRef.current;
      if (!geocoder) return;

      geocoder.geocode({ location: latLng }, (results, geocodeStatus) => {
        if (requestId !== pendingGeocodeRef.current) return;

        if (geocodeStatus !== "OK" || !results?.length) {
          setError("Nao foi possivel identificar a rua e numero.");
          setPreview("");
          return;
        }

        const best = results[0];
        const address = buildAddressFromResult(best);
        setPreview(formatPreview(address) || address.formatted || "");
        setMessage(
          source === "gps"
            ? "Localizacao atualizada pelo GPS."
            : "Endereco atualizado pelo mapa."
        );
        setError("");
        // Use ref to avoid dependency issues
        notifyPositionRef.current?.(latLng, address);
      });
    },
    [] // No dependencies needed
  );

  // Store reverseGeocode in ref
  reverseGeocodeRef.current = reverseGeocode;

  const setMarkerPosition = useCallback((google, latLng) => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setPosition(latLng);
    mapRef.current.panTo(latLng);
    if (google?.maps?.event) {
      google.maps.event.trigger(mapRef.current, "resize");
    }
  }, []); // No dependencies needed

  // Store setMarkerPosition in ref
  setMarkerPositionRef.current = setMarkerPosition;

  const handleGpsLocate = useCallback(() => {
    if (disabled) return;
    if (!navigator?.geolocation) {
      setError("GPS indisponivel neste dispositivo.");
      return;
    }
    setBusy(true);
    setMessage("Buscando sua localizacao atual...");
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords || {};
        if (latitude == null || longitude == null) {
          setError("Nao foi possivel obter sua localizacao.");
          setBusy(false);
          return;
        }
        const google = window.google;
        if (google?.maps && status === "ready") {
          const latLng = new google.maps.LatLng(latitude, longitude);
          setMarkerPositionRef.current?.(google, latLng);
          reverseGeocodeRef.current?.(google, latLng, "gps");
          setBusy(false);
          return;
        }

        geocodeWithFallback({ lat: latitude, lng: longitude })
          .then((result) => applyFallbackResult(result, "gps"))
          .catch(() => setError("Nao foi possivel identificar seu endereco pelo GPS."))
          .finally(() => setBusy(false));
      },
      () => {
        setError("Nao foi possivel acessar sua localizacao.");
        setMessage("");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, [applyFallbackResult, disabled, status]);

  const handleAddressLocate = useCallback(() => {
    if (disabled) return;
    if (!addressQuery || addressQuery.trim().length < 5) {
      setError("Informe um endereco para localizar no mapa.");
      return;
    }
    const google = window.google;
    if (!google?.maps || status !== "ready") {
      setBusy(true);
      setMessage("Localizando endereco...");
      setError("");
      geocodeWithFallback({ address: addressQuery })
        .then((result) => applyFallbackResult(result, "address"))
        .catch(() => setError("Nao foi possivel localizar esse endereco."))
        .finally(() => setBusy(false));
      return;
    }
    setBusy(true);
    setMessage("Localizando endereco no mapa...");
    setError("");

    geocoderRef.current.geocode(
      { address: addressQuery },
      (results, geocodeStatus) => {
        setBusy(false);
        if (geocodeStatus !== "OK" || !results?.length) {
          setError("Nao foi possivel localizar esse endereco.");
          return;
        }
        const best = results[0];
        const latLng = best.geometry?.location;
        const address = buildAddressFromResult(best);
        setMarkerPositionRef.current?.(google, latLng);
        setPreview(formatPreview(address) || address.formatted || "");
        setMessage("Endereco sincronizado com o mapa.");
        setError("");
        notifyPositionRef.current?.(latLng, address);
      }
    );
  }, [addressQuery, applyFallbackResult, disabled, status]);

  useEffect(() => {
    if (disabled) return;
    if (!apiKey) {
      setStatus("fallback");
      setError("");
      return;
    }

    let active = true;
    setStatus("loading");
    loadGoogleMaps(apiKey)
      .then((google) => {
        if (!active || !mapContainerRef.current) return;
        const center = initialPosition
          ? new google.maps.LatLng(
              initialPosition.lat,
              initialPosition.lng
            )
          : new google.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);

        mapRef.current = new google.maps.Map(mapContainerRef.current, {
          center,
          zoom: initialPosition ? 17 : 14,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });

        markerRef.current = new google.maps.Marker({
          position: center,
          map: mapRef.current,
          draggable: true,
        });

        geocoderRef.current = new google.maps.Geocoder();

        markerRef.current.addListener("dragend", () => {
          const newPos = markerRef.current.getPosition();
          reverseGeocodeRef.current?.(google, newPos, "drag");
        });

        setStatus("ready");
        if (initialPosition) {
          reverseGeocodeRef.current?.(google, center, "init");
        }
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
        setError("Nao foi possivel carregar o mapa.");
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, disabled]);

  // Store handleGpsLocate in ref for useEffect
  const handleGpsLocateRef = useRef(handleGpsLocate);
  handleGpsLocateRef.current = handleGpsLocate;

  useEffect(() => {
    if (disabled || (status !== "ready" && status !== "fallback")) return;
    if (!autoLocate || autoLocateRef.current) return;
    if (initialPosition) return;
    autoLocateRef.current = true;
    handleGpsLocateRef.current?.();
  }, [autoLocate, disabled, status, initialPosition]); // Added initialPosition back

  const mapUnavailable =
    status !== "ready" || disabled || !apiKey || !mapContainerRef.current;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <button
          type="button"
          onClick={handleGpsLocate}
          disabled={busy || disabled}
          className="premium-button-ghost px-3 py-1.5 text-[11px] disabled:opacity-60"
        >
          Usar minha localizacao
        </button>
        <button
          type="button"
          onClick={handleAddressLocate}
          disabled={busy || disabled}
          className="premium-button-ghost px-3 py-1.5 text-[11px] disabled:opacity-60"
        >
          Buscar endereco no mapa
        </button>
        {message && (
          <span className="text-[11px] text-amber-600 font-medium">{message}</span>
        )}
      </div>

      <div className="relative h-56 md:h-64 rounded-2xl border border-slate-200 overflow-hidden bg-[#1e2430] shadow-inner">
        <div ref={mapContainerRef} className="absolute inset-0" />
        {mapUnavailable && (
          <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
            {/* OpenSource Map Grid Background */}
            <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
              <pattern id="checkout-street-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#64748b" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#checkout-street-grid)" />
            </svg>

            {/* OpenSource Map Roads & Pin */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M 10 140 Q 150 120 380 90" fill="none" stroke="#334155" strokeWidth="14" strokeLinecap="round" />
              <path d="M 180 10 L 180 220" fill="none" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
              <path d="M 10 140 Q 150 120 380 90" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5 3" />

              {/* Pin Target */}
              <g transform="translate(180, 120)">
                <circle r="14" fill="#ef4444" fillOpacity="0.25" className="animate-ping" />
                <circle r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="-12" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">📍 Seu Endereço</text>
              </g>
            </svg>

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="bg-slate-900/90 border border-slate-700 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Mapa Interativo OpenSource</span>
              </span>
              <span className="bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] px-2 py-1 rounded-full backdrop-blur-md">
                Zona Norte · SP
              </span>
            </div>

            {/* Bottom Status Hint */}
            <div className="relative z-10 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-white text-xs backdrop-blur-md">
              <p className="font-semibold text-amber-400 flex items-center gap-1">
                <span>📍</span> {preview || "Aguardando localização via GPS ou busca..."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-600">
        <span className="font-semibold text-slate-700">
          Rua/numero detectados:
        </span>{" "}
        {preview || "Aguardando localizacao."}
      </div>

      {error && (
        <p className="text-[11px] text-amber-600">{error}</p>
      )}
    </div>
  );
};

export default EnderecoMap;
