import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-slate-600 font-medium">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
