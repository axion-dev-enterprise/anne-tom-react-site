import React, { useState, useEffect } from "react";
import { formatCurrencyBRL } from "../../utils/menu";
import { useToast } from "./ToastProvider";

const DEFAULT_BORDAS = [
  { id: "borda-sem", nome: "Sem borda", preco: 0 },
  { id: "borda-catupiry", nome: "Borda Catupiry® Original", preco: 18 },
  { id: "borda-cheddar", nome: "Borda Cheddar Cremoso", preco: 18 },
  { id: "borda-dois-queijos", nome: "Borda Dois Queijos (Catupiry + Mussarela)", preco: 20 },
  { id: "borda-frango-catupiry", nome: "Borda Frango com Catupiry", preco: 22 },
  { id: "borda-paozinho", nome: "Borda Pãozinho Especial Dois Queijos", preco: 26 },
  { id: "borda-doce", nome: "Borda Doce de Leite / Chocolate", preco: 20 },
];

const DEFAULT_EXTRAS = [
  { id: "extra-bacon", nome: "Bacon crocante extra", preco: 6 },
  { id: "extra-catupiry", nome: "Catupiry® extra", preco: 8 },
  { id: "extra-cheddar", nome: "Cheddar cremoso extra", preco: 8 },
  { id: "extra-mussarela", nome: "Queijo Mussarela extra", preco: 7 },
  { id: "extra-alho", nome: "Alho frito dourado extra", preco: 4 },
  { id: "extra-milho", nome: "Milho verde extra", preco: 4 },
  { id: "extra-palmito", nome: "Palmito especial extra", preco: 8 },
  { id: "extra-cebola", nome: "Cebola fatiada extra", preco: 3 },
  { id: "extra-azeitonas", nome: "Azeitonas pretas extra", preco: 4 },
  { id: "extra-manjericao", nome: "Manjericão fresco extra", preco: 3 },
  { id: "extra-pepperoni", nome: "Pepperoni extra", preco: 9 },
];

