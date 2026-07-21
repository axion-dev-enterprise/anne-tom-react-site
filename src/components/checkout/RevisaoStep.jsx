// src/components/checkout/RevisaoStep.jsx
import React from "react";

const RevisaoStep = ({
  dados,
  subtotal,
  taxaEntrega,
  desconto,
  totalFinal,
}) => {
  const enderecoResumo = [
    dados.endereco,
    dados.numero ? `, ${dados.numero}` : "",
    dados.complemento ? ` - ${dados.complemento}` : "",
  ]
    .join("")
    .trim();

  const cidadeUf = [dados.cidade, dados.uf].filter(Boolean).join(" / ");

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">Revise seus dados</h2>

      <div className="premium-card rounded-2xl border border-slate-200 bg-white p-4 text-sm space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 mb-1">
            Cliente
          </h3>
          <p className="font-medium text-slate-900">{dados.nome || "-"}</p>
          <p className="text-xs text-slate-600">{dados.telefone || "-"}</p>
          {dados.email && (
            <p className="text-[11px] text-slate-500">{dados.email}</p>
          )}
        </div>

        <hr className="border-slate-200" />

        <div>
          <h3 className="text-xs font-semibold text-slate-500 mb-1">
            Entrega
          </h3>
          <p className="text-xs text-slate-700">
            {dados.retirada ? "Retirada na loja" : "Entrega em domicilio"}
          </p>
          {!dados.retirada && (
            <>
              <p className="text-xs text-slate-700 mt-1">
                {enderecoResumo || "Endereco nao informado"}
              </p>
              <p className="text-[11px] text-slate-500">
                Bairro: {dados.bairro || "-"} · CEP: {dados.cep || "-"}
              </p>
              {cidadeUf && (
                <p className="text-[11px] text-slate-500">
                  Cidade/UF: {cidadeUf}
                </p>
              )}
              {dados.referencia && (
                <p className="text-[11px] text-slate-500">
                  Referencia: {dados.referencia}
                </p>
              )}
            </>
          )}
          {dados.obsGerais && (
            <p className="mt-2 text-[11px] text-slate-600">
              <span className="font-semibold">Observacoes: </span>
              {dados.obsGerais}
            </p>
          )}
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxa de entrega</span>
            <span>R$ {taxaEntrega.toFixed(2).replace(".", ",")}</span>
          </div>
          {desconto > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Desconto</span>
              <span>- R$ {desconto.toFixed(2).replace(".", ",")}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-1 text-sm">
            <span>Total estimado</span>
            <span>R$ {totalFinal.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisaoStep;
