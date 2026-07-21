/* eslint-disable no-unused-vars */
import axios from 'axios';

const runtimeConfig =
  typeof window !== "undefined"
    ? window.__ANNE_TOM_CONFIG__ || window.__APP_CONFIG__
    : undefined;
const apiKey = process.env.REACT_APP_AT_API_KEY;
const publicToken = process.env.REACT_APP_PUBLIC_API_TOKEN;
const authToken = apiKey || publicToken;
// AxionPAY auth (never hardcode real tokens in repo)
const axionApiKey =
  process.env.REACT_APP_AXIONPAY_API_KEY ||
  process.env.REACT_APP_AXION_PAY_KEY ||
  runtimeConfig?.axionpayApiKey ||
  runtimeConfig?.axionPayApiKey ||
  "";
const axionPayTag =
  process.env.REACT_APP_AXIONPAY_PAY_TAG ||
  runtimeConfig?.axionPayTag ||
  "anne-tom";
// axionBearer removido (não utilizado)
// Endpoints AxionPAY configuraveis via env
const atBaseUrl =
  process.env.REACT_APP_AT_API_BASE_URL || "https://api.annetom.com";
const normalizeBaseUrl = (base) => String(base || "").replace(/\/+$/, "");
const baseDomainUrl = normalizeBaseUrl(atBaseUrl).replace(/\/api$/, "");
const buildAxionProxyUrl = (base) => {
  const normalized = normalizeBaseUrl(base);
  if (!normalized) return "";
  return normalized.endsWith("/api")
    ? `${normalized}/axionpay`
    : `${normalized}/api/axionpay`;
};
const axionBaseUrl =
  process.env.REACT_APP_AXIONPAY_BASE_URL ||
  buildAxionProxyUrl(atBaseUrl) ||
  "https://pay.axionenterprise.cloud";

const toResponse = (response) => ({
  ok: response.status >= 200 && response.status < 300,
  status: response.status,
  data: response.data,
  json: async () => response.data,
  text: async () =>
    typeof response.data === "string"
      ? response.data
      : JSON.stringify(response.data),
  headers: {
    get: (name) =>
      response.headers?.[String(name || "").toLowerCase()] || null,
  },
});

const toErrorResponse = (error) => ({
  ok: false,
  status: 0,
  error,
  json: async () => ({ error: String(error) }),
  text: async () => String(error),
  headers: {
    get: () => null,
  },
});

const normalizePayload = (payload) => {
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch (_err) {
      return payload;
    }
  }
  return payload;
};

/** Helper: chama um proxy same-origin e retorna resposta normalizada */
const callSameOriginProxy = async (path, payload, idempotencyKey) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
    const res = await fetch(path, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    return {
      ok: res.ok,
      status: res.status,
      data,
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: { get: (name) => res.headers.get(name) },
    };
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

export const serverInstance = {
  baseDomain: {
    instance: axios.create({
      timeout: 15000,
      baseURL: baseDomainUrl,
      validateStatus: () => true,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(authToken ? { "x-api-key": authToken } : {}),
        ...(!apiKey && !publicToken && runtimeConfig?.apiKey
          ? { Authorization: `Bearer ${runtimeConfig.apiKey}` }
          : {}),
      },
    }),
  },
  // paymentsDomain removido — agora usamos proxies same-origin
};

const fetchStatus = async (id) => {
  try {
    const response = await serverInstance.baseDomain.instance.get(
      `/motoboy/pedido/${id}`
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const enviarParaDesktop = async (params) => {
  try {
    const payload = normalizePayload(params);
    const response = await serverInstance.baseDomain.instance.post(
      `/api/orders`,
      payload
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const checkCustomerByPhone = async (phone) => {
  try {
    const response = await serverInstance.baseDomain.instance.get(
      `/api/customers/by-phone?phone=${phone}`
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const salvarCliente = async (params) => {
  try {
    const payload = normalizePayload(params);
    const response = await serverInstance.baseDomain.instance.post(
      `/api/customers`,
      payload
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const fetchMenu = async () => {
  try {
    const response = await serverInstance.baseDomain.instance.get(`/api/menu`);
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const fetchOrders = async () => {
  try {
    const response = await serverInstance.baseDomain.instance.get(`/api/orders`);
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const fetchBusinessHours = async () => {
  try {
    const response = await serverInstance.baseDomain.instance.get(
      `/api/pdv/business-hours`
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const confirmDelivery = async (orderId) => {
  try {
    const response = await serverInstance.baseDomain.instance.post(
      `/api/orders/${encodeURIComponent(orderId)}/status`,
      { status: "finalizado" }
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};


// Substituído por proxies Mercado Pago same-origin
const createPixPayment = async (params = {}, idempotencyKey) => {
  const payload = normalizePayload(params);
  return callSameOriginProxy("/api/create-pix", payload, idempotencyKey);
};

// Substituído por proxies Mercado Pago same-origin
const createCardPayment = async (params = {}, idempotencyKey) => {
  const payload = normalizePayload(params);
  return callSameOriginProxy("/api/create-card", payload, idempotencyKey);
};


const server = {
  fetchStatus,
  enviarParaDesktop,
  checkCustomerByPhone,
  salvarCliente,
  fetchMenu,
  fetchOrders,
  fetchBusinessHours,
  confirmDelivery,
  createPixPayment,
  createCardPayment,
};

export default server;
