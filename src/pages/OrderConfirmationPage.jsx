// src/pages/OrderConfirmationPage.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import server from "../api/server";
import { enviarParaDesktop } from "../hooks/useCheckout";
import { formatCurrencyBRL } from "../utils/menu";

// -----------------------------
// Helpers de status / ETA
// -----------------------------
const normalizeStatus = (status) => {
  if (!status) return "open";
  const s = status.toString().toLowerCase().trim();
  if (s === "finalizado" || s === "done") return "done";
  if (s === "cancelado" || s === "cancelled") return "cancelled";
  if (["em_preparo", "preparo", "preparing"].includes(s)) return "preparing";
  if (
    s === "out_for_delivery" ||
    s === "delivery" ||
    s === "em_entrega" ||
    s === "in_delivery"
  ) {
    return "out_for_delivery";
  }
  if (s === "open" || s === "em_aberto") return "open";
  return s;
};

const STATUS_STEPS = [
  { key: "open", label: "Pedido recebido" },
  { key: "preparing", label: "Em preparo" },
  { key: "out_for_delivery", label: "Saiu para entrega" },
  { key: "done", label: "Entregue" },
];

const getStepIndex = (statusKey) => {
  const normalized = normalizeStatus(statusKey);
  if (normalized === "done") return 3;
  if (normalized === "out_for_delivery") return 2;
  if (normalized === "preparing") return 1;
  if (normalized === "cancelled") return 2;
  return 0;
};

const statusLabelForCustomer = (statusKey) => {
  const s = normalizeStatus(statusKey);
  if (s === "open") return "Pedido recebido";
  if (s === "preparing") return "Em preparação";
  if (s === "out_for_delivery") return "Saiu para entrega";
  if (s === "done") return "Entregue";
  if (s === "cancelled") return "Pedido cancelado";
  return s;
};

const etaTextForStatus = (statusKey, bairro) => {
  const s = normalizeStatus(statusKey);
  if (s === "open" || s === "preparing") {
    return bairro
      ? `35 a 55 minutos na região de ${bairro}`
      : "35 a 55 minutos";
  }
  if (s === "out_for_delivery") {
    return "Seu pedido saiu para entrega e deve chegar em poucos minutos.";
  }
  if (s === "done") {
    return "Pedido finalizado. Qualquer coisa, chama a gente no WhatsApp. ❤️";
  }
  if (s === "cancelled") {
    return "Pedido cancelado. Se for um engano, fale com a gente pelo WhatsApp.";
  }
  return null;
};

const PENDING_CARD_ORDER_KEY = "pending_card_order";

const normalizePaymentStatus = (value) => {
  if (!value) return "";
  return String(value).toLowerCase().trim();
};

