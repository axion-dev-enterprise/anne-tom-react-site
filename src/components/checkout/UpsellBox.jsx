// src/components/checkout/UpsellBox.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import server from "../../api/server";
import { MENU_CACHE_KEY, formatCurrencyBRL } from "../../utils/menu";

const CUSTOMER_CACHE_KEY = "checkout_cliente";

const readCachedMenu = () => {
  try {
    const raw = window.localStorage?.getItem(MENU_CACHE_KEY);
    const cached = raw ? JSON.parse(raw) : null;
    return cached?.data || null;
  } catch (_err) {
    return null;
  }
};

const readCachedCustomer = () => {
  try {
    const raw = window.localStorage?.getItem(CUSTOMER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_err) {
    return null;
  }
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const normalizePhone = (value) =>
  String(value || "").replace(/\D/g, "");

const extractProducts = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.items)) return data.items;
  return [];
};

const normalizePrice = (value) => {
  if (value == null) return null;
  if (typeof value === "string") {
    const cleaned = value
      .replace(/[^0-9,.-]/g, "")
      .replace(",", ".");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return null;
    if (parsed > 1000) return Math.round(parsed) / 100;
    return parsed;
  }
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return null;
  if (numberValue > 1000) return Math.round(numberValue) / 100;
  return numberValue;
};

const getItemPrice = (item) => {
  const priceCandidates = [
    item.price,
    item.preco,
    item.preco_unit,
    item.precoUnitario,
    item.preco_unitario,
    item.valor,
    item.valor_unitario,
    item.valor_unit,
    item.preco_grande,
    item.preco_broto,
    item.priceGrande,
    item.priceBroto,
    item.price_cents,
    item.amount_cents,
    item.priceCents,
    item.amountCents,
  ];
  for (const value of priceCandidates) {
    const normalized =
      value === item.price_cents ||
      value === item.amount_cents ||
      value === item.priceCents ||
      value === item.amountCents
        ? normalizePrice(Number(value) / 100)
        : normalizePrice(value);
    if (normalized != null && normalized > 0) return normalized;
  }
  return null;
};

const isBeverage = (item) => {
  const text = normalizeText(
    [
      item.type,
      item.tipo,
      item.category,
      item.categoria,
      item.name,
      item.nome,
      Array.isArray(item.tags) ? item.tags.join(" ") : "",
    ].join(" ")
  );
  if (text.includes("pizza")) return false;
  return /bebida|drink|refrigerante|refri|agua|mineral|suco|cerveja|vinho|chopp|cha|cafe|energetic|isotonico|soda|sparkling/.test(
    text
  );
};

const buildBeverageCatalog = (data) =>
  extractProducts(data)
    .filter((item) => item && typeof item === "object")
    .filter((item) => item.active !== false && item.isAvailable !== false)
    .filter(isBeverage)
    .map((item) => {
      const price = getItemPrice(item);
      const id = String(
        item.id ||
          item.codigo ||
          item.code ||
          item.sku ||
          item.slug ||
          item.name ||
          item.nome
      );
      const name = item.name || item.nome || "Bebida";
      return {
        id,
        name,
        price,
        nameNormalized: normalizeText(name),
      };
    })
    .filter((item) => item.price != null && item.price > 0);

const extractOrders = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
};

const resolveCustomerId = (customer) =>
  customer?.id || customer?._id || customer?.customerId || null;

const resolveCustomerPhone = (customer) =>
  normalizePhone(customer?.phone || customer?.telefone || "");

const resolveOrderCustomerId = (order) =>
  order?.customerId || order?.customerSnapshot?.id || order?.customer?.id || null;

const resolveOrderCustomerPhone = (order) =>
  normalizePhone(
    order?.customerSnapshot?.phone ||
      order?.customer?.phone ||
      order?.phone ||
      ""
  );

