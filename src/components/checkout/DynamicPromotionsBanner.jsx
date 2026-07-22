import React from "react";
import { formatCurrencyBRL } from "../../utils/menu";

const DynamicPromotionsBanner = ({ subtotal = 0, items = [] }) => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb

  // Conta quantidade de pizzas grandes no carrinho
  const pizzasGrandes = items.filter(
    (i) => i.tamanho === "grande" || i.tamanho === "G"
  ).reduce((acc, i) => acc + i.quantidade, 0);

  const isTercaQuarta = dayOfWeek === 2 || dayOfWeek === 3;
  const isQuinta = dayOfWeek === 4;
  const isFimDeSemana = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

  // Condições de brinde atingido
  const brindeRefriAtingido = isTercaQuarta && pizzasGrandes >= 1;
  const brindeBordaAtingido = isQuinta && pizzasGrandes >= 1;
  const brindeEsfihaAtingido = isFimDeSemana && subtotal >= 100;
  const freteGratisAtingido = isFimDeSemana && subtotal >= 120;

  return (
    <div className="space-y-2 my-3">
      {/* Banner de Terça e Quarta */}
      {isTercaQuarta && (
        <div className={`p-3.5 rounded-2xl border transition-all ${
          brindeRefriAtingido
            ? "bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300"
            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
        }`}>
          <div className="flex items-center gap-2 font-bold text-xs">
            <span>🥤 Promoção Terça & Quarta:</span>
            <span>{brindeRefriAtingido ? "🎉 REFRIGERANTE 2L GRÁTIS ATIVADO!" : "Adicione 1 Pizza Grande para ganhar Refri 2L Grátis"}</span>
          </div>
        </div>
      )}

      {/* Banner de Quinta */}
      {isQuinta && (
        <div className={`p-3.5 rounded-2xl border transition-all ${
          brindeBordaAtingido
            ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300"
            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
        }`}>
          <div className="flex items-center gap-2 font-bold text-xs">
            <span>🧀 Quinta da Borda Grátis:</span>
            <span>{brindeBordaAtingido ? "🎁 BORDA RECHEADA GRÁTIS ATIVADA!" : "Adicione 1 Pizza Grande para ganhar Borda Recheada Grátis"}</span>
          </div>
        </div>
      )}

      {/* Banner de Fim de Semana */}
      {isFimDeSemana && (
        <div className="space-y-2">
          <div className={`p-3.5 rounded-2xl border transition-all ${
            brindeEsfihaAtingido
              ? "bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300"
              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
          }`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>🍩 Brinde Fim de Semana (Esfiha Doce):</span>
              <span>{brindeEsfihaAtingido ? "🎁 ESFIHA DOCE GRÁTIS!" : `Faltam ${formatCurrencyBRL(Math.max(0, 100 - subtotal))}`}</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border transition-all ${
            freteGratisAtingido
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300"
              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
          }`}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>🚚 Frete Grátis Fim de Semana:</span>
              <span>{freteGratisAtingido ? "🚀 FRETE GRÁTIS ATIVADO!" : `Faltam ${formatCurrencyBRL(Math.max(0, 120 - subtotal))}`}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPromotionsBanner;
