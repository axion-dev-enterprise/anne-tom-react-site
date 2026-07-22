import React, { useState } from "react";
import { formatCurrencyBRL } from "../../utils/menu";

const DRAFT_SODAS = [
  "Guaraná Antarctica 2L",
  "Coca-Cola Zero 2L",
  "Fanta Laranja 2L",
  "Soda Limonada 2L",
  "Guaraná Zero 2L",
];

const DynamicPromotionsBanner = ({ subtotal = 0, items = [], onSelectFreeDrink }) => {
  const [selectedFreeDrink, setSelectedFreeDrink] = useState(DRAFT_SODAS[0]);

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb

  // Conta quantidade de pizzas grandes no carrinho
  const pizzasGrandes = items.filter(
    (i) => i.tamanho === "grande" || i.tamanho === "G"
  ).reduce((acc, i) => acc + (i.quantidade || 1), 0);

  const isTercaQuarta = dayOfWeek === 2 || dayOfWeek === 3;
  const isQuinta = dayOfWeek === 4;
  const isFimDeSemana = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

  // Condições de brinde atingido
  const brindeRefriAtingido = isTercaQuarta && pizzasGrandes >= 1;
  const brindeBordaAtingido = isQuinta && pizzasGrandes >= 1;
  const brindeEsfihaAtingido = isFimDeSemana && subtotal >= 100;
  const freteGratisAtingido = isFimDeSemana && subtotal >= 120;

  const handleDrinkChange = (drink) => {
    setSelectedFreeDrink(drink);
    if (onSelectFreeDrink) {
      onSelectFreeDrink(drink);
    }
  };

  return (
    <div className="space-y-3 my-3">
      {/* Banner de Terça e Quarta */}
      {isTercaQuarta && (
        <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
          brindeRefriAtingido
            ? "bg-amber-50 border-amber-500 text-slate-900"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900">
              <span className="text-lg">🥤</span>
              <span>Promoção Terça & Quarta:</span>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black ${
              brindeRefriAtingido
                ? "bg-amber-500 text-slate-950 shadow"
                : "bg-slate-200 text-slate-700"
            }`}>
              {brindeRefriAtingido ? "REFRIGERANTE 2L GRÁTIS!" : "Adicione 1 Pizza Grande"}
            </span>
          </div>

          {/* Seleção do sabor do Refrigerante Grátis */}
          {brindeRefriAtingido && (
            <div className="mt-3 pt-3 border-t border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-900">
                🎁 Escolha o sabor do seu Refrigerante 2L:
              </span>
              <select
                value={selectedFreeDrink}
                onChange={(e) => handleDrinkChange(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border-2 border-amber-500 bg-white text-slate-900 text-xs font-bold shadow-sm focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {DRAFT_SODAS.map((drink) => (
                  <option key={drink} value={drink}>
                    {drink} (Grátis)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Banner de Quinta */}
      {isQuinta && (
        <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
          brindeBordaAtingido
            ? "bg-emerald-50 border-emerald-500 text-slate-900"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900">
              <span className="text-lg">🧀</span>
              <span>Quinta da Borda Grátis:</span>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black ${
              brindeBordaAtingido
                ? "bg-emerald-500 text-slate-950 shadow"
                : "bg-slate-200 text-slate-700"
            }`}>
              {brindeBordaAtingido ? "BORDA RECHEADA GRÁTIS!" : "Adicione 1 Pizza Grande"}
            </span>
          </div>
        </div>
      )}

      {/* Banner de Fim de Semana */}
      {isFimDeSemana && (
        <div className="space-y-2">
          <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
            brindeEsfihaAtingido
              ? "bg-amber-50 border-amber-500 text-slate-900"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-black text-slate-900">
              <span>🍩 Brinde Fim de Semana (Esfiha Doce):</span>
              <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                brindeEsfihaAtingido
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-slate-200 text-slate-700"
              }`}>
                {brindeEsfihaAtingido ? "ESFIHA DOCE GRÁTIS!" : `Faltam ${formatCurrencyBRL(Math.max(0, 100 - subtotal))}`}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
            freteGratisAtingido
              ? "bg-emerald-50 border-emerald-500 text-slate-900"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-black text-slate-900">
              <span>🚚 Frete Grátis Fim de Semana:</span>
              <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                freteGratisAtingido
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "bg-slate-200 text-slate-700"
              }`}>
                {freteGratisAtingido ? "FRETE GRÁTIS ATIVADO!" : `Faltam ${formatCurrencyBRL(Math.max(0, 120 - subtotal))}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPromotionsBanner;
