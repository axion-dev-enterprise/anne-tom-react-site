// src/pages/CheckoutPage.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCheckout } from "../hooks/useCheckout";

import CarrinhoStep from "../components/checkout/CarrinhoStep";
import DadosStep from "../components/checkout/DadosStep";
import RevisaoStep from "../components/checkout/RevisaoStep";
import PagamentoStep from "../components/checkout/PagamentoStep";
import ResumoLateral from "../components/checkout/ResumoLateral";
import ResumoMobile from "../components/checkout/ResumoMobile";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const PENDING_CARD_ORDER_KEY = "pending_card_order";

  const {
    // cart
    items,
    totalItens,

    // etapas
    passo,
    etapas,
    avancar,
    voltar,

    // dados
    dados,
    setDados,
    tipoCliente,
    setTipoCliente,

    // cliente API
    clienteExistente,
    checandoCliente,
    erroClienteApi,
    onBuscarClientePorTelefone,

    // CEP
    buscarCep,
    buscandoCep,
    erroCep,

    // cupom
    cupom,
    setCupom,
    aplicarCupom,

    // pagamento
    pagamento,
    setPagamento,
    pixPayment,
    pixLoading,
    pixError,
    cardPayment,
    cardLoading,
    cardError,
    createCardPayment,
    cardCheckoutUrl,

    // totais
    subtotal,
    taxaEntrega,
    desconto,
    totalFinal,
    podeEnviar,
    enviando,
    deliveryEta,
    deliveryEtaLoading,
    deliveryEtaError,
    distanceFee,
    deliveryFeeLabel,
    podeAvancarDados,

    // cart actions
    updateQuantity,
    removeItem,
    addItem,

    // envio
    enviarPedido,
  } = useCheckout();

  /**
   * Handler de envio:
   * espera que `enviarPedido()` retorne algo como:
   * {
   *   success: true,
   *   order,          // objeto vindo do apiServer (orders-...)
   *   orderSummary,   // resumo que a gente monta pro front
   * }
   */
  const handleEnviarPedido = async () => {
    if (!podeEnviar || enviando) return;

    try {
      if (pagamento === "cartao") {
        const resolveCardUrl = (payment) =>
          payment?.checkoutUrl ||
          payment?.metadata?.providerRaw?.url ||
          payment?.metadata?.url ||
          payment?.url ||
          "";

        let checkoutUrl = cardCheckoutUrl || resolveCardUrl(cardPayment);
        let cardSnapshot = cardPayment;

        if (!checkoutUrl) {
          const createdPayment = await createCardPayment();
          cardSnapshot = createdPayment || cardSnapshot;
          checkoutUrl = resolveCardUrl(createdPayment);
        }

        if (!checkoutUrl) {
          console.warn(
            "[CheckoutPage] Link de pagamento do cartão indisponível."
          );
          return;
        }

        const pendingPayload = {
          createdAt: Date.now(),
          items,
          dados,
          subtotal,
          taxaEntrega,
          desconto,
          totalFinal,
          pagamento,
          cardPayment: cardSnapshot,
        };

        try {
          localStorage.setItem(
            PENDING_CARD_ORDER_KEY,
            JSON.stringify(pendingPayload)
          );
        } catch (e) {
          console.warn("[CheckoutPage] Falha ao salvar pendingCardOrder:", e);
        }

        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const result = await enviarPedido();

      console.log("[CheckoutPage] resultado enviarPedido:", result);

      // se o hook não retornar nada ou der erro silencioso, não faz nada
      if (!result || result.success === false) {
        console.warn(
          "[CheckoutPage] enviarPedido não retornou resultado válido:",
          result
        );
        return;
      }

      const {
        order,
        orderSummary,
        orderId,
        idPedido,
        codigoPedido,
        numeroPedido,
        backendOrderId: backendOrderIdFromResult,
        trackingId: trackingIdFromResult,
        items: resultItems,
        orders: resultOrders,
      } = result;

      const firstOrderFromArray =
        Array.isArray(resultOrders) && resultOrders.length > 0 ? resultOrders[0] : null;
      const firstItemFromArray =
        Array.isArray(resultItems) && resultItems.length > 0 ? resultItems[0] : null;

      // tenta descobrir o id real do pedido criado no backend (o mesmo do PDV / motoboy)
      const backendOrderId =
        trackingIdFromResult ||
        backendOrderIdFromResult ||
        orderId ||
        idPedido ||
        codigoPedido ||
        numeroPedido ||
        order?.id ||
        order?.orderId ||
        firstOrderFromArray?.id ||
        firstOrderFromArray?.orderId ||
        firstItemFromArray?.id ||
        orderSummary?.backendOrderId ||
        orderSummary?.idPedidoApi ||
        null;

      console.log("[CheckoutPage] backendOrderId resolvido:", backendOrderId);

      if (!backendOrderId) {
        console.warn(
          "[CheckoutPage] Pedido criado, mas NÃO foi possível encontrar um ID para tracking.",
          { result }
        );
      }

      const summaryToSend = {
        ...(orderSummary || {}),
        backendOrderId,
        trackingId: backendOrderId,
        orderIdApi: backendOrderId,
      };

      try {
        localStorage.setItem("lastOrderSummary", JSON.stringify(summaryToSend));
      } catch (e) {
        console.warn("[CheckoutPage] Falha ao salvar lastOrderSummary:", e);
      }

      navigate(
        backendOrderId
          ? `/confirmacao?orderId=${encodeURIComponent(backendOrderId)}`
          : "/confirmacao",
        {
          state: {
            orderSummary: summaryToSend,
            trackingId: backendOrderId,
            backendOrderId,
          },
        }
      );
    } catch (err) {
      console.error("[CheckoutPage] erro ao enviar pedido:", err);
      // aqui você pode exibir algum toast/alert futuramente
    }
  };

  return (
    <div className="premium-page min-h-screen text-slate-900">
      {/* HEADER */}
      <header className="premium-panel border-b bg-white">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logopizzaria.png"
              alt="Anne & Tom Pizzaria"
              className="w-10 h-10 object-contain"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Checkout</p>
              <p className="text-[11px] text-slate-500">
                Revise e finalize seu pedido
              </p>
            </div>
          </Link>

          <Link
            to="/cardapio"
            className="premium-button-ghost text-xs px-4 py-1.5"
          >
            ← Voltar ao cardápio
          </Link>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* ETAPAS WIZARD PROGRESS */}
        <div className="relative flex justify-between items-center max-w-2xl mx-auto py-6 px-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-stone-800 z-0 rounded-full">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${(passo / (etapas.length - 1)) * 100}%` }}
            />
          </div>
          {etapas.map((etapa, i) => (
            <div key={etapa} className="relative z-10 flex flex-col items-center gap-1.5">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 transition-all duration-300 ${
                  i === passo
                    ? "bg-amber-500 text-stone-950 border-amber-500 scale-110 ring-4 ring-amber-500/20"
                    : i < passo
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-stone-900 text-stone-400 border-stone-800"
                }`}
              >
                {i < passo ? "✓" : i + 1}
              </div>
              <span 
                className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider ${
                  i === passo ? "text-amber-500" : "text-stone-400"
                }`}
              >
                {etapa}
              </span>
            </div>
          ))}
        </div>

        {/* PRINCIPAL + RESUMO */}
        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-6">
          <div className="premium-card bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            {passo === 0 && (
              <CarrinhoStep
                items={items}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            )}

            {passo === 1 && (
              <DadosStep
                dados={dados}
                setDados={setDados}
                cupom={cupom}
                setCupom={setCupom}
                aplicarCupom={aplicarCupom}
                buscarCep={buscarCep}
                buscandoCep={buscandoCep}
                erroCep={erroCep}
                checandoCliente={checandoCliente}
                clienteExistente={clienteExistente}
                erroClienteApi={erroClienteApi}
                onBuscarClientePorTelefone={onBuscarClientePorTelefone}
                tipoCliente={tipoCliente}
                setTipoCliente={setTipoCliente}
                deliveryEta={deliveryEta}
                deliveryEtaLoading={deliveryEtaLoading}
                deliveryEtaError={deliveryEtaError}
                distanceFee={distanceFee}
                deliveryFeeLabel={deliveryFeeLabel}
                desconto={desconto}
              />
            )}

            {passo === 2 && (
              <RevisaoStep
                dados={dados}
                subtotal={subtotal}
                taxaEntrega={taxaEntrega}
                desconto={desconto}
                totalFinal={totalFinal}
              />
            )}

            {passo === 3 && (
              <PagamentoStep
                subtotal={subtotal}
                taxaEntrega={taxaEntrega}
                desconto={desconto}
                totalFinal={totalFinal}
                pagamento={pagamento}
                setPagamento={setPagamento}
                pixPayment={pixPayment}
                pixLoading={pixLoading}
                pixError={pixError}
                cardPayment={cardPayment}
                cardLoading={cardLoading}
                cardError={cardError}
              />
            )}

            {/* BOTÕES NAVEGAÇÃO */}
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <button
                onClick={voltar}
                disabled={passo === 0}
                className={`premium-button-ghost px-5 py-2 text-xs ${
                  passo === 0 ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                ← Voltar
              </button>

              {passo < 2 && (
                <button
                  onClick={avancar}
                  disabled={
                    (passo === 0 && totalItens === 0) ||
                    (passo === 1 && !podeAvancarDados)
                  }
                  className={`premium-button px-6 py-2 text-xs font-semibold ${
                    (passo === 0 && totalItens === 0) ||
                    (passo === 1 && !podeAvancarDados)
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Avançar →
                  {passo === 0 && totalItens > 0 && (
                    <span className="ml-1 text-[10px] opacity-80">
                      ({totalItens} item{totalItens > 1 ? "s" : ""})
                    </span>
                  )}
                </button>
              )}

              {passo === 2 && (
                <button
                  onClick={avancar}
                  className="premium-button px-6 py-2 text-xs font-semibold"
                >
                  Confirmar e ir para pagamento →
                </button>
              )}

              {passo === 3 && (
                <div className="flex flex-col items-end gap-2">
                  {pagamento === "cartao" && (
                    <p className="text-[11px] text-slate-500 text-right">
                      Ao clicar em Finalizar pedido, abriremos o link de pagamento
                      em uma nova aba.
                    </p>
                  )}
                  <button
                    onClick={handleEnviarPedido}
                    disabled={!podeEnviar}
                    className={`premium-button premium-button--success px-7 py-3 text-xs font-semibold ${
                      podeEnviar ? "" : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {enviando ? "Finalizando..." : "Finalizar pedido"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RESUMO LATERAL */}
          <aside className="hidden lg:block">
            <ResumoLateral
              items={items}
              subtotal={subtotal}
              taxaEntrega={taxaEntrega}
              desconto={desconto}
              totalFinal={totalFinal}
              addItem={addItem}
            />
          </aside>
        </div>
      </main>

      {/* RESUMO MOBILE */}
      <ResumoMobile items={items} totalFinal={totalFinal} />
    </div>
  );
};

export default CheckoutPage;
