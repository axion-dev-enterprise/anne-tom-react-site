import React, { useEffect, useState } from "react";

const StoreStatusBanner = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("/api/business-hours")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => {});
  }, []);

  if (!status) return null;

  return (
    <div
      className={`w-full text-center text-xs py-2 px-4 font-semibold transition-all ${
        status.isOpen
          ? "bg-emerald-900 text-emerald-100 border-b border-emerald-800"
          : "bg-slate-900 text-amber-300 border-b border-slate-800"
      }`}
    >
      <span>{status.message}</span>
    </div>
  );
};

export default StoreStatusBanner;
