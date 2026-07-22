// src/components/checkout/ResumoMobile.jsx
import React, { useState } from "react";

const ResumoMobile = ({ items, totalFinal }) => {
  const [aberto, setAberto] = useState(false);
  if (!items.length) return null;

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase font-black text-amber-400 tracking-wider">Total do Pedido</p>
          <p className="text-base font-black text-white">
            R$ {totalFinal.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition active:scale-95"
          onClick={() => setAberto(true)}
        >
          <span>Ver Resumo ({items.length})</span>
          <span>🛒</span>
        </button>
      </div>

      {aberto && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 flex items-end">
          <div className="premium-card w-full bg-white rounded-t-3xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">Resumo do pedido</p>
              <button
                className="text-[11px] text-slate-500"
                onClick={() => setAberto(false)}
              >
                Fechar
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto text-xs">
              <ul className="divide-y divide-slate-200">
                {items.map((item) => (
                  <li
                    key={`${item.id}-${item.tamanho}`}
                    className="py-2 flex justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.quantidade}x {item.nome}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {item.tamanho}
                      </p>
                      {Array.isArray(item.sabores) && item.sabores.length > 1 && (
                        <p className="text-[11px] text-slate-500">
                          Sabores: {item.sabores.join(" / ")}
                        </p>
                      )}
                      {!item.sabores && item.meio && (
                        <p className="text-[11px] text-slate-500">
                          Meio a meio com {item.meio}
                        </p>
                      )}
                      {item.borda && (
                        <p className="text-[11px] text-slate-500">
                          Borda: {item.borda}
                        </p>
                      )}
                      {Array.isArray(item.extras) &&
                        item.extras.length > 0 && (
                          <p className="text-[11px] text-slate-500">
                            Adicionais: {item.extras.join(", ")}
                          </p>
                        )}
                    </div>
                    <p className="text-slate-700">
                      R$ {(item.precoUnitario * item.quantidade)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <p className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>
                R$ {totalFinal.toFixed(2).replace(".", ",")}
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumoMobile;
