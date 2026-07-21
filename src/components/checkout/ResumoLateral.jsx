// src/components/checkout/ResumoLateral.jsx
import React, { useMemo } from "react";
import { useMenuData } from "../../hooks/useMenuData";
import { formatCurrencyBRL } from "../../utils/menu";
import UpsellBox from "./UpsellBox";

const buildSuggestedPizzas = (pizzas, limit = 3) => {
  const valid = pizzas.filter(
    (pizza) => pizza.preco_grande != null || pizza.preco_broto != null
  );
  const best = valid.filter((pizza) => pizza.badges?.includes("best"));
  const pool = best.length ? best : valid;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, limit);
};

const resolvePizzaSize = (pizza) =>
  pizza.preco_grande != null ? "grande" : "broto";

const resolvePizzaPrice = (pizza) =>
  pizza.preco_grande != null ? pizza.preco_grande : pizza.preco_broto;

const ResumoLateral = ({
  items,
  subtotal,
  taxaEntrega,
  desconto,
  totalFinal,
  addItem,
}) => {
  const { pizzas, loadingMenu } = useMenuData();
  const suggestedPizzas = useMemo(
    () => buildSuggestedPizzas(pizzas),
    [pizzas]
  );

  const handleAddSuggestion = (pizza) => {
    if (!addItem) return;
    const tamanho = resolvePizzaSize(pizza);
    const precoUnitario = resolvePizzaPrice(pizza);
    if (precoUnitario == null) return;

    addItem({
      id: `pizza-${pizza.id}-${Date.now()}`,
      idPizza: pizza.id,
      nome: pizza.nome,
      tamanho,
      quantidade: 1,
      precoUnitario,
    });
  };

  if (!items.length) {
    return (
      <div className="premium-card bg-white border border-slate-200 rounded-2xl p-4 text-sm shadow-sm space-y-3">
        <div>
          <p className="font-semibold text-slate-800 mb-1 text-base">
            Carrinho vazio por enquanto
          </p>
          <p className="text-slate-500">
            Adicione algumas pizzas para liberar o resumo do pedido.
          </p>
        </div>

        {loadingMenu && (
          <p className="text-[12px] text-slate-400">
            Carregando sugestoes...
          </p>
        )}

        {suggestedPizzas.length > 0 && (
          <div className="space-y-2">
            <p className="text-[12px] uppercase tracking-wide text-slate-400">
              Sugestoes do cardapio
            </p>
            {suggestedPizzas.map((pizza) => (
              <button
                key={pizza.id}
                type="button"
                onClick={() => handleAddSuggestion(pizza)}
                className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {pizza.nome}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tamanho {resolvePizzaSize(pizza)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {formatCurrencyBRL(resolvePizzaPrice(pizza) || 0)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="premium-card bg-white border border-slate-200 rounded-2xl p-4 text-xs shadow-sm space-y-3">
      <p className="font-semibold text-slate-800">Resumo do pedido</p>
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
              <p className="text-[11px] text-slate-500">{item.tamanho}</p>
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
              {Array.isArray(item.extras) && item.extras.length > 0 && (
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
      <div className="space-y-1 pt-1 border-t border-slate-100">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
        </p>
        <p className="flex justify-between">
          <span>Entrega</span>
          <span>R$ {taxaEntrega.toFixed(2).replace(".", ",")}</span>
        </p>
        {desconto > 0 && (
          <p className="flex justify-between text-emerald-600">
            <span>Desconto</span>
            <span>- R$ {desconto.toFixed(2).replace(".", ",")}</span>
          </p>
        )}
        <p className="flex justify-between font-semibold pt-1">
          <span>Total</span>
          <span>R$ {totalFinal.toFixed(2).replace(".", ",")}</span>
        </p>
      </div>

      {/* Upsell de bebida */}
      <UpsellBox addItem={addItem} />
    </div>
  );
};

export default ResumoLateral;