const buildBeverageStats = (orders, customerProfile, catalogById, catalogByName) => {
  const counts = new Map();
  if (!orders.length || !customerProfile) return counts;

  const customerId = customerProfile.id;
  const customerPhone = customerProfile.phone;

  orders.forEach((order) => {
    const orderCustomerId = resolveOrderCustomerId(order);
    const orderCustomerPhone = resolveOrderCustomerPhone(order);
    const matchesCustomer =
      (customerId && orderCustomerId && customerId === orderCustomerId) ||
      (customerPhone && orderCustomerPhone && customerPhone === orderCustomerPhone);

    if (!matchesCustomer) return;

    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item) => {
      const candidateId = String(
        item.productId || item.id || item.product?.id || item.sku || ""
      );
      const candidateName = normalizeText(item.name || item.nome || "");
      const beverage =
        (candidateId && catalogById.get(candidateId)) ||
        (candidateName && catalogByName.get(candidateName)) ||
        null;

      if (!beverage) return;

      const quantity = Number(item.quantity || item.quantidade || 1);
      counts.set(
        beverage.id,
        (counts.get(beverage.id) || 0) + (Number.isFinite(quantity) ? quantity : 1)
      );
    });
  });

  return counts;
};

const pickUpsellItems = (catalog, stats, limit = 2) => {
  if (!catalog.length) return [];

  const ranked = [...catalog].sort((a, b) => {
    const countA = stats.get(a.id) || 0;
    const countB = stats.get(b.id) || 0;
    return countB - countA;
  });

  const preferred = ranked.filter((item) => (stats.get(item.id) || 0) > 0);
  if (preferred.length >= limit) return preferred.slice(0, limit);

  const remaining = ranked.filter((item) => !preferred.includes(item));
  for (let i = remaining.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }

  return [...preferred, ...remaining].slice(0, limit);
};

const UpsellBox = ({ addItem }) => {
  const { customer } = useAuth();
  const [menuData, setMenuData] = useState(() => readCachedMenu());
  const [ordersData, setOrdersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await server.fetchMenu();
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setMenuData(data);
      } catch (_err) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMenu();
    return () => {
      cancelled = true;
    };
  }, []);

  const customerProfile = useMemo(() => {
    const cached = readCachedCustomer();
    return {
      id: resolveCustomerId(customer) || resolveCustomerId(cached),
      phone: resolveCustomerPhone(customer) || resolveCustomerPhone(cached),
    };
  }, [customer]);

  useEffect(() => {
    let cancelled = false;
    const customerId = customerProfile.id;
    const customerPhone = customerProfile.phone;

    if (!customerId && !customerPhone) return undefined;

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError("");
        const res = await server.fetchOrders();
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) setOrdersData(data);
      } catch (err) {
        if (!cancelled) {
          console.error("[UpsellBox] erro ao buscar pedidos:", err);
          setOrdersError("Nao foi possivel atualizar as sugestoes.");
        }
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [customerProfile.id, customerProfile.phone]);

  const upsellItems = useMemo(() => {
    const catalog = buildBeverageCatalog(menuData);
    if (!catalog.length) return [];

    const catalogById = new Map(catalog.map((item) => [item.id, item]));
    const catalogByName = new Map(
      catalog.map((item) => [item.nameNormalized, item])
    );

    const orders = extractOrders(ordersData);
    const stats = buildBeverageStats(
      orders,
      customerProfile,
      catalogById,
      catalogByName
    );

    return pickUpsellItems(catalog, stats, 2);
  }, [menuData, ordersData, customerProfile]);

  if (!addItem) return null;
  if (!upsellItems.length && !loading && !ordersLoading) return null;

  return (
    <div className="mt-4 premium-card rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-amber-900 text-base">
          Faltou a bebida?
        </p>
        {(loading || ordersLoading) && (
          <span className="text-[12px] text-amber-600">
            Atualizando itens...
          </span>
        )}
      </div>
      <p className="text-amber-800 text-sm">
        Complete seu pedido com bebidas do cardapio.
      </p>
      {ordersError && (
        <p className="text-[12px] text-amber-700">{ordersError}</p>
      )}

      <div className="space-y-2">
        {upsellItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              addItem({
                id: `bebida-${item.id}-${Date.now()}`,
                nome: item.name,
                tamanho: "unico",
                quantidade: 1,
                precoUnitario: item.price,
              })
            }
            className="w-full text-left px-3 py-2 rounded-xl bg-white border border-amber-200/70 hover:bg-amber-50"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-slate-800">
                {item.name}
              </span>
              <span className="text-amber-800 font-semibold">
                {formatCurrencyBRL(item.price)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UpsellBox;
