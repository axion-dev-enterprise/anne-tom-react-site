import React from "react";

const RetryBanner = ({ message, onRetry }) => (
  <div className="max-w-6xl mx-auto px-4 mt-6">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5">
      <p className="flex-1 text-left">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-full border border-amber-600 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 transition hover:bg-amber-100"
        >
          Tentar novamente
        </button>
      )}
    </div>
  </div>
);

export default RetryBanner;
