import React, { useState } from "react";

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
  const isSextaSabado = dayOfWeek === 5 || dayOfWeek === 6;
  const isDomingo = dayOfWeek === 0;

  // Conta refrigerante no carrinho
  const temRefrigerante = items.some(
    (i) => (i.nome || i.name || "").toLowerCase().includes("refrigerante") || (i.nome || i.name || "").toLowerCase().includes("coca") || (i.nome || i.name || "").toLowerCase().includes("guaran")
  );

  // Condições de brinde atingido conforme diretriz 02_promocoes_semanais
  const brindeEsfirraTercaQuartaAtingido = isTercaQuarta && pizzasGrandes >= 1 && temRefrigerante;
  const brindeBordaQuintaAtingido = isQuinta && pizzasGrandes >= 1;
  const brindeRefriSextaSabadoAtingido = isSextaSabado && pizzasGrandes >= 2;
  const brindeDomingoAtingido = isDomingo && pizzasGrandes >= 1;

  const handleDrinkChange = (drink) => {
    setSelectedFreeDrink(drink);
    if (onSelectFreeDrink) {
      onSelectFreeDrink(drink);
    }
  };

  return (
    <div className="space-y-3 my-3">
      {/* Banner de Terça e Quarta: Big Esfirra Prestígio Grátis */}
      {isTercaQuarta && (
        <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
          brindeEsfirraTercaQuartaAtingido
            ? "bg-amber-50 border-amber-500 text-slate-900"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900">
              <span className="text-lg">🍫</span>
              <span>Promoção Terça & Quarta:</span>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black ${
              brindeEsfirraTercaQuartaAtingido
                ? "bg-amber-500 text-slate-950 shadow"
                : "bg-slate-200 text-slate-700"
            }`}>
              {brindeEsfirraTercaQuartaAtingido ? "BIG ESFIRRA PRESTÍGIO GRÁTIS!" : "1 Pizza Grande + 1 Refrigerante"}
            </span>
          </div>
        </div>
      )}

      {/* Banner de Quinta: Borda de Requeijão Grátis */}
      {isQuinta && (
        <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
          brindeBordaQuintaAtingido
            ? "bg-emerald-50 border-emerald-500 text-slate-900"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900">
              <span className="text-lg">🧀</span>
              <span>Quinta da Borda Grátis:</span>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black ${
              brindeBordaQuintaAtingido
                ? "bg-emerald-500 text-slate-950 shadow"
                : "bg-slate-200 text-slate-700"
            }`}>
              {brindeBordaQuintaAtingido ? "BORDA DE REQUEIJÃO GRÁTIS!" : "Adicione 1 Pizza Grande"}
            </span>
          </div>
        </div>
      )}

      {/* Banner de Sexta e Sábado: Refrigerante 2L Grátis */}
      {isSextaSabado && (
        <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
          brindeRefriSextaSabadoAtingido
            ? "bg-amber-50 border-amber-500 text-slate-900"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900">
              <span className="text-lg">🥤</span>
              <span>Sexta & Sábado em Família:</span>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black ${
              brindeRefriSextaSabadoAtingido
                ? "bg-amber-500 text-slate-950 shadow"
                : "bg-slate-200 text-slate-700"
            }`}>
              {brindeRefriSextaSabadoAtingido ? "REFRIGERANTE 2L GRÁTIS!" : "Adicione 2 Pizzas Grandes"}
            </span>
          </div>

          {brindeRefriSextaSabadoAtingido && (
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

      {/* Banner de Domingo: Escolha o Brinde */}
      {isDomingo && (
        <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
          brindeDomingoAtingido
            ? "bg-purple-50 border-purple-500 text-slate-900"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900">
              <span className="text-lg">⭐</span>
              <span>Domingo Especial (Sua Escolha):</span>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black ${
              brindeDomingoAtingido
                ? "bg-purple-600 text-white shadow"
                : "bg-slate-200 text-slate-700"
            }`}>
              {brindeDomingoAtingido ? "BRINDE ESPECIAL ATIVADO!" : "Adicione 1 Pizza Grande"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPromotionsBanner;