const ProductCustomizerModal = ({
  isOpen,
  onClose,
  pizza,
  allPizzas = [],
  onAddToCart,
  isOpenNow = true,
}) => {
  const { addToast } = useToast();

  const [tamanho, setTamanho] = useState("grande");
  const [numSabores, setNumSabores] = useState(1); // 1, 2 ou 3
  const [sabor1, setSabor1] = useState(null);
  const [sabor2, setSabor2] = useState(null);
  const [sabor3, setSabor3] = useState(null);

  const [searchSabor, setSearchSabor] = useState("");
  const [activeSelectSlot, setActiveSelectSlot] = useState(2); // qual slot está escolhendo no momento (2 ou 3)

  const [bordaId, setBordaId] = useState("borda-sem");
  const [quantidade, setQuantidade] = useState(1);
  const [obsPizza, setObsPizza] = useState("");

  // Extras por sabor: { 1: [extraId1, extraId2], 2: [...], 3: [...] }
  const [extrasPorSabor, setExtrasPorSabor] = useState({ 1: [], 2: [], 3: [] });

  // Inicializar quando a pizza principal muda
  useEffect(() => {
    if (pizza) {
      setSabor1(pizza);
      setSabor2(null);
      setSabor3(null);
      setNumSabores(1);
      setBordaId("borda-sem");
      setQuantidade(1);
      setObsPizza("");
      setExtrasPorSabor({ 1: [], 2: [], 3: [] });
      setTamanho(pizza.preco_grande != null ? "grande" : "broto");
    }
  }, [pizza]);

  // Se trocar para Broto, obriga 1 sabor e desativa borda recheada
  useEffect(() => {
    if (tamanho === "broto") {
      setNumSabores(1);
      setSabor2(null);
      setSabor3(null);
      setBordaId("borda-sem");
    }
  }, [tamanho]);

  if (!isOpen || !pizza) return null;

  const activeSabor1 = sabor1 || pizza;

  // Filtragem de sabores por busca
  const saboresFiltrados = allPizzas.filter((p) => {
    const term = searchSabor.toLowerCase().trim();
    if (!term) return true;
    const text = `${p?.nome || ""} ${p?.ingredientes?.join(" ") || ""}`.toLowerCase();
    return text.includes(term);
  });

  const bordaSelecionada = DEFAULT_BORDAS.find((b) => b.id === bordaId) || DEFAULT_BORDAS[0];

  // Cálculo do Preço Base das Pizzas (Maior valor entre os sabores escolhidos)
  const precoBaseSabores = () => {
    const s1Preco = (tamanho === "broto" ? activeSabor1.preco_broto : activeSabor1.preco_grande) || 0;
    const s2Preco = numSabores >= 2 && sabor2 ? ((tamanho === "broto" ? sabor2.preco_broto : sabor2.preco_grande) || 0) : 0;
    const s3Preco = numSabores === 3 && sabor3 ? ((tamanho === "broto" ? sabor3.preco_broto : sabor3.preco_grande) || 0) : 0;

    return Math.max(s1Preco, s2Preco, s3Preco);
  };

  // Cálculo do total de extras selecionados em todos os sabores
  const totalExtrasValor = () => {
    let totalExtras = 0;
    [1, 2, 3].forEach((slot) => {
      if (slot <= numSabores) {
        const selectedIds = extrasPorSabor[slot] || [];
        selectedIds.forEach((extraId) => {
          const item = DEFAULT_EXTRAS.find((e) => e.id === extraId);
          if (item) totalExtras += item.preco;
        });
      }
    });
    return totalExtras;
  };

  const precoUnitarioFinal = precoBaseSabores() + (tamanho !== "broto" ? bordaSelecionada.preco : 0) + totalExtrasValor();
  const precoTotalFinal = precoUnitarioFinal * quantidade;

  const handleSelectFlavor = (p) => {
    if (activeSelectSlot === 2) {
      setSabor2(p);
    } else if (activeSelectSlot === 3) {
      setSabor3(p);
    }
    setSearchSabor("");
  };

  const toggleExtraForFlavor = (flavorSlot, extraId) => {
    setExtrasPorSabor((prev) => {
      const current = prev[flavorSlot] || [];
      const updated = current.includes(extraId)
        ? current.filter((id) => id !== extraId)
        : [...current, extraId];
      return { ...prev, [flavorSlot]: updated };
    });
  };

  const handleConfirmAddToCart = () => {
    if (!isOpenNow) {
      addToast("Pizzaria fechada no momento.", "error");
      return;
    }

    if (numSabores >= 2 && !sabor2) {
      addToast("Selecione o 2º sabor da sua pizza.", "warning");
      return;
    }
    if (numSabores === 3 && !sabor3) {
      addToast("Selecione o 3º sabor da sua pizza.", "warning");
      return;
    }

    const saboresNomes = [activeSabor1.nome];
    if (numSabores >= 2 && sabor2) saboresNomes.push(sabor2.nome);
    if (numSabores === 3 && sabor3) saboresNomes.push(sabor3.nome);

    // Mapeia extras escolhidos
    const listaExtrasDesc = [];
    [1, 2, 3].forEach((slot) => {
      if (slot <= numSabores) {
        const slotName = slot === 1 ? activeSabor1.nome : slot === 2 ? sabor2?.nome : sabor3?.nome;
        const extraIds = extrasPorSabor[slot] || [];
        extraIds.forEach((eId) => {
          const item = DEFAULT_EXTRAS.find((e) => e.id === eId);
          if (item && slotName) {
            listaExtrasDesc.push(`${item.nome} (em ${slotName})`);
          }
        });
      }
    });

    const itemCarrinho = {
      id: `custom-${activeSabor1.id}-${sabor2?.id || "none"}-${sabor3?.id || "none"}-${tamanho}-${Date.now()}`,
      idPizza: activeSabor1.id,
      nome: numSabores === 1 ? activeSabor1.nome : `Pizza ${numSabores} Sabores (${saboresNomes.join(" / ")})`,
      tamanho,
      quantidade,
      precoUnitario: precoUnitarioFinal,
      sabores: saboresNomes,
      borda: tamanho !== "broto" && bordaSelecionada.preco > 0 ? bordaSelecionada.nome : null,
      extras: listaExtrasDesc,
      obsPizza,
      imagem: activeSabor1.imagem || "/pizza-placeholder.jpg",
    };

    onAddToCart(itemCarrinho);
    addToast("Pedido adicionado ao carrinho com sucesso!", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">

        {/* CABCALHO VISUAL ANIMADO */}
        <div className="relative h-44 sm:h-52 bg-slate-950 flex items-center justify-center shrink-0 border-b border-slate-800 overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black text-lg transition-all"
            aria-label="Fechar"
          >
            ✕
          </button>

          {/* Preview da Pizza */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-amber-500 overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
            {numSabores === 1 && (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${sabor1?.imagem || "/pizza-placeholder.jpg"})` }}
              />
            )}
            {numSabores === 2 && (
              <>
                <div
                  className="absolute left-0 top-0 w-1/2 h-full bg-cover bg-center border-r border-amber-400/50"
                  style={{ backgroundImage: `url(${sabor1?.imagem || "/pizza-placeholder.jpg"})` }}
                />
                <div
                  className="absolute right-0 top-0 w-1/2 h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${sabor2?.imagem || sabor1?.imagem || "/pizza-placeholder.jpg"})` }}
                />
              </>
            )}
            {numSabores === 3 && (
              <div className="w-full h-full flex">
                <div
                  className="w-1/3 h-full bg-cover bg-center border-r border-amber-400/40"
                  style={{ backgroundImage: `url(${sabor1?.imagem || "/pizza-placeholder.jpg"})` }}
                />
                <div
                  className="w-1/3 h-full bg-cover bg-center border-r border-amber-400/40"
                  style={{ backgroundImage: `url(${sabor2?.imagem || sabor1?.imagem || "/pizza-placeholder.jpg"})` }}
                />
                <div
                  className="w-1/3 h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${sabor3?.imagem || sabor1?.imagem || "/pizza-placeholder.jpg"})` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* CORPO DO MODAL SCROLLÁVEL */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 pb-28">

          {/* Título & Ingredientes Base */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black">{activeSabor1.nome}</h2>
              {activeSabor1.badges?.includes("best") && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ⭐ Mais Pedido
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {activeSabor1.ingredientes?.join(", ")}
            </p>
          </div>

          {/* 1. SELEÇÃO DE TAMANHO */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. Escolha o Tamanho
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {pizza.preco_broto != null && (
                <button
                  type="button"
                  onClick={() => setTamanho("broto")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    tamanho === "broto"
                      ? "bg-amber-500/10 border-amber-500 text-amber-600 font-bold shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-semibold">Broto (4 fatias)</div>
                  <div className="text-sm font-black text-amber-500 mt-0.5">
                    {formatCurrencyBRL(pizza.preco_broto)}
                  </div>
                </button>
              )}

              {pizza.preco_grande != null && (
                <button
                  type="button"
                  onClick={() => setTamanho("grande")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    tamanho === "grande"
                      ? "bg-amber-500/10 border-amber-500 text-amber-600 font-bold shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-semibold">Grande (8 fatias)</div>
                  <div className="text-sm font-black text-amber-500 mt-0.5">
                    {formatCurrencyBRL(pizza.preco_grande)}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* 2. SELEÇÃO DE SABORES (1/1, 1/2, 1/3) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Divisão de Sabores
              </label>
              {tamanho === "broto" && (
                <span className="text-[11px] text-amber-600 font-medium">
                  Broto é servida em 1 único sabor
                </span>
              )}
            </div>

            {tamanho !== "broto" && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { num: 1, label: "1 Sabor (100%)" },
                  { num: 2, label: "2 Sabores (1/2)" },
                  { num: 3, label: "3 Sabores (1/3)" },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setNumSabores(s.num)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      numSabores === s.num
                        ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 border-slate-900 dark:border-amber-500 shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* SELETOR DE SABORES ADICIONAIS COM BUSCA EM TEMPO REAL */}
            {numSabores >= 2 && (
              <div className="space-y-4 pt-2">
                {/* 2º Sabor */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      2º Sabor (50%): <span className="text-amber-500">{sabor2?.nome || "Escolha um sabor"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSelectSlot(activeSelectSlot === 2 ? 0 : 2)}
                      className="text-xs text-amber-600 font-bold hover:underline"
                    >
                      {activeSelectSlot === 2 ? "Fechar busca" : "Trocar sabor 🔍"}
                    </button>
                  </div>

                  {activeSelectSlot === 2 && (
                    <div className="space-y-2 pt-2 animate-fade-in">
                      <input
                        type="text"
                        placeholder="Buscar sabor ou ingrediente..."
                        value={searchSabor}
                        onChange={(e) => setSearchSabor(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {saboresFiltrados.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectFlavor(p)}
                            className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between border transition-all ${
                              sabor2?.id === p.id
                                ? "bg-amber-500/20 border-amber-500 font-bold"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <span>{p.nome}</span>
                            <span className="text-slate-500 text-[11px]">
                              {formatCurrencyBRL(tamanho === "broto" ? p.preco_broto : p.preco_grande)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3º Sabor (se 3 sabores ativado) */}
                {numSabores === 3 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        3º Sabor (33%): <span className="text-amber-500">{sabor3?.nome || "Escolha um sabor"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSelectSlot(activeSelectSlot === 3 ? 0 : 3)}
                        className="text-xs text-amber-600 font-bold hover:underline"
                      >
                        {activeSelectSlot === 3 ? "Fechar busca" : "Trocar sabor 🔍"}
                      </button>
                    </div>

                    {activeSelectSlot === 3 && (
                      <div className="space-y-2 pt-2 animate-fade-in">
                        <input
                          type="text"
                          placeholder="Buscar 3º sabor..."
                          value={searchSabor}
                          onChange={(e) => setSearchSabor(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {saboresFiltrados.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectFlavor(p)}
                              className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between border transition-all ${
                                sabor3?.id === p.id
                                  ? "bg-amber-500/20 border-amber-500 font-bold"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                              }`}
                            >
                              <span>{p.nome}</span>
                              <span className="text-slate-500 text-[11px]">
                                {formatCurrencyBRL(tamanho === "broto" ? p.preco_broto : p.preco_grande)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. BORDA RECHEADA (Desativada para Broto) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                3. Borda Recheada
              </label>
              {tamanho === "broto" && (
                <span className="text-[11px] text-amber-600">
                  Não disponível para Pizza Broto
                </span>
              )}
            </div>

            {tamanho !== "broto" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_BORDAS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBordaId(b.id)}
                    className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${
                      bordaId === b.id
                        ? "bg-amber-500/10 border-amber-500 font-bold text-amber-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span>{b.nome}</span>
                    <span className="font-bold">
                      {b.preco === 0 ? "Sem custo" : `+ ${formatCurrencyBRL(b.preco)}`}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-500 italic">
                Pizzas Broto são assadas sem borda recheada. Para borda recheada, escolha o tamanho Grande.
              </div>
            )}
          </div>

          {/* 4. ADICIONAIS / EXTRAS POR SABOR */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              4. Adicionais Extra (Por Sabor)
            </label>

            {[1, 2, 3].map((slot) => {
              if (slot > numSabores) return null;
              const slotPizza = slot === 1 ? sabor1 : slot === 2 ? sabor2 : sabor3;
              if (!slotPizza) return null;

              const selectedExtras = extrasPorSabor[slot] || [];

              return (
                <div
                  key={slot}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                    <span>➕ Extras para:</span>
                    <span className="text-slate-900 dark:text-slate-100">{slotPizza.nome}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {DEFAULT_EXTRAS.map((extra) => {
                      const isChecked = selectedExtras.includes(extra.id);

                      return (
                        <label
                          key={extra.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? "bg-amber-500/20 border-amber-500 font-bold text-amber-700 dark:text-amber-300"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleExtraForFlavor(slot, extra.id)}
                              className="rounded text-amber-500 focus:ring-amber-500"
                            />
                            <span>{extra.nome}</span>
                          </div>
                          <span className="font-semibold text-slate-500">
                            + {formatCurrencyBRL(extra.preco)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* OBSERVACÃO */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Observações do Pedido
            </label>
            <textarea
              rows={2}
              placeholder="Ex: sem cebola na metade de calabresa, massa bem assada..."
              value={obsPizza}
              onChange={(e) => setObsPizza(e.target.value)}
              className="w-full p-3 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* BOTÃO FLUTUANTE / FIXO NO RODAPÉ DO MODAL (ALWAYS VISIBLE) */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-between gap-3 z-30">
          {/* Seletor de Quantidade */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm shadow-sm active:scale-95 transition-all"
            >
              -
            </button>
            <span className="w-6 text-center font-bold text-sm">{quantidade}</span>
            <button
              type="button"
              onClick={() => setQuantidade((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm shadow-sm active:scale-95 transition-all"
            >
              +
            </button>
          </div>

          {/* Botão Adicionar ao Carrinho */}
          <button
            type="button"
            onClick={handleConfirmAddToCart}
            disabled={!isOpenNow}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-between disabled:opacity-50"
          >
            <span>{isOpenNow ? "Adicionar ao Carrinho" : "Pizzaria Fechada"}</span>
            <span className="bg-slate-950/20 px-3 py-1 rounded-xl font-extrabold">
              {formatCurrencyBRL(precoTotalFinal)}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCustomizerModal;
