// src/components/checkout/PagamentoStep.jsx
import React, { useEffect, useState } from "react";

const PixIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="4"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M9 12L11 10L13 12L11 14L9 12Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 8L15 10L13 12L15 14L13 16"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CardIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M3 10H21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <rect
      x="7"
      y="13"
      width="4"
      height="2"
      rx="0.6"
      fill="currentColor"
    />
  </svg>
);

const MoneyIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M7 9.5C7.5 9 8.3 8.5 9 8.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M17 14.5C16.5 15 15.7 15.5 15 15.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const PagamentoStep = ({
  subtotal,
  taxaEntrega,
  desconto,
  totalFinal,
  pagamento,
  setPagamento,
  pixPayment,
  pixLoading,
  pixError,
  cardPayment,
  cardLoading,
  cardError,
}) => {
  const [pixCopied, setPixCopied] = useState(false);
  const isRedirectPayment = pagamento === "pix" || pagamento === "cartao";

  const pixCode = pixPayment?.copiaColar || pixPayment?.qrcode || "";
  const pixExpiresAt = pixPayment?.expiresAt || "";
  const pixReady = Boolean(pixCode);
  const [pixCountdown, setPixCountdown] = useState("");

  const formatPixExpiresAt = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  };

  const pixCopyLabel = pixCopied ? "Codigo copiado" : "Copiar codigo";

  const pixExpiresLabel = pixExpiresAt ? formatPixExpiresAt(pixExpiresAt) : "";

  useEffect(() => {
    if (!pixExpiresAt) {
      setPixCountdown("");
      return undefined;
    }
    const expiresAtMs = new Date(pixExpiresAt).getTime();
    if (Number.isNaN(expiresAtMs)) {
      setPixCountdown("");
      return undefined;
    }
    const updateCountdown = () => {
      const remainingMs = expiresAtMs - Date.now();
      if (remainingMs <= 0) {
        setPixCountdown("Expirado");
        return;
      }
      const totalSeconds = Math.ceil(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setPixCountdown(
        `Expira em ${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [pixExpiresAt]);

  useEffect(() => {
    if (pagamento === "pix" && pixReady && pixCode && navigator?.clipboard) {
      navigator.clipboard
        .writeText(pixCode)
        .then(() => {
          setPixCopied(true);
          window.setTimeout(() => setPixCopied(false), 2000);
          console.log("[PagamentoStep][pix] Codigo Pix copiado.");
        })
        .catch(() => {
          setPixCopied(false);
        });
    }
  }, [pagamento, pixReady, pixCode]);

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">Pagamento e finalizacao</h2>

      <div className="flex justify-center">
        <span className="premium-info-badge text-[11px]">
          {isRedirectPayment
            ? "Voce sera redirecionado automaticamente para o pagamento seguro."
            : "Pagamento na entrega: finalize o pedido e pague ao receber."}
        </span>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 text-xs">
        <button
          type="button"
          onClick={() => setPagamento("pix")}
          className={`premium-pill w-full flex items-center gap-2 text-xs justify-center ${
            pagamento === "pix" ? "premium-pill--accent" : ""
          }`}
        >
          <PixIcon className="h-4 w-4" />
          <span>Pix (recomendado)</span>
        </button>

        <button
          type="button"
          onClick={() => setPagamento("cartao")}
          className={`premium-pill w-full flex items-center gap-2 text-xs justify-center ${
            pagamento === "cartao" ? "premium-pill--accent" : ""
          }`}
        >
          <CardIcon className="h-4 w-4" />
          <span>Cartao (Pagar agora)</span>
        </button>

        <button
          type="button"
          onClick={() => setPagamento("cartao_entrega")}
          className={`premium-pill w-full flex items-center gap-2 text-xs justify-center ${
            pagamento === "cartao_entrega" ? "premium-pill--accent" : ""
          }`}
        >
          <CardIcon className="h-4 w-4" />
          <span>Cartao na entrega</span>
        </button>

        <button
          type="button"
          onClick={() => setPagamento("dinheiro")}
          className={`premium-pill w-full flex items-center gap-2 text-xs justify-center ${
            pagamento === "dinheiro" ? "premium-pill--accent" : ""
          }`}
        >
          <MoneyIcon className="h-4 w-4" />
          <span>Dinheiro</span>
        </button>
      </div>

      {pagamento === "pix" && (
        <div className="premium-card pix-box bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Pix instantaneo
              </p>
              <p className="text-sm text-slate-500">
                O codigo e gerado automaticamente ao chegar nesta etapa.
              </p>
            </div>
          </div>
          {pixError && (
            <p className="text-[11px] text-amber-700">{pixError}</p>
          )}
          {pixReady && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-slate-500">
                  Codigo copia e cola
                </label>
                <textarea
                  readOnly
                  className="premium-field pix-box__field w-full text-[12px] min-h-[90px]"
                  value={pixCode}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="premium-button-ghost px-3 py-2 text-[12px] cursor-default select-none">
                    {pixCopyLabel}
                  </span>
                  {pixExpiresLabel && (
                    <span className="text-[12px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Valido ate: {pixExpiresLabel}</span>
                      {pixCountdown && (
                        <span className="pix-countdown">{pixCountdown}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Abra seu banco, escolha Pix copia e cola e cole o codigo acima.
              </p>
              <p className="text-[11px] text-slate-500">
                O envio de comprovante fica disponível após o pedido ser enviado.
              </p>
            </>
          )}
          {!pixReady && !pixLoading && !pixError && (
            <p className="text-[11px] text-slate-500">
              Estamos preparando seu Pix. Aguarde alguns segundos.
            </p>
          )}
        </div>
      )}

      {pagamento === "cartao" && (
        <div className="premium-card bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Cartao de credito
              </p>
              <p className="text-sm text-slate-500">
                O link para pagamento e gerado automaticamente.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Ao clicar em "Finalizar pedido", voce sera redirecionado para o checkout seguro AxionPAY.
              </p>
              <p className="text-[11px] text-slate-500">
                O envio de comprovante fica disponível após o pedido ser enviado.
              </p>
            </div>
          </div>
          {cardError && (
            <p className="text-[11px] text-amber-700">{cardError}</p>
          )}
          {cardLoading && (
            <p className="text-[11px] text-slate-500">
              Preparando checkout...
            </p>
          )}
        </div>
      )}

      {pagamento === "cartao_entrega" && (
        <div className="premium-card bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Cartao na entrega
              </p>
              <p className="text-sm text-slate-500">
                O pagamento sera feito no momento da entrega, com a maquininha.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Ao clicar em "Finalizar pedido", o pedido sera confirmado e o pagamento
            sera realizado com cartao quando o motoboy chegar.
          </p>
        </div>
      )}

      <div className="premium-card bg-white border border-slate-200 rounded-2xl p-4 text-sm space-y-2">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <b>R$ {subtotal.toFixed(2).replace(".", ",")}</b>
        </p>
        <p className="flex justify-between">
          <span>Taxa de entrega</span>
          <b>R$ {taxaEntrega.toFixed(2).replace(".", ",")}</b>
        </p>
        {desconto > 0 && (
          <p className="flex justify-between text-emerald-600">
            <span>Desconto</span>
            <b>- R$ {desconto.toFixed(2).replace(".", ",")}</b>
          </p>
        )}
        <hr />
        <p className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>R$ {totalFinal.toFixed(2).replace(".", ",")}</span>
        </p>
      </div>
    </div>
  );
};

export default PagamentoStep;
