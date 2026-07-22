import React, { useState, useEffect } from "react";
import { formatCurrencyBRL } from "../../utils/menu";
import { useToast } from "./ToastProvider";

const DEFAULT_BORDAS = [
  { id: "borda-sem", nome: "Sem borda", preco: 0 },
  { id: "borda-catupiry", nome: "Borda Catupiry® Original", preco: 18 },
  { id: "borda-cheddar", nome: "Borda Cheddar Cremoso", preco: 18 },
  { id: "borda-dois-queijos", nome: "Borda Dois Queijos", preco: 20 },
  { id: "borda-frango-catupiry", nome: "Borda Frango c/ Catupiry", preco: 22 },
  { id: "borda-paozinho", nome: "Borda Pãozinho Dois Queijos", preco: 26 },
  { id: "borda-doce", nome: "Borda Doce de Leite", preco: 20 },
];

const DEFAULT_EXTRAS = [
  { id: "extra-bacon", nome: "Bacon crocante extra", preco: 6 },
  { id: "extra-catupiry", nome: "Catupiry® extra", preco: 8 },
  { id: "extra-cheddar", nome: "Cheddar cremoso extra", preco: 8 },
  { id: "extra-mussarela", nome: "Queijo Mussarela extra", preco: 7 },
  { id: "extra-alho", nome: "Alho frito extra", preco: 4 },
  { id: "extra-milho", nome: "Milho verde extra", preco: 4 },
  { id: "extra-palmito", nome: "Palmito extra", preco: 8 },
  { id: "extra-cebola", nome: "Cebola extra", preco: 3 },
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
  const [numSabores, setNumSabores] = useState(1);
  const [sabor1, setSabor1] = useState(null);
  const [sabor2, setSabor2] = useState(null);
  const [sabor3, setSabor3] = useState(null);

  // Modal interno de busca rápida de sabor
  const [selectingSlot, setSelectingSlot] = useState(null); // null, 2 ou 3
  const [searchQuery, setSearchQuery] = useState("");

  const [bordaId, setBordaId] = useState("borda-sem");
  const [quantidade, setQuantidade] = useState(1);
  const [obsPizza, setObsPizza] = useState("");
  const [extrasPorSabor, setExtrasPorSabor] = useState({ 1: [], 2: [], 3: [] });

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
  const bordaSelecionada = DEFAULT_BORDAS.find((b) => b.id === bordaId) || DEFAULT_BORDAS[0];

  const saboresFiltrados = allPizzas.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    const text = `${p?.nome || ""} ${p?.ingredientes?.join(" ") || ""}`.toLowerCase();
    return text.includes(term);
  });

  const precoBaseSabores = () => {
    const s1 = (tamanho === "broto" ? activeSabor1.preco_broto : activeSabor1.preco_grande) || 0;
    const s2 = numSabores >= 2 && sabor2 ? ((tamanho === "broto" ? sabor2.preco_broto : sabor2.preco_grande) || 0) : 0;
    const s3 = numSabores === 3 && sabor3 ? ((tamanho === "broto" ? sabor3.preco_broto : sabor3.preco_grande) || 0) : 0;
    return Math.max(s1, s2, s3);
  };

  const totalExtrasValor = () => {
    let total = 0;
    [1, 2, 3].forEach((slot) => {
      if (slot <= numSabores) {
        const extraIds = extrasPorSabor[slot] || [];
        extraIds.forEach((id) => {
          const item = DEFAULT_EXTRAS.find((e) => e.id === id);
          if (item) total += item.preco;
        });
      }
    });
    return total;
  };

  const precoUnitarioFinal = precoBaseSabores() + (tamanho !== "broto" ? bordaSelecionada.preco : 0) + totalExtrasValor();
  const precoTotalFinal = precoUnitarioFinal * quantidade;

  const handlePickFlavor = (selectedPizzaItem) => {
    if (selectingSlot === 2) setSabor2(selectedPizzaItem);
    if (selectingSlot === 3) setSabor3(selectedPizzaItem);
    setSelectingSlot(null);
    setSearchQuery("");
  };

  const toggleExtra = (slot, extraId) => {
    setExtrasPorSabor((prev) => {
      const list = prev[slot] || [];
      const nextList = list.includes(extraId) ? list.filter((id) => id !== extraId) : [...list, extraId];
      return { ...prev, [slot]: nextList };
    });
  };

  const handleAddToCart = () => {
    if (!isOpenNow) {
      addToast("Pizzaria fechada no momento.", "error");
      return;
    }
    if (numSabores >= 2 && !sabor2) {
      addToast("Escolha o 2º sabor da sua pizza.", "warning");
      return;
    }
    if (numSabores === 3 && !sabor3) {
      addToast("Escolha o 3º sabor da sua pizza.", "warning");
      return;
    }

    const saboresNomes = [activeSabor1.nome];
    if (numSabores >= 2 && sabor2) saboresNomes.push(sabor2.nome);
    if (numSabores === 3 && sabor3) saboresNomes.push(sabor3.nome);

    const listaExtrasDesc = [];
    [1, 2, 3].forEach((slot) => {
      if (slot <= numSabores) {
        const slotName = slot === 1 ? activeSabor1.nome : slot === 2 ? sabor2?.nome : sabor3?.nome;
        const extraIds = extrasPorSabor[slot] || [];
        extraIds.forEach((eId) => {
          const item = DEFAULT_EXTRAS.find((e) => e.id === eId);
          if (item && slotName) {
            listaExtrasDesc.push(`${item.nome} (${slotName})`);
          }
        });
      }
    });

    onAddToCart({
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
    });

    addToast("Adicionado ao carrinho com sucesso!", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
      <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">

        {/* HEADER MODAL CLEAN WHITE */}
        <div className="relative h-40 bg-amber-50 flex items-center justify-center shrink-0 border-b border-amber-100">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white text-slate-900 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all font-bold text-sm shadow-sm"
          >
            ✕
          </button>
          <div className="w-32 h-32 rounded-full border-4 border-amber-500 overflow-hidden shadow-xl relative bg-white">
            {numSabores === 1 && (
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${activeSabor1?.imagem || "/pizza-placeholder.jpg"})` }} />
            )}
            {numSabores === 2 && (
              <>
                <div className="absolute left-0 top-0 w-1/2 h-full bg-cover bg-center border-r border-amber-400/50" style={{ backgroundImage: `url(${activeSabor1?.imagem || "/pizza-placeholder.jpg"})` }} />
                <div className="absolute right-0 top-0 w-1/2 h-full bg-cover bg-center" style={{ backgroundImage: `url(${sabor2?.imagem || activeSabor1?.imagem || "/pizza-placeholder.jpg"})` }} />
              </>
            )}
            {numSabores === 3 && (
              <div className="w-full h-full flex">
                <div className="w-1/3 h-full bg-cover bg-center border-r border-amber-400/40" style={{ backgroundImage: `url(${activeSabor1?.imagem || "/pizza-placeholder.jpg"})` }} />
                <div className="w-1/3 h-full bg-cover bg-center border-r border-amber-400/40" style={{ backgroundImage: `url(${sabor2?.imagem || activeSabor1?.imagem || "/pizza-placeholder.jpg"})` }} />
                <div className="w-1/3 h-full bg-cover bg-center" style={{ backgroundImage: `url(${sabor3?.imagem || activeSabor1?.imagem || "/pizza-placeholder.jpg"})` }} />
              </div>
            )}
          </div>
        </div>

        {/* CONTEÚDO ENXUTO E COMPACTO - TEMA WHITE */}
        <div className="p-4 overflow-y-auto space-y-5 pb-28 text-xs">

          {/* Nome principal */}
          <div>
            <h2 className="text-lg font-black text-slate-900">{activeSabor1.nome}</h2>
            <p className="text-slate-500 mt-0.5">{activeSabor1.ingredientes?.join(", ")}</p>
          </div>

          {/* 1. TAMANHO */}
          <div className="space-y-1.5">
            <span className="font-extrabold uppercase text-slate-500 tracking-wider">1. Escolha o Tamanho</span>
            <div className="grid grid-cols-2 gap-2">
              {pizza.preco_broto != null && (
                <button
                  type="button"
                  onClick={() => setTamanho("broto")}
                  className={`p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                    tamanho === "broto" ? "bg-amber-500/15 border-amber-500 font-black text-amber-700" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <span>Broto (4 fatias)</span>
                  <span className="font-black">{formatCurrencyBRL(pizza.preco_broto)}</span>
                </button>
              )}
              {pizza.preco_grande != null && (
                <button
                  type="button"
                  onClick={() => setTamanho("grande")}
                  className={`p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                    tamanho === "grande" ? "bg-amber-500/15 border-amber-500 font-black text-amber-700" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <span>Grande (8 fatias)</span>
                  <span className="font-black">{formatCurrencyBRL(pizza.preco_grande)}</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. SABORES (SIMPLIFICADO) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-extrabold uppercase text-slate-500 tracking-wider">2. Sabores</span>
              {tamanho === "broto" && <span className="text-[10px] text-amber-700 font-bold">Broto apenas 1 sabor</span>}
            </div>

            {tamanho !== "broto" && (
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { num: 1, label: "1 Sabor" },
                  { num: 2, label: "2 Sabores (1/2)" },
                  { num: 3, label: "3 Sabores (1/3)" },
                ].map((s) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setNumSabores(s.num)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      numSabores === s.num
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow"
                        : "bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* BOTÕES DE SLOT DE SABORES SIMPLIFICADOS */}
            {numSabores >= 2 && (
              <div className="space-y-2 pt-1">
                {/* 1º Sabor (Fixo) */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-slate-900">
                  <span className="font-bold">1º Sabor (50%): {activeSabor1.nome}</span>
                  <span className="text-[10px] text-slate-400">Principal</span>
                </div>

                {/* 2º Sabor (Gatilho para Modal de Busca) */}
                <button
                  type="button"
                  onClick={() => setSelectingSlot(2)}
                  className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                    sabor2 ? "bg-amber-50 border-amber-500 font-bold text-slate-900" : "bg-white border-dashed border-amber-500 text-amber-700"
                  }`}
                >
                  <span>2º Sabor: {sabor2 ? sabor2.nome : "Clique para escolher o 2º sabor 🔍"}</span>
                  <span className="font-extrabold text-amber-600">Trocar</span>
                </button>

                {/* 3º Sabor (se 3 sabores) */}
                {numSabores === 3 && (
                  <button
                    type="button"
                    onClick={() => setSelectingSlot(3)}
                    className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                      sabor3 ? "bg-amber-50 border-amber-500 font-bold text-slate-900" : "bg-white border-dashed border-amber-500 text-amber-700"
                    }`}
                  >
                    <span>3º Sabor: {sabor3 ? sabor3.nome : "Clique para escolher o 3º sabor 🔍"}</span>
                    <span className="font-extrabold text-amber-600">Trocar</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. BORDA RECHEADA */}
          <div className="space-y-1.5">
            <span className="font-extrabold uppercase text-slate-500 tracking-wider">3. Borda Recheada</span>
            {tamanho !== "broto" ? (
              <select
                value={bordaId}
                onChange={(e) => setBordaId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold"
              >
                {DEFAULT_BORDAS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nome} {b.preco === 0 ? "(Sem custo)" : `(+ ${formatCurrencyBRL(b.preco)})`}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-slate-500 italic text-[11px]">Borda recheada indisponível para Broto.</p>
            )}
          </div>

          {/* 4. ADICIONAIS EXTRAS POR SABOR */}
          <div className="space-y-2">
            <span className="font-extrabold uppercase text-slate-500 tracking-wider">4. Adicionais Extra</span>
            {[1, 2, 3].map((slot) => {
              if (slot > numSabores) return null;
              const slotPizza = slot === 1 ? activeSabor1 : slot === 2 ? sabor2 : sabor3;
              if (!slotPizza) return null;

              const activeExtras = extrasPorSabor[slot] || [];

              return (
                <div key={slot} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-amber-700 text-[11px]">➕ Extras em {slotPizza.nome}:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_EXTRAS.map((e) => {
                      const isSel = activeExtras.includes(e.id);
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => toggleExtra(slot, e.id)}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                            isSel ? "bg-amber-500 text-slate-950 font-bold border-amber-500" : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          {e.nome} (+{formatCurrencyBRL(e.preco)})
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* OBSERVAÇÃO */}
          <div>
            <textarea
              rows={2}
              placeholder="Observações do pedido (ex: sem cebola)..."
              value={obsPizza}
              onChange={(e) => setObsPizza(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs"
            />
          </div>
        </div>

        {/* MODAL INTERNO DE BUSCA DE SABORES (TEMA WHITE CLEAN) */}
        {selectingSlot !== null && (
          <div className="absolute inset-0 z-40 bg-white p-4 flex flex-col animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="font-black text-sm text-slate-900">Escolha o {selectingSlot}º Sabor</span>
              <button onClick={() => setSelectingSlot(null)} className="text-slate-700 font-bold text-lg hover:text-black">✕</button>
            </div>
            <input
              type="text"
              placeholder="Buscar sabor ou ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="my-3 p-3 rounded-xl bg-slate-50 text-slate-900 text-xs border border-slate-300 focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {saboresFiltrados.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePickFlavor(p)}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-amber-50 text-left text-xs flex justify-between items-center border border-slate-200 transition-all text-slate-900"
                >
                  <div>
                    <div className="font-bold text-slate-900">{p.nome}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{p.ingredientes?.join(", ")}</div>
                  </div>
                  <span className="font-bold text-amber-700">
                    {formatCurrencyBRL(tamanho === "broto" ? p.preco_broto : p.preco_grande)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BOTÃO FIXO NO RODAPÉ CLEAN */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 p-3 border-t border-slate-200 flex items-center justify-between gap-3 z-30">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))} className="w-7 h-7 rounded-lg bg-white font-bold text-xs shadow border border-slate-200 text-slate-900">-</button>
            <span className="w-5 text-center font-bold text-xs text-slate-900">{quantidade}</span>
            <button type="button" onClick={() => setQuantidade((q) => q + 1)} className="w-7 h-7 rounded-lg bg-white font-bold text-xs shadow border border-slate-200 text-slate-900">+</button>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isOpenNow}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-between disabled:opacity-50"
          >
            <span>{isOpenNow ? "Adicionar ao Carrinho" : "Pizzaria Fechada"}</span>
            <span className="bg-slate-950/20 px-2 py-0.5 rounded font-extrabold">{formatCurrencyBRL(precoTotalFinal)}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCustomizerModal;
