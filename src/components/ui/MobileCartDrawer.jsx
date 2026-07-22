import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatCurrencyBRL } from "../../utils/menu";

const MobileCartDrawer = () => {
  const { items, total } = useCart();
  const totalItens = items.reduce((acc, item) => acc + item.quantidade, 0);

  if (totalItens === 0) return null;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 animate-slide-up">
      <Link
        to="/checkout"
        className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 active:scale-95 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="bg-amber-500 text-slate-950 font-black text-xs h-7 w-7 rounded-full flex items-center justify-center">
            {totalItens}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-300">Ver Sacola</span>
            <span className="text-sm font-bold text-amber-400">{formatCurrencyBRL(total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow">
          <span>Finalizar</span>
          <span>→</span>
        </div>
      </Link>
    </div>
  );
};

export default MobileCartDrawer;
