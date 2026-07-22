// src/components/ui/DeliveryRouteMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { loadLeaflet } from "../../utils/leafletMap";

// Store / Pizzeria coordinates (Pizzaria Anne & Tom - Santana, SP)
const ANNE_TOM_STORE = { lat: -23.4983, lng: -46.6361 };
// Default destination coords (Imirim / Zona Norte, SP)
const DEFAULT_DESTINATION = { lat: -23.4795, lng: -46.6450 };

const DeliveryRouteMap = ({
  destinationAddress = "Zona Norte, São Paulo - SP",
  distanceKm = 3.8,
  etaMinutes = 35,
  orderStatus = "PREPARANDO", // RECEBIDO, PREPARANDO, EM_TRANSITO, ENTREGUE
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const motoboyMarkerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [destCoords, setDestCoords] = useState(DEFAULT_DESTINATION);

  const normalizedStatus = String(orderStatus || "").toUpperCase();
  const isEmTransito = normalizedStatus === "EM_TRANSITO" || normalizedStatus === "OUT_FOR_DELIVERY" || normalizedStatus === "DELIVERING" || normalizedStatus === "SAIU_PARA_ENTREGA";
  const isEntregue = normalizedStatus === "ENTREGUE" || normalizedStatus === "DELIVERED";

  // Geocode destination address
  useEffect(() => {
    let active = true;
    if (!destinationAddress) return;

    const query = destinationAddress.toLowerCase().includes("são paulo")
      ? destinationAddress
      : `${destinationAddress}, São Paulo - SP`;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data || data.length === 0) return;
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setDestCoords({ lat, lng });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [destinationAddress]);

  // Render Leaflet Route Map
  useEffect(() => {
    let active = true;

    loadLeaflet()
      .then((L) => {
        if (!active || !mapContainerRef.current) return;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const origin = [ANNE_TOM_STORE.lat, ANNE_TOM_STORE.lng];
        const dest = [destCoords.lat, destCoords.lng];

        const midLat = (ANNE_TOM_STORE.lat + destCoords.lat) / 2;
        const midLng = (ANNE_TOM_STORE.lng + destCoords.lng) / 2;

        const map = L.map(mapContainerRef.current, {
          center: [midLat, midLng],
          zoom: 14,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);

        const storeIcon = L.divIcon({
          className: "custom-store-marker",
          html: `<div style="width:34px;height:34px;border-radius:50%;background:#ffffff;border:3px solid #f59e0b;box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;">🍕</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const destIcon = L.divIcon({
          className: "custom-dest-marker",
          html: `<div style="width:34px;height:34px;border-radius:50%;background:#ef4444;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;">🏠</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        L.marker(origin, { icon: storeIcon })
          .addTo(map)
          .bindPopup("<b>🍕 Pizzaria Anne & Tom</b><br/>Alto de Santana - SP");

        L.marker(dest, { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>🏠 Local de Entrega</b><br/>${destinationAddress}`);

        const waypoints = [
          origin,
          [origin[0] + 0.005, origin[1] - 0.003],
          [dest[0] - 0.004, dest[1] + 0.002],
          dest,
        ];

        L.polyline(waypoints, {
          color: "#f59e0b",
          weight: 5,
          opacity: 0.85,
          dashArray: "10, 8",
        }).addTo(map);

        // Motoboy marker ADICIONADO APENAS SE ESTIVER EM TRÂNSITO OU ENTREGUE!
        if (isEmTransito || isEntregue) {
          const motoboyIcon = L.divIcon({
            className: "custom-motoboy-marker",
            html: `<div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
                    <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(245,158,11,0.4);animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>
                    <div style="width:34px;height:34px;border-radius:50%;background:#f59e0b;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🛵</div>
                   </div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });

          const motoboyPos = isEntregue ? dest : waypoints[2];
          const motoboyMarker = L.marker(motoboyPos, { icon: motoboyIcon })
            .addTo(map)
            .bindPopup("<b>🛵 Entrega em Andamento</b><br/>Motoboy Anne & Tom a caminho!");

          motoboyMarkerRef.current = motoboyMarker;
        }

        const bounds = L.latLngBounds([origin, dest]);
        map.fitBounds(bounds, { padding: [40, 40] });

        mapRef.current = map;
        setMapLoaded(true);
      })
      .catch((err) => {
        console.error("DeliveryRouteMap Leaflet error:", err);
      });

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [destCoords, destinationAddress, isEmTransito, isEntregue]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md select-none">
      {/* Header Banner - THEMA WHITE CLEAN */}
      <div className="bg-amber-500 text-slate-950 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-amber-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse" />
          <span className="font-black text-xs sm:text-sm tracking-wide">
            {isEmTransito ? "🛵 Motoboy a Caminho (Rota ao Vivo)" : isEntregue ? "✅ Pedido Entregue!" : "🍕 Pedido em Preparação na Pizzaria"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="bg-slate-950/15 text-slate-950 px-2.5 py-1 rounded-full">
            📏 {distanceKm} km
          </span>
          <span className="bg-white/30 text-slate-950 px-2.5 py-1 rounded-full">
            ⏱️ {etaMinutes} min ETA
          </span>
        </div>
      </div>

      {/* Leaflet Map Area */}
      <div className="relative h-64 md:h-80 w-full bg-slate-100">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-slate-900 text-xs font-bold z-10">
            <span className="animate-spin mr-2 text-amber-500">🌀</span> Carregando mapa de entrega interativo...
          </div>
        )}

        {/* Floating Badge (Somente quando em trânsito ou entregue) */}
        {isEmTransito && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/95 text-slate-900 border border-amber-400 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl">
            <span className="text-lg">🛵</span>
            <div>
              <div className="font-black text-amber-700">Motoboy Anne & Tom</div>
              <div className="text-[10px] text-slate-600 font-bold">A caminho do seu endereço</div>
            </div>
          </div>
        )}

        {!isEmTransito && !isEntregue && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/95 text-slate-900 border border-slate-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md">
            <span className="text-lg">🔥</span>
            <div>
              <div className="font-black text-slate-900">Em preparação no forno</div>
              <div className="text-[10px] text-slate-500">O motoboy sairá assim que ficar pronto</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-700 flex items-center justify-between">
        <span className="truncate">📍 <strong className="text-slate-900">Destino:</strong> {destinationAddress}</span>
      </div>
    </div>
  );
};

export default DeliveryRouteMap;
