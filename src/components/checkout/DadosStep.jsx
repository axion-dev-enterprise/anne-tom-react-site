// src/components/checkout/DadosStep.jsx
import React from "react";
import EnderecoMap from "./EnderecoMap";

const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

const DadosStep = ({
  dados,
  setDados,
  cupom,
  setCupom,
  aplicarCupom,
  buscarCep,
  buscandoCep,
  erroCep,
  checandoCliente,
  clienteExistente,
  erroClienteApi,
  onBuscarClientePorTelefone,
  tipoCliente,
  setTipoCliente,
  deliveryEta,
  deliveryEtaLoading,
  deliveryEtaError,
  distanceFee,
  deliveryFeeLabel,
  desconto,
}) => {
  const showDistancePending =
    !dados.retirada &&
    distanceFee == null &&
    !deliveryEtaLoading &&
    !deliveryEtaError;

  const getPhoneDigits = (value) => value.replace(/\D/g, "").slice(0, 11);

  const maskPhone = (value) => {
    const digits = getPhoneDigits(value);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(
        6
      )}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const normalizeCep = (value) => value.replace(/\D/g, "").slice(0, 8);

  const maskCep = (value) => {
    const digits = normalizeCep(value);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const handleTelefoneChange = (e) => {
    const raw = e.target.value;
    const masked = maskPhone(raw);
    setDados({ ...dados, telefone: masked });
  };

  const handleCepChange = (e) => {
    const masked = maskCep(e.target.value);
    setDados({ ...dados, cep: masked });
  };

  const handleAddressDetected = (address) => {
    if (!address) return;
    setDados((prev) => ({
      ...prev,
      endereco: address.street || prev.endereco,
      numero: address.number || prev.numero,
      bairro: address.neighborhood || prev.bairro,
      cidade: address.city || prev.cidade,
      uf: address.state || prev.uf,
      cep: address.postalCode ? maskCep(address.postalCode) : prev.cep,
    }));
  };

  const handlePositionChange = (coords) => {
    if (!coords) return;
    setDados((prev) => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
  };

  const phoneDigits = getPhoneDigits(dados.telefone);
  const cepDigits = normalizeCep(dados.cep);
  const liberarCampos =
    phoneDigits.length >= 10 &&
    (tipoCliente === "existing" || tipoCliente === "novo");

  const enderecoQuery = [
    dados.endereco,
    dados.numero,
    dados.bairro,
    dados.cidade,
    dados.uf,
    dados.cep,
  ]
    .filter(Boolean)
    .join(", ");

  const autoLocate =
    liberarCampos &&
    !dados.retirada &&
    !dados.latitude &&
    !dados.endereco &&
    cepDigits.length === 0;

  const missingFields = [];
  if (liberarCampos) {
    if (!dados.nome.trim()) missingFields.push("nome");
    if (phoneDigits.length < 10) missingFields.push("telefone");
    if (!dados.retirada) {
      if (cepDigits.length !== 8) missingFields.push("CEP");
      if (!dados.endereco.trim()) missingFields.push("rua");
      if (!String(dados.numero || "").trim()) missingFields.push("numero");
      if (!dados.bairro.trim()) missingFields.push("bairro");
    }
  }

  // auto-consulta na API quando e "Ja sou cliente"
  React.useEffect(() => {
    if (tipoCliente !== "existing") return;
    if (!onBuscarClientePorTelefone) return;
    if (phoneDigits.length < 10) return;
    if (checandoCliente) return;

    const timeout = setTimeout(() => {
      onBuscarClientePorTelefone(dados.telefone);
    }, 800);

    return () => clearTimeout(timeout);
  }, [
    tipoCliente,
    phoneDigits,
    checandoCliente,
    onBuscarClientePorTelefone,
    dados.telefone,
  ]);

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">Dados e entrega</h2>

      <section className="premium-card p-5 rounded-2xl bg-white border border-slate-200 text-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Voce ja e cliente Anne & Tom?
            </p>
            <p className="text-[11px] text-slate-500">
              Escolha uma opcao abaixo e digite seu telefone para continuar.
            </p>
          </div>
          <div className="inline-flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTipoCliente("existing")}
              className={`premium-pill premium-pill--sm text-[11px] ${
                tipoCliente === "existing" ? "premium-pill--active" : ""
              }`}
            >
              Ja sou cliente
            </button>
            <button
              type="button"
              onClick={() => setTipoCliente("novo")}
              className={`premium-pill premium-pill--sm text-[11px] ${
                tipoCliente === "novo" ? "premium-pill--active" : ""
              }`}
            >
              Primeira vez aqui
            </button>
          </div>
        </div>

        {tipoCliente === "auto" && (
          <p className="text-[11px] text-slate-500">
            Escolha uma das opcoes acima para comecar.
          </p>
        )}

        {tipoCliente !== "auto" && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Telefone / WhatsApp"
                value={dados.telefone}
                onChange={handleTelefoneChange}
                className="premium-field w-full"
              />

              {tipoCliente === "existing" && (
                <>
                  {checandoCliente && (
                    <p className="text-[11px] text-slate-500">
                      Buscando seu cadastro...
                    </p>
                  )}
                  {clienteExistente && !checandoCliente && (
                    <div className="mt-1 p-2 rounded-lg border border-emerald-200 bg-emerald-50 text-[11px] text-emerald-800">
                      <p className="font-semibold">
                        Cliente encontrado: {clienteExistente.name}
                      </p>
                      {clienteExistente.address && (
                        <p className="mt-0.5">
                          {clienteExistente.address.street} -{" "}
                          {clienteExistente.address.neighborhood}
                        </p>
                      )}
                    </div>
                  )}
                  {erroClienteApi && !checandoCliente && (
                    <p className="text-[11px] text-orange-600">
                      {erroClienteApi}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome completo"
                value={dados.nome}
                onChange={(e) =>
                  setDados({ ...dados, nome: e.target.value })
                }
                className="premium-field w-full"
              />
              <input
                type="email"
                placeholder="Email para recibo (opcional)"
                value={dados.email || ""}
                onChange={(e) =>
                  setDados({ ...dados, email: e.target.value })
                }
                className="premium-field w-full"
              />
            </div>
          </div>
        )}

        {tipoCliente !== "auto" && !liberarCampos && (
          <p className="text-[11px] text-slate-400">
            Digite seu telefone com DDD para liberar o restante dos dados.
          </p>
        )}
      </section>

      <div
        className={`transition-all duration-300 ease-out origin-top ${
          liberarCampos
            ? "opacity-100 max-h-[2000px] translate-y-0"
            : "opacity-0 max-h-0 -translate-y-1 overflow-hidden pointer-events-none"
        } space-y-6`}
      >
        <section className="premium-card p-5 rounded-2xl bg-white border border-slate-200 text-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Endereco de entrega
              </p>
              <p className="text-[11px] text-slate-500">
                Use o GPS ou edite os campos manualmente.
              </p>
            </div>
            <div className="inline-flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setDados((d) => ({ ...d, retirada: false }))
                }
                className={`premium-pill premium-pill--sm text-[11px] ${
                  !dados.retirada ? "premium-pill--accent" : ""
                }`}
              >
                Entrega
              </button>
              <button
                type="button"
                onClick={() =>
                  setDados((d) => ({ ...d, retirada: true }))
                }
                className={`premium-pill premium-pill--sm text-[11px] ${
                  dados.retirada ? "premium-pill--accent" : ""
                }`}
              >
                Retirada
              </button>
            </div>
          </div>

          {!dados.retirada ? (
            <EnderecoMap
              apiKey={MAPS_API_KEY}
              disabled={dados.retirada}
              autoLocate={autoLocate}
              addressQuery={enderecoQuery}
              initialPosition={
                dados.latitude != null && dados.longitude != null
                  ? { lat: dados.latitude, lng: dados.longitude }
                  : null
              }
              onAddressChange={handleAddressDetected}
              onPositionChange={handlePositionChange}
            />
          ) : (
            <p className="text-[11px] text-slate-500">
              Retirada selecionada. Sem necessidade de endereco.
            </p>
          )}

          {!dados.retirada && (
            <div className="grid md:grid-cols-[2fr_1fr] gap-3 items-center">
              <input
                type="text"
                placeholder="CEP"
                value={dados.cep}
                onChange={handleCepChange}
                onBlur={buscarCep}
                className="premium-field w-full"
              />
              <button
                type="button"
                onClick={buscarCep}
                disabled={buscandoCep}
                className="premium-button-ghost px-4 py-2 text-xs disabled:opacity-60"
              >
                {buscandoCep ? "Buscando CEP..." : "Atualizar via CEP"}
              </button>
            </div>
          )}

          {erroCep && (
            <p className="text-[11px] text-red-500">{erroCep}</p>
          )}

          {!dados.retirada && (
            <div className="grid md:grid-cols-[2fr_1fr] gap-3">
              <input
                type="text"
                placeholder="Rua / logradouro"
                value={dados.endereco}
                onChange={(e) =>
                  setDados({ ...dados, endereco: e.target.value })
                }
                className="premium-field w-full"
              />
              <input
                type="text"
                placeholder="Numero"
                value={dados.numero}
                onChange={(e) =>
                  setDados({ ...dados, numero: e.target.value })
                }
                className="premium-field w-full"
              />
            </div>
          )}

          {!dados.retirada && (
            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Complemento (opcional)"
                value={dados.complemento}
                onChange={(e) =>
                  setDados({ ...dados, complemento: e.target.value })
                }
                className="premium-field w-full"
              />
              <input
                type="text"
                placeholder="Bairro"
                value={dados.bairro}
                onChange={(e) =>
                  setDados({ ...dados, bairro: e.target.value })
                }
                className="premium-field w-full"
              />
            </div>
          )}

          {!dados.retirada && (
            <div className="grid md:grid-cols-[2fr_1fr] gap-3">
              <input
                type="text"
                placeholder="Cidade"
                value={dados.cidade}
                onChange={(e) =>
                  setDados({ ...dados, cidade: e.target.value })
                }
                className="premium-field w-full"
              />
              <input
                type="text"
                placeholder="UF"
                value={dados.uf}
                onChange={(e) =>
                  setDados({ ...dados, uf: e.target.value.toUpperCase() })
                }
                className="premium-field w-full"
              />
            </div>
          )}

          {!dados.retirada && (
            <input
              type="text"
              placeholder="Referencia para encontrar melhor (opcional)"
              value={dados.referencia}
              onChange={(e) =>
                setDados({ ...dados, referencia: e.target.value })
              }
              className="premium-field w-full"
            />
          )}

          <div className="grid md:grid-cols-2 gap-4 items-start">
            <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              {dados.bairro ? (
                <>
                  <p className="font-semibold text-slate-800">
                    Bairro detectado: {dados.bairro}
                  </p>
                  {!dados.retirada && distanceFee != null && (
                    <p className="mt-1 text-[11px] text-emerald-700">
                      Taxa calculada por {deliveryFeeLabel}:{" "}
                      <strong>
                        R${" "}
                        {distanceFee.toFixed(2).replace(".", ",")}
                      </strong>
                    </p>
                  )}
                  {showDistancePending && (
                    <p className="mt-1 text-[11px] text-amber-700">
                      Taxa por distancia ainda nao calculada. Revise
                      o endereco para liberar a entrega.
                    </p>
                  )}
                  {!dados.retirada && (
                    <>
                      {deliveryEtaLoading && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Calculando tempo estimado de entrega...
                        </p>
                      )}
                      {deliveryEta && !deliveryEtaLoading && (
                        <p className="mt-1 text-[11px] text-slate-600">
                          Tempo estimado:{" "}
                          <strong>{deliveryEta.durationText}</strong>{" "}
                          ({deliveryEta.distanceText})
                        </p>
                      )}
                      {deliveryEtaError && !deliveryEtaLoading && (
                        <p className="mt-1 text-[11px] text-amber-600">
                          {deliveryEtaError}
                        </p>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Informe o CEP e o endereco para calcular a taxa.
                </p>
              )}
              {dados.retirada && (
                <p className="mt-1 text-[11px] text-slate-600">
                  Retirada selecionada: taxa de entrega zerada.
                </p>
              )}
            </div>

            {missingFields.length > 0 && (
              <div className="text-[11px] text-slate-500">
                Falta completar:{" "}
                <span className="font-semibold">
                  {missingFields.join(", ")}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="premium-card p-5 rounded-2xl bg-white border border-slate-200 text-xs space-y-4">
          <textarea
            placeholder="Observacoes gerais do pedido (ex.: portaria, troco, ponto da borda...)"
            value={dados.obsGerais}
            onChange={(e) =>
              setDados({ ...dados, obsGerais: e.target.value })
            }
            className="premium-field w-full min-h-[90px]"
          />

          <div className="grid md:grid-cols-[2fr_1fr] gap-3 items-center">
            <input
              type="text"
              placeholder="Cupom (ex.: PRIMEIRA)"
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
              className="premium-field w-full text-sm"
            />
            <button
              type="button"
              onClick={aplicarCupom}
              className="premium-button-ghost px-4 py-2 text-xs"
            >
              Aplicar cupom
            </button>
          </div>

          {desconto > 0 && (
            <p className="text-[11px] text-emerald-700">
              Cupom aplicado. Desconto ativo de R${" "}
              {desconto.toFixed(2).replace(".", ",")}.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default DadosStep;
