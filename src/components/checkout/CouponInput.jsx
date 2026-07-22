import React, { useState } from "react";
import { useToast } from "../ui/ToastProvider";
import { formatCurrencyBRL } from "../../utils/menu";

const CouponInput = ({ subtotal, onApplyCoupon, currentCoupon }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleValidateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast(data.message || "Cupom inválido.", "error");
        return;
      }

      onApplyCoupon(data);
      addToast(`Cupom ${data.code} aplicado! Desconto: ${formatCurrencyBRL(data.discountAmount)}`, "success");
      setCode("");
    } catch {
      addToast("Não foi possível validar o cupom agora.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
        Possui um cupom de desconto?
      </label>

      {currentCoupon ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg">
              {currentCoupon.code}
            </span>
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              -{formatCurrencyBRL(currentCoupon.discountAmount)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onApplyCoupon(null)}
            className="text-xs text-rose-600 hover:underline font-semibold"
          >
            Remover
          </button>
        </div>
      ) : (
        <form onSubmit={handleValidateCoupon} className="flex gap-2">
          <input
            type="text"
            placeholder="Ex: ANNETOM10"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase font-mono"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Validando..." : "Aplicar"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CouponInput;