const isPaymentApproved = (value) => {
  const status = normalizePaymentStatus(value);
  return [
    "paid",
    "approved",
    "success",
    "succeeded",
    "captured",
    "true",
    "1",
  ].includes(status);
};

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [resumo, setResumo] = useState(null);

  // 🔑 ID usado para bater no endpoint /motoboy/pedido/:id
  const [trackingId, setTrackingId] = useState(null);

  // dados em tempo real retornados pela API
  const [trackingData, setTrackingData] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState("open");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentConfirmError, setPaymentConfirmError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState({
    status: "",
    transactionId: "",
    raw: {},
  });

  // -------------------------------------------------------------------
  // 1) Resolver resumo + trackingId (URL + state + localStorage)
  // -------------------------------------------------------------------
  useEffect(() => {
    let summary = null;

    // a) state vindo do navigate()
    if (location.state && location.state.orderSummary) {
      summary = location.state.orderSummary;
    } else {
      // b) fallback – último resumo salvo
      try {
        const salvo = localStorage.getItem("lastOrderSummary");
        if (salvo) summary = JSON.parse(salvo);
      } catch {
        // ignora
      }
    }

    if (summary) {
      setResumo(summary);
      // regrava pra manter sincronizado
      try {
        localStorage.setItem("lastOrderSummary", JSON.stringify(summary));
      } catch {
        // ignora
      }
    }

    // c) ID bruto vindo pela URL (?orderId=orders-...)
    let fromUrl = null;
    try {
      const searchParams = new URLSearchParams(window.location.search || "");
      fromUrl =
        searchParams.get("orderId") || searchParams.get("tracking") || null;
    } catch {
      fromUrl = null;
    }

    // d) ID vindo pelo state
    const fromStateTracking =
      location.state?.trackingId ||
      location.state?.backendOrderId ||
      location.state?.orderIdApi ||
      null;

    // e) ID vindo de dentro do resumo
    const fromSummary =
      summary?.backendOrderId ||
      summary?.trackingId ||
      summary?.orderIdApi ||
      summary?.order?.id ||
      null;

    const resolved = fromUrl || fromStateTracking || fromSummary || null;

    setTrackingId(resolved);
    setDeliveryConfirmed(
      resolved
        ? window.localStorage?.getItem(`order-delivery-confirmed-${resolved}`) ===
            "true"
        : false
    );

    console.log("[OrderConfirmation] trackingId resolvido:", {
      fromUrl,
      fromStateTracking,
      fromSummary,
      resolved,
    });
  }, [location.state]);

  // -------------------------------------------------------------------
  // 1.5) Status de pagamento vindo do retorno do gateway
  // -------------------------------------------------------------------
  useEffect(() => {
    let statusFromUrl = "";
    let transactionIdFromUrl = "";
    let rawParams = {};
    try {
      const searchParams = new URLSearchParams(window.location.search || "");
      rawParams = Object.fromEntries(searchParams.entries());
      statusFromUrl =
        searchParams.get("paymentStatus") ||
        searchParams.get("payment_status") ||
        searchParams.get("status") ||
        searchParams.get("transaction_status") ||
        searchParams.get("result") ||
        searchParams.get("success") ||
        "";
      transactionIdFromUrl =
        searchParams.get("transaction_id") ||
        searchParams.get("payment_id") ||
        searchParams.get("id") ||
        searchParams.get("reference") ||
        "";
    } catch {
      statusFromUrl = "";
      transactionIdFromUrl = "";
      rawParams = {};
    }
    setPaymentStatus(statusFromUrl || "");
    setPaymentInfo({
      status: statusFromUrl || "",
      transactionId: transactionIdFromUrl || "",
      raw: rawParams,
    });
  }, [location.search]);

  // -------------------------------------------------------------------
  // Derivados para mostrar na tela
  // -------------------------------------------------------------------
  const semResumo = !resumo || !resumo.items || !resumo.items.length;
  const paymentMethod = String(
    resumo?.pagamento || resumo?.dados?.pagamento || ""
  ).toLowerCase();
  const showCardReceiptButton = paymentMethod === "cartao";

  const totalItens = semResumo
    ? 0
    : resumo.items.reduce(
        (acc, item) => acc + Number(item.quantidade || 0),
        0
      );
  const pixInfo =
    resumo?.pixPayment || resumo?.dados?.pixPayment || null;
  const pixCode = pixInfo?.copiaColar || pixInfo?.qrcode || "";
  const pixExpiresAt = pixInfo?.expiresAt || "";

  // Número amigável exibido (#92336)
  const codigoPedido =
    resumo?.numeroPedidoDisplay ||
    resumo?.orderCode ||
    resumo?.codigoPedido ||
    resumo?.idPedido ||
    resumo?.numeroPedido ||
    (trackingData?.id
      ? String(trackingData.id).split("-")[
          String(trackingData.id).split("-").length - 1
        ]
      : null) ||
    (trackingId
      ? String(trackingId).split("-")[
          String(trackingId).split("-").length - 1
        ]
      : null);

  const bairroResumo =
    resumo?.dados?.bairro ||
    trackingData?.customerSnapshot?.address?.neighborhood ||
    null;

  const effectiveStatus = trackingId ? trackingStatus : "preparing";
  const stepIndex = getStepIndex(effectiveStatus);
  const statusLabel = statusLabelForCustomer(effectiveStatus);
  const etaText = etaTextForStatus(effectiveStatus, bairroResumo);

  const formatPixExpiresAt = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  };

  const pixCopyLabel = pixCopied ? "Codigo copiado" : "Copiar codigo";
  const pixExpiresLabel = pixExpiresAt ? formatPixExpiresAt(pixExpiresAt) : "";

  const motoboySnapshot =
    trackingData?.motoboySnapshot ||
    trackingData?.delivery?.motoboySnapshot ||
    null;

  const motoboy = motoboySnapshot
    ? {
        name: motoboySnapshot.name,
        phone: motoboySnapshot.phone,
      }
    : trackingData?.motoboyName
    ? {
        name: trackingData.motoboyName,
        phone: trackingData.motoboyPhone || null,
      }
    : null;

  const handleCopyPix = async () => {
    if (!pixCode || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setPixCopied(true);
      window.setTimeout(() => setPixCopied(false), 2000);
    } catch (_err) {
      setPixCopied(false);
    }
  };

  const saveCustomerIfNeeded = useCallback(async (dadosCliente) => {
    if (!dadosCliente?.telefone || !dadosCliente?.nome) return null;
    const phoneDigits = (dadosCliente.telefone || "").replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 10) return null;

    const payload = {
      source: "website",
      name: dadosCliente.nome,
      phone: phoneDigits,
      address: {
        cep: dadosCliente.cep || "",
        street: dadosCliente.endereco || "",
        neighborhood: dadosCliente.bairro || "",
      },
    };

    try {
      const res = await server.salvarCliente(JSON.stringify(payload));
      if (!res.ok) return null;
      const customer = await res.json();
      return customer || null;
    } catch (err) {
      console.error("[OrderConfirmation] erro ao salvar cliente:", err);
      return null;
    }
  }, []);

  const resolveOrderFromResponse = useCallback((data) => {
    if (!data) return null;
    if (Array.isArray(data.items) && data.items.length > 0) {
      return data.items[0];
    }
    if (data.order) return data.order;
    return data;
  }, []);

  // -------------------------------------------------------------------
  // 1.6) Confirmar pedido após retorno do pagamento (cartão)
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!isPaymentApproved(paymentStatus)) return;
    if (confirmingPayment) return;

    let pending = null;
    try {
      const raw = localStorage.getItem(PENDING_CARD_ORDER_KEY);
      pending = raw ? JSON.parse(raw) : null;
    } catch {
      pending = null;
    }

    if (!pending || pending.sentAt) return;

    let cancelled = false;

    const confirmPendingOrder = async () => {
      setConfirmingPayment(true);
      setPaymentConfirmError("");

      try {
        let customerIdAtual = pending.dados?.customerId || null;
        if (!customerIdAtual) {
          const savedCustomer = await saveCustomerIfNeeded(pending.dados);
          customerIdAtual = savedCustomer?.id || null;
        }

        const payloadCliente = {
          ...pending.dados,
          customerId: customerIdAtual,
          subtotal: pending.subtotal,
          taxaEntrega: pending.taxaEntrega,
          desconto: pending.desconto,
        };

        const desktopResult = await enviarParaDesktop(
          pending.items,
          payloadCliente,
          pending.totalFinal,
          pending.pagamento
        );

        if (!desktopResult?.ok || !desktopResult.data) {
          throw new Error("Falha ao confirmar o pedido no backend.");
        }

        const data = desktopResult.data;
        const order = resolveOrderFromResponse(data);
        const backendOrderId =
          order?.id ||
          data.orderId ||
          data.id ||
          (Array.isArray(data.items) ? data.items[0]?.id : null) ||
          null;

        const numeroPedidoHuman =
          order?.numeroPedido ||
          order?.codigoPedido ||
          (backendOrderId
            ? String(backendOrderId).split("-").slice(-1)[0]
            : null);

        const orderSummary = {
          items: pending.items,
          subtotal: pending.subtotal,
          taxaEntrega: pending.taxaEntrega,
          desconto: pending.desconto,
          totalFinal: pending.totalFinal,
          pagamento: pending.pagamento || "cartao",
          pixPayment: pending.pixPayment || null,
          paymentStatus: normalizePaymentStatus(paymentStatus || ""),
          paymentTransactionId: paymentInfo?.transactionId || "",
          paymentRaw: paymentInfo?.raw || {},
          dados: payloadCliente,
          numeroPedido: numeroPedidoHuman,
          codigoPedido: numeroPedidoHuman,
          backendOrderId,
          trackingId: backendOrderId,
        };

        try {
          localStorage.setItem(
            "lastOrderSummary",
            JSON.stringify(orderSummary)
          );
        } catch {
          // ignore
        }

        if (!cancelled) {
          setResumo(orderSummary);
          setTrackingId(backendOrderId);
        }

        try {
          localStorage.setItem(
            PENDING_CARD_ORDER_KEY,
            JSON.stringify({
              ...pending,
              sentAt: Date.now(),
              backendOrderId,
            })
          );
        } catch {
          // ignore
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[OrderConfirmation] erro ao confirmar pagamento:", err);
          setPaymentConfirmError(
            "Nao foi possivel confirmar o pedido apos o pagamento."
          );
        }
      } finally {
        if (!cancelled) setConfirmingPayment(false);
      }
    };

    confirmPendingOrder();
    return () => {
      cancelled = true;
    };
  }, [
    paymentStatus,
    paymentInfo,
    confirmingPayment,
    saveCustomerIfNeeded,
    resolveOrderFromResponse,
  ]);

  // -------------------------------------------------------------------
  // 2) Polling em tempo real – agora lendo data.items[0] ou data.order
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!trackingId) {
      return;
    }

    let cancelled = false;
    let intervalId = null;

    const fetchStatus = async () => {
      try {
        setTrackingLoading(true);
        setTrackingError(null);

        const resp = await server.fetchStatus(encodeURIComponent(trackingId))

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }

        const contentType = resp.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const txt = await resp.text();
          console.error(
            "[OrderConfirmation] Resposta não JSON no tracking (provável HTML do Ngrok):",
            txt.slice(0, 400)
          );
          throw new Error("Resposta não JSON da API de tracking.");
        }

        const data = await resp.json();
        if (cancelled) return;

        console.log("[OrderConfirmation] resposta do tracking:", data);

        // Ajuste pro formato real:
        // - se vier { items: [ {...} ] }, pega o primeiro
        // - se vier { order: {...} }, usa order
        let order = null;
        if (Array.isArray(data.items) && data.items.length > 0) {
          order = data.items[0];
        } else if (data.order) {
          order = data.order;
        } else {
          order = null;
        }

        // se ainda assim não tiver nada, não quebra a tela
        if (!order) {
          console.warn(
            "[OrderConfirmation] Nenhum pedido encontrado no retorno do tracking."
          );
          return;
        }

        const rawStatus =
          // status principal do pedido
          order.status ||
          order.orderStatus ||
          // status do motoboy (delivering/out_for_delivery)
          order.motoboyStatus ||
          data.status ||
          data.orderStatus ||
          "open";

        setTrackingData(order);
        if (!deliveryConfirmed) {
          setTrackingStatus(normalizeStatus(rawStatus || "open"));
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[OrderConfirmation] erro ao buscar status:", err);
        setTrackingError("Não foi possível atualizar o status em tempo real.");
      } finally {
        if (!cancelled) {
          setTrackingLoading(false);
        }
      }
    };

    fetchStatus();
    intervalId = window.setInterval(fetchStatus, 10000);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [trackingId, deliveryConfirmed]);

  // -------------------------------------------------------------------
  // 2.5) Auto-redirecionamento para o WhatsApp do Pedido
  // -------------------------------------------------------------------
  useEffect(() => {
    const orderData = trackingData || resumo;
    if (!orderData || !trackingId) return;

    const redirectedKey = `wa-redirected-${trackingId}`;
    const alreadyRedirected = sessionStorage.getItem(redirectedKey);
    if (alreadyRedirected) return;

    // Define que já redirecionou para evitar loops
    sessionStorage.setItem(redirectedKey, "true");

    const formatWhatsAppMessage = (order) => {
      const customer = order.customer || order.dados || {};
      const clientName = customer.nome || customer.name || "";
      const clientPhone = customer.phone || customer.telefone || "";
      
      const address = order.address || customer.address || {};
      const street = address.street || address.endereco || "";
      const number = address.number || address.numero || "";
      const complement = address.complement || address.complemento || "";
      const neighborhood = address.neighborhood || address.bairro || "";
      const cep = address.cep || "";
      
      const items = Array.isArray(order.items) ? order.items : [];
      
      let msg = `*🍕 NOVO PEDIDO - ANNE & TOM PIZZARIA*\n\n`;
      msg += `*Código do Pedido:* \`${codigoPedido || trackingId}\`\n`;
      msg += `*Cliente:* ${clientName}\n`;
      msg += `*Telefone:* ${clientPhone}\n\n`;
      
      msg += `*📍 Endereço de Entrega:*\n`;
      if (street) {
        msg += `${street}, ${number}`;
        if (complement) msg += ` - ${complement}`;
        if (neighborhood) msg += `\nBairro: ${neighborhood}`;
        if (cep) msg += `\nCEP: ${cep}`;
        msg += `\n\n`;
      } else {
        msg += `Retirada no Balcão\n\n`;
      }
      
      msg += `*🛒 Itens do Pedido:*\n`;
      items.forEach((item, index) => {
        const nome = item.nome || item.name || "";
        const qty = item.quantidade || item.qty || 1;
        const tamanho = item.tamanho || item.size || "";
        const preco = item.precoUnitario || item.preco || item.price || 0;
        const obs = item.observacao || item.obs || "";
        
        msg += `${index + 1}. ${qty}x Pizza ${nome} (${tamanho}) - R$ ${(preco * qty).toFixed(2)}`;
        if (obs) {
          msg += `\n   _Obs: ${obs}_`;
        }
        msg += `\n`;
      });
      msg += `\n`;
      
      const subtotal = order.subtotal || order.total - (order.delivery_fee || 0);
      const deliveryFee = order.delivery_fee || order.deliveryFee || 0;
      const total = order.total || order.totalFinal || 0;
      const paymentMethod = order.payment?.method || order.pagamento || "";
      
      msg += `*💵 Resumo Financeiro:*\n`;
      msg += `Subtotal: R$ ${Number(subtotal).toFixed(2)}\n`;
      msg += `Taxa de Entrega: R$ ${Number(deliveryFee).toFixed(2)}\n`;
      msg += `*Total Final: R$ ${Number(total).toFixed(2)}*\n\n`;
      
      msg += `*💳 Forma de Pagamento:* ${String(paymentMethod).toUpperCase()}\n`;
      
      return encodeURIComponent(msg);
    };

    const msg = formatWhatsAppMessage(orderData);
    window.location.href = `https://wa.me/5511932507007?text=${msg}`;
  }, [trackingData, resumo, trackingId, codigoPedido]);

  // -------------------------------------------------------------------
  // UI (layout original, sem mudanças visuais drásticas)
  // -------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 flex flex-col">
      {/* HEADER */}
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logopizzaria.png"
              alt="Anne & Tom Pizzaria"
              className="w-10 h-10 object-contain"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Anne &amp; Tom Pizzaria</p>
              <p className="text-[11px] text-slate-500">
                Zona Norte • São Paulo
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => navigate("/cardapio")}
            className="text-[11px] border rounded-full px-4 py-1.5 bg-white hover:bg-slate-50"
          >
            Montar um novo pedido →
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 space-y-6">
            {/* ÍCONE / TÍTULO */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 text-emerald-700 flex items-center justify-center text-lg shadow-inner">
                ✓
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-semibold">
                  Pedido enviado com sucesso!
                </h1>
                <p className="text-xs text-slate-500">
                  Recebemos o seu pedido e ele já foi encaminhado para o sistema
                  interno da Anne &amp; Tom. Agora é com a cozinha. 🍕
                </p>
                {codigoPedido && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">
                      Número do pedido:&nbsp;
                    </span>
                    #{codigoPedido}
                  </p>
                )}
                {paymentStatus && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Status do pagamento: {normalizePaymentStatus(paymentStatus)}
                  </p>
                )}
                {paymentInfo?.transactionId && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Transacao: {paymentInfo.transactionId}
                  </p>
                )}
                {confirmingPayment && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Confirmando pagamento e finalizando o pedido...
                  </p>
                )}
                {paymentConfirmError && (
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    {paymentConfirmError}
                  </p>
                )}
                {trackingId ? (
                  <p className="text-[10px] text-emerald-700 mt-0.5">
                    Acompanhando seu pedido em tempo real.
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Acompanhamento em tempo real indisponivel. Mostrando status estimado.
                  </p>
                )}
              </div>
            </div>

            {/* STATUS / PRAZO + STEPPER */}
            <div className="bg-slate-50 rounded-2xl px-4 py-3 text-xs flex flex-col gap-2 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">
                  {trackingId ? "Status do pedido" : "Status inicial"}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                  {statusLabel}
                  {trackingLoading && (
                    <span className="ml-1 animate-pulse">•</span>
                  )}
                </span>
              </div>

              {etaText && (
                <p className="flex justify-between">
                  <span className="text-slate-500">Previsão de entrega</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {etaText}
                  </span>
                </p>
              )}

              {bairroResumo && (
                <p className="flex justify-between">
                  <span className="text-slate-500">Bairro</span>
                  <span className="font-semibold text-slate-800">
                    {bairroResumo}
                  </span>
                </p>
              )}

              {motoboy && (
                <p className="flex justify-between">
                  <span className="text-slate-500">Motoboy</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {motoboy.name}
                    {motoboy.phone && (
                      <span className="text-[10px] text-slate-500 ml-1">
                        ({motoboy.phone})
                      </span>
                    )}
                  </span>
                </p>
              )}

              {trackingError && (
                <p className="mt-1 text-[10px] text-amber-700">
                  {trackingError} Seu pedido continua válido; apenas o
                  acompanhamento automático pode ficar temporariamente
                  indisponível.
                </p>
              )}

              {/* Stepper visual */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  {STATUS_STEPS.map((step, index) => {
                    const active = index <= stepIndex;
                    const isCurrent = index === stepIndex;

                    return (
                      <div
                        key={step.key}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div className="flex items-center w-full">
                          <div className="flex-1 h-[2px]">
                            {index > 0 && (
                              <div
                                className={`h-[2px] ${
                                  index <= stepIndex
                                    ? "bg-emerald-500"
                                    : "bg-slate-200"
                                }`}
                              />
                            )}
                          </div>
                          <div
                            className={[
                              "w-6 h-6 rounded-full border flex items-center justify-center text-[10px]",
                              active
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-white border-slate-300 text-slate-400",
                              isCurrent ? "ring-2 ring-emerald-300" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 h-[2px]" />
                        </div>
                        <div className="mt-1 text-[9px] text-center leading-tight">
                          <p
                            className={
                              active
                                ? "font-semibold text-slate-800"
                                : "text-slate-400"
                            }
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {trackingId &&
                trackingStatus !== "done" &&
                trackingStatus !== "cancelled" &&
                !deliveryConfirmed && (
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!trackingId) return;
                        setConfirmError("");
                        setConfirmingDelivery(true);
                        const result = await server.confirmDelivery(trackingId);
                        setConfirmingDelivery(false);
                        if (!result?.ok) {
                          setConfirmError(
                            "Nao foi possivel confirmar a entrega agora."
                          );
                          return;
                        }
                        window.localStorage?.setItem(
                          `order-delivery-confirmed-${trackingId}`,
                          "true"
                        );
                        setDeliveryConfirmed(true);
                        setTrackingStatus("done");
                      }}
                      disabled={confirmingDelivery}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {confirmingDelivery ? "Confirmando..." : "Confirmar entrega"}
                    </button>
                    {confirmError && (
                      <p className="text-xs text-amber-700">{confirmError}</p>
                    )}
                  </div>
                )}
              {deliveryConfirmed && (
                <p className="mt-2 text-[11px] text-emerald-600">
                  Entrega confirmada. Obrigado por usar a Anne &amp; Tom!
                </p>
              )}
            </div>

            {/* RESUMO DO PEDIDO */}
            {!semResumo ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-slate-800">
                    Resumo do pedido
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {totalItens} item(s)
                  </p>
                </div>

                <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 text-xs">
                  {resumo.items.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="px-4 py-3 flex justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold">
                          {item.quantidade}x {item.nome}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.tamanho}
                          {Array.isArray(item.sabores) &&
                            item.sabores.length > 1 &&
                            ` · sabores: ${item.sabores.join(" / ")}`}
                          {!item.sabores &&
                            item.meio &&
                            ` · meio a meio com ${item.meio}`}
                          {item.obsPizza && ` · ${item.obsPizza}`}
                        </p>
                      </div>
                      <p className="text-slate-700 font-medium whitespace-nowrap">
                        {formatCurrencyBRL(
                          (item.precoUnitario || 0) * (item.quantidade || 0)
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* TOTAIS */}
                <div className="pt-1 space-y-1 text-xs">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrencyBRL(resumo.subtotal || 0)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Entrega</span>
                    <span className="font-medium">
                      {formatCurrencyBRL(resumo.taxaEntrega || 0)}
                    </span>
                  </p>
                  {Number(resumo.desconto || 0) > 0 && (
                    <p className="flex justify-between text-emerald-600">
                      <span>Desconto</span>
                      <span>
                        - {formatCurrencyBRL(resumo.desconto || 0)}
                      </span>
                    </p>
                  )}
                  <p className="flex justify-between pt-1 text-sm font-semibold">
                    <span>Total</span>
                    <span>
                      {formatCurrencyBRL(resumo.totalFinal || 0)}
                    </span>
                  </p>
                </div>

                {pixCode && (
                  <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs space-y-2">
                    <p className="font-semibold text-slate-800">
                      Pix copia e cola
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Use o codigo abaixo para pagar no seu banco.
                    </p>
                    <textarea
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px]"
                      value={pixCode}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="premium-button-ghost px-3 py-2 text-[11px]"
                      >
                        {pixCopyLabel}
                      </button>
                      {pixExpiresLabel && (
                        <span className="text-[11px] text-slate-500">
                          Valido ate: {pixExpiresLabel}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-[11px] font-semibold text-amber-800 mb-1">
                        ⚠️ IMPORTANTE: Liberação do Pedido
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Após pagar o Pix, envie o <strong>comprovante de pagamento</strong> para nosso WhatsApp:
                      </p>
                      <a
                        href="https://api.whatsapp.com/send?phone=5511932507007"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-3 py-1.5 bg-emerald-600 text-white text-[11px] rounded-lg font-medium hover:bg-emerald-700 transition"
                      >
                        Enviar Comprovante via WhatsApp
                      </a>
                      <p className="text-[10px] text-amber-600 mt-2">
                        Seu pedido só será liberado após o envio do comprovante.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">
                  Não encontramos o resumo do pedido.
                </p>
                <p>
                  Isso pode acontecer se você recarregou a página ou acessou
                  este link diretamente. Seu pedido provavelmente foi enviado,
                  mas o resumo não pôde ser reconstituído aqui.
                </p>
                <p>
                  Se tiver dúvida, fale com a Anne pelo WhatsApp ou volte ao
                  cardápio para montar um novo pedido.
                </p>
              </div>
            )}

            {/* DADOS DO CLIENTE */}
            {resumo && resumo.dados && (
              <div className="border-t border-slate-100 pt-4 text-[11px] space-y-1">
                <p className="text-slate-500 font-semibold text-xs">
                  Dados do cliente
                </p>
                {resumo.dados.nome && (
                  <p>
                    <span className="text-slate-500">Nome: </span>
                    <span className="font-medium">{resumo.dados.nome}</span>
                  </p>
                )}
                {resumo.dados.telefone && (
                  <p>
                    <span className="text-slate-500">WhatsApp: </span>
                    <span className="font-medium">
                      {resumo.dados.telefone}
                    </span>
                  </p>
                )}
                {(resumo.dados.endereco ||
                  resumo.dados.numero ||
                  resumo.dados.complemento) && (
                  <p>
                    <span className="text-slate-500">Endereco: </span>
                    <span className="font-medium">
                      {[
                        resumo.dados.endereco,
                        resumo.dados.numero
                          ? `, ${resumo.dados.numero}`
                          : "",
                        resumo.dados.complemento
                          ? ` - ${resumo.dados.complemento}`
                          : "",
                      ]
                        .join("")
                        .trim()}
                    </span>
                  </p>
                )}
                {resumo.dados.obsGerais && (
                  <p>
                    <span className="text-slate-500">Observações: </span>
                    <span className="font-medium">
                      {resumo.dados.obsGerais}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* AÇÕES FINAIS */}
            {showCardReceiptButton && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs space-y-2">
                <p className="font-semibold text-amber-800">
                  Pagou no cartao? Envie o comprovante.
                </p>
                <p className="text-[11px] text-amber-700">
                  Esse botao so aparece apos o pedido ser enviado.
                </p>
                <a
                  href={"https://wa.me/5511932507007?text=" + encodeURIComponent("Envio de comprovante Cartao - Pedido Anne & Tom")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700"
                >
                  Enviar comprovante via WhatsApp
                </a>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3 text-xs">
              <Link
                to="/cardapio"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50"
              >
                Voltar ao cardápio
              </Link>

              <button
                type="button"
                onClick={() =>
                  window.open("https://wa.me/5511932507007", "_blank")
                }
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:brightness-110"
              >
                Acompanhar pelo WhatsApp
              </button>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-center text-slate-500">
            Se precisar ajustar algo no pedido, envie uma mensagem pelo WhatsApp
            o quanto antes. A equipe da Anne &amp; Tom te ajuda rapidinho.
          </p>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmationPage;
