import React, { useState, useMemo } from "react";
import { formatCurrencyBRL } from "../../utils/menu";
import { useToast } from "./ToastProvider";

const HalfPizzaBuilderModal = ({ isOpen, onClose, pizzas = [], onAddToCart }) => {
  const { addToast } = useToast();
  const [tamanho, setTamanho] = useState("G");
  const [sabor1Id, setSabor1Id] = useState("");
  const [sabor2Id, setSabor2Id] = useState("");

  const sabor1 = useMemo(() => pizzas.find((p) => String(p.id) === String(sabor1Id)), [pizzas, sabor1Id]);
  const sabor2 = useMemo(() => pizzas.find((p) => String(p.id) === String(sabor2Id)), [pizzas, sabor2Id]);

  const precoFinal = useMemo(() => {
    if (!sabor1 && !sabor2) return 0;
    const p1 = sabor1?.precos?.[tamanho] || sabor1?.precoUnitario || 0;
    const p2 = sabor2?.precos?.[tamanho] || sabor2?.precoUnitario || 0;
    return Math.max(p1, p2);
  }, [sabor1, sabor2, tamanho]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!sabor1Id || !sabor2Id) {
      addToast("Selecione os dois sabores para a pizza meia-a-meia.", "warning");
      return;
    }

    const itemHalfHalf = {
      id: `half-${sabor1.id}-${sabor2.id}-${tamanho}`,
      nome: `Pizza Meia-a-Meia (${sabor1.nome} / ${sabor2.nome})`,
      tamanho,
      quantidade: 1,
      precoUnitario: precoFinal,
      sabores: [sabor1.nome, sabor2.nome],
      imagem: sabor1.imagem || sabor2.imagem,
    };

    onAddToCart(itemHalfHalf);
    addToast("Pizza Meia-a-Meia adicionada ao carrinho!", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold">🍕 Monte sua Pizza Meia-a-Meia</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        {/* Tamanho */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Tamanho</label>
          <div className="grid grid-cols-3 gap-2">
            {["M", "G", "GG"].map((t) => (
              <button
                key={t}
                onClick={() => setTamanho(t)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  tamanho === t
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                {t === "M" ? "Média (6 fat)" : t === "G" ? "Grande (8 fat)" : "Gigante (10 fat)"}
              </button>
            ))}
          </div>
        </div>

        {/* Seleção Sabores */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">1º Sabor (50%)</label>
            <select
              value={sabor1Id}
              onChange={(e) => setSabor1Id(e.target.value)}
              className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-sm"
            >
              <option value="">-- Escolha o primeiro sabor --</option>
              {pizzas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({formatCurrencyBRL(p.precos?.[tamanho] || p.precoUnitario || 0)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">2º Sabor (50%)</label>
            <select
              value={sabor2Id}
              onChange={(e) => setSabor2Id(e.target.value)}
              className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-sm"
            >
              <option value="">-- Escolha o segundo sabor --</option>
              {pizzas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({formatCurrencyBRL(p.precos?.[tamanho] || p.precoUnitario || 0)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preço e confirmação */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Preço Final (Maior valor)</span>
            <span className="text-lg font-black text-amber-500">{formatCurrencyBRL(precoFinal)}</span>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700">Cancelar</button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalfPizzaBuilderModal;
