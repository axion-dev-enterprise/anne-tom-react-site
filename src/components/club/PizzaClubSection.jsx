import React, { useState } from "react";

const PizzaClubSection = () => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="my-8 px-4 max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-3 backdrop-blur-sm">
            <span>✨ CLUBE DA PIZZA ANNE & TOM</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Assine por apenas <span className="underline decoration-amber-300">R$ 69,90/mês</span>
              </h2>
              <p className="text-amber-100 text-sm mt-1 max-w-xl font-medium">
                Economize todo mês e garanta benefícios exclusivos direto no seu delivery.
              </p>

              {/* Grid de benefícios mobile-first */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
                  <span className="text-xl">🍫</span>
                  <span className="text-xs font-bold">1 Big Esfirra Prestígio grátis/mês</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
                  <span className="text-xl">🧀</span>
                  <span className="text-xs font-bold">1 Borda de requeijão grátis/mês</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
                  <span className="text-xl">🚚</span>
                  <span className="text-xs font-bold">1 Frete grátis por mês (consultar raio)</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
                  <span className="text-xl">⭐</span>
                  <span className="text-xs font-bold">Descontos e acúmulo acelerado</span>
                </div>
              </div>
            </div>

            {/* Ação Principal */}
            <div className="shrink-0 flex flex-col items-center md:items-end justify-center pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => {
                  setSubscribed(true);
                  alert("🎉 Redirecionando para assinatura Mercado Pago no valor de R$ 69,90/mês...");
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm sm:text-base shadow-2xl transition transform active:scale-95 text-center"
              >
                {subscribed ? "Assinatura Ativa ✅" : "Quero assinar por R$ 69,90/mês →"}
              </button>
              <span className="text-[11px] text-amber-200 mt-2 font-medium">
                Cobrança recorrente via Mercado Pago • Cancele quando quiser
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PizzaClubSection;
