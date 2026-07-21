// src/components/checkout/CarrinhoStep.jsx
import React from "react";
import { Link } from "react-router-dom";

const CarrinhoStep = ({ items, updateQuantity, removeItem }) => {
  const flavorPalette = [
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-800",
  ];
  if (!items.length) {
    return (
      <p className="text-sm text-slate-500">
        Seu carrinho está vazio.{" "}
        <Link to="/cardapio" className="underline">
          Voltar ao cardápio
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const flavorList = Array.isArray(item.sabores)
          ? item.sabores
          : item?.nome?.includes(" / ")
          ? item.nome.split(" / ").map((name) => name.trim())
          : item.meio
          ? [item.nome, item.meio]
          : [];

        return (
          <div
            key={`${item.id}-${item.tamanho}`}
            className="premium-card flex justify-between items-center p-4 bg-white border border-slate-200 rounded-2xl"
          >
            <div className="space-y-1">
              <p className="font-semibold">
                {item.quantidade}x {item.nome}
              </p>
              <p className="text-[12px] text-slate-500">{item.tamanho}</p>
              {flavorList.length > 1 && (
                <div className="flex flex-wrap gap-1">
                  {flavorList.map((flavor, index) => (
                    <span
                      key={`${item.id}-${flavor}-${index}`}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        flavorPalette[index % flavorPalette.length]
                      }`}
                    >
                      {flavor}
                    </span>
                  ))}
                </div>
              )}
              {item.borda && (
                <p className="text-[11px] text-slate-500">
                  Borda: {item.borda}
                </p>
              )}
              {Array.isArray(item.extras) && item.extras.length > 0 && (
                <p className="text-[11px] text-slate-500">
                  Adicionais: {item.extras.join(", ")}
                </p>
              )}
              <p className="text-sm font-medium">
                R$ {(item.precoUnitario * item.quantidade)
                  .toFixed(2)
                  .replace(".", ",")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantidade}
                onChange={(e) =>
                  updateQuantity(
                    item.id,
                    item.tamanho,
                    Number(e.target.value) || 1
                  )
                }
                className="premium-field w-16 text-right text-xs"
              />
              <button
                onClick={() => removeItem(item.id, item.tamanho)}
                className="text-[11px] text-red-500 hover:text-red-600"
              >
                Remover
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CarrinhoStep;
