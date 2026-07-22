// src/components/ui/DeliveryRouteMap.jsx
import React, { useEffect, useState } from "react";

export const DeliveryRouteMap = ({
  destinationAddress = "Santana, São Paulo - SP",
  distanceKm = 3.8,
  etaMinutes = 28,
  orderStatus = "EM_TRANSITO", // PREPARANDO | EM_TRANSITO | ENTREGUE
}) => {
  const [progress, setProgress] = useState(0.45); // 0 to 1 along route

  useEffect(() => {
    if (orderStatus === "EM_TRANSITO") {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 0.95 ? 0.2 : prev + 0.05));
      }, 2500);
      return () => clearInterval(interval);
    } else if (orderStatus === "ENTREGUE") {
      setProgress(1.0);
    } else {
      setProgress(0.1);
    }
  }, [orderStatus]);

  // Calculate Motoboy position on curved path
  const motoboyX = 60 + progress * 260;
  const motoboyY = 160 - Math.sin(progress * Math.PI) * 40 - progress * 80;

  return (
    <div className="delivery-route-map bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-white relative">
      {/* Map Header Overlay */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <p className="text-xs font-bold text-slate-200">Rota de Entrega OpenSource</p>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">{destinationAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-black text-amber-400 block">{distanceKm} km</span>
            <span className="text-[10px] text-slate-400">Distância</span>
          </div>
          <div className="text-right bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
            <span className="text-xs font-black text-amber-400 block">~{etaMinutes} min</span>
            <span className="text-[10px] text-amber-300/80">Previsão ETA</span>
          </div>
        </div>
      </div>

      {/* Stylized OpenStreetMap Canvas Vector View */}
      <div className="relative w-full h-56 sm:h-64 bg-[#1e2430] overflow-hidden select-none">
        {/* Grid lines simulating map streets */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <pattern id="street-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#street-grid)" />
        </svg>

        {/* Map Decorative Road Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Main Avenue background */}
          <path d="M 40 170 Q 180 140 340 70" fill="none" stroke="#334155" strokeWidth="16" strokeLinecap="round" />
          {/* Active Route Glow */}
          <path d="M 50 160 Q 180 130 320 80" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
          {/* Active Route Path */}
          <path d="M 50 160 Q 180 130 320 80" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="6 4" />

          {/* Origin Marker (Pizzaria) */}
          <g transform="translate(45, 160)">
            <circle r="14" fill="#10b981" fillOpacity="0.2" className="animate-pulse" />
            <circle r="8" fill="#10b981" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">🍕</text>
          </g>

          {/* Destination Marker (Client Address) */}
          <g transform="translate(320, 80)">
            <circle r="14" fill="#ef4444" fillOpacity="0.2" className="animate-pulse" />
            <circle r="8" fill="#ef4444" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">🏠</text>
          </g>

          {/* Motoboy Animated Marker */}
          <g transform={`translate(${motoboyX}, ${motoboyY})`} className="transition-all duration-700 ease-out">
            <circle r="16" fill="#f59e0b" fillOpacity="0.3" className="animate-ping" />
            <circle r="12" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="12">🛵</text>
          </g>
        </svg>

        {/* Origin Label Tag */}
        <div className="absolute left-3 bottom-3 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 shadow-lg">
          <span>🍕</span> Anne & Tom (Alto de Santana)
        </div>

        {/* Destination Label Tag */}
        <div className="absolute right-3 top-14 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-rose-400 flex items-center gap-1.5 shadow-lg">
          <span>🏠</span> Destino de Entrega
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Status: <strong className="text-amber-400">
            {orderStatus === "PREPARANDO" && "Em Preparação no Forno"}
            {orderStatus === "EM_TRANSITO" && "Motoboy a Caminho"}
            {orderStatus === "ENTREGUE" && "Pedido Entregue"}
          </strong></span>
        </div>
        <span className="text-[10px] text-slate-400">OpenSource Maps Engine v2.0</span>
      </div>
    </div>
  );
};

export default DeliveryRouteMap;
