// ===============================================
// CARDÁPIO INTERNO • ANNE & TOM
// Versão completa com:
// - Badges de destaque
// - Extras dinâmicos da API
// - Sugestões para upsell
// - Meio a meio
// - Busca, categorias
// - Modal profissional
// - Cache local do cardápio
// - Bloqueio por horário de funcionamento
// ===============================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import server from "../api/server";
import {
  formatCurrencyBRL,
  normalizeExtrasFromJson,
  PRODUCT_PLACEHOLDER_IMAGE,
} from "../utils/menu";
import { useMenuData } from "../hooks/useMenuData";
import RetryBanner from "../components/ui/RetryBanner";
import { useAppAccessInfo } from "../hooks/useAppAccess";
import SEOHead from "../components/seo/SEOHead";
import HalfPizzaBuilderModal from "../components/ui/HalfPizzaBuilderModal";
import MobileCartDrawer from "../components/ui/MobileCartDrawer";
import ProductCustomizerModal from "../components/ui/ProductCustomizerModal";
import DynamicPromotionsBanner from "../components/checkout/DynamicPromotionsBanner";

// Horários oficiais (Tripadvisor):
// Domingo: 19:00–23:00
// Segunda: fechado
// Terça a Sábado: 19:00–23:00
const OPENING_HOURS = {
  0: { open: 18 * 60, close: 23 * 60 }, // Domingo
  1: null, // Segunda fechado
  2: { open: 18 * 60, close: 24 * 60 },
  3: { open: 18 * 60, close: 23 * 60 },
  4: { open: 18 * 60, close: 23 * 60 },
  5: { open: 18 * 60, close: 23 * 60 },
  6: { open: 18 * 60, close: 23 * 60 }, // Sábado
};

const buildImageStyle = (transform) => {
  const zoom = Number(transform?.zoom) || 1.08;
  const focusX = Number(transform?.focusX);
  const focusY = Number(transform?.focusY);
  return {
    objectFit: "cover",
    objectPosition: `${Number.isFinite(focusX) ? focusX : 50}% ${
      Number.isFinite(focusY) ? focusY : 42
    }%`,
    transform: `scale(${Math.min(2.5, Math.max(1, zoom))})`,
    transformOrigin: "center",
  };
};

const FILTER_STORAGE_KEY = "anne_tom_cardapio_filters_v1";

const OPENING_LABEL = "terca a domingo das 19h as 23h (segunda fechado)";

const WEEKDAY_LABELS = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

const formatDayList = (days) => {
  const names = days
    .map((day) => WEEKDAY_LABELS[day])
    .filter(Boolean);
  if (!names.length) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
};

const formatDayRanges = (days) => {
  const sorted = Array.from(new Set(days))
    .filter((day) => day >= 0 && day <= 6)
    .sort((a, b) => a - b);

  if (!sorted.length) return "";

  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] === prev + 1) {
      prev = sorted[i];
      continue;
    }
    ranges.push([start, prev]);
    start = sorted[i];
    prev = sorted[i];
  }

  ranges.push([start, prev]);

  return ranges
    .map(([from, to]) =>
      from === to
        ? WEEKDAY_LABELS[from]
        : `${WEEKDAY_LABELS[from]} a ${WEEKDAY_LABELS[to]}`
    )
    .join(" e ");
};

const formatOpenDaysLabel = (openDays, closedDays) => {
  if (openDays.length === 7) return "todos os dias";

  if (openDays.length === 6 && closedDays.length === 1) {
    const closed = closedDays[0];
    const start = (closed + 1) % 7;
    const end = (closed + 6) % 7;
    if (start === end) return WEEKDAY_LABELS[start];
    return `${WEEKDAY_LABELS[start]} a ${WEEKDAY_LABELS[end]}`;
  }

  return formatDayRanges(openDays);
};

const normalizeSchedule = (businessHours) => {
  if (!businessHours) return null;
  const schedule = Array.isArray(businessHours.weeklySchedule)
    ? businessHours.weeklySchedule
    : null;
  if (!schedule) return null;

  const fallbackOpen = businessHours.openTime || "";
  const fallbackClose = businessHours.closeTime || "";

  return schedule
    .map((entry) => {
      const day = Number(entry.day);
      if (!Number.isFinite(day)) return null;
      return {
        day,
        enabled: entry.enabled !== false,
        openTime: entry.openTime || fallbackOpen,
        closeTime: entry.closeTime || fallbackClose,
      };
    })
    .filter(Boolean);
};

const parseTimeToMinutes = (value) => {
  if (!value || typeof value !== "string") return null;
  const [rawH, rawM] = value.split(":");
  const hour = Number(rawH);
  const minute = Number(rawM);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
};

const isBusinessOpenNow = (businessHours, now = new Date()) => {
  if (!businessHours || businessHours.enabled === false) return true;

  const schedule = normalizeSchedule(businessHours);
  const weekday = now.getDay();
  const scheduleEntry = schedule
    ? schedule.find((entry) => entry.day === weekday)
    : null;

  if (scheduleEntry && scheduleEntry.enabled === false) return false;

  const openTime =
    scheduleEntry?.openTime || businessHours.openTime || "00:00";
  const closeTime =
    scheduleEntry?.closeTime || businessHours.closeTime || "23:59";

  const openMinutes = parseTimeToMinutes(openTime);
  const closeMinutes = parseTimeToMinutes(closeTime);
  if (openMinutes == null || closeMinutes == null) return true;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (closeMinutes <= openMinutes) {
    return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  }

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
};

const buildBusinessHoursLabel = (businessHours) => {
  if (!businessHours) return OPENING_LABEL;
  if (businessHours.enabled === false) {
    return "horario livre (sem bloqueio no PDV)";
  }

  const schedule = normalizeSchedule(businessHours);
  const closedDays = schedule
    ? schedule.filter((entry) => entry.enabled === false).map((entry) => entry.day)
    : Array.isArray(businessHours.closedWeekdays)
    ? businessHours.closedWeekdays
    : [];

  const openDays = schedule
    ? schedule.filter((entry) => entry.enabled !== false).map((entry) => entry.day)
    : [0, 1, 2, 3, 4, 5, 6].filter(
        (day) => !closedDays.includes(day)
      );

  if (!openDays.length) return "fechado todos os dias";

  const closedLabel = closedDays.length
    ? ` (${formatDayList(closedDays)} fechado)`
    : "";

  if (schedule) {
    const groups = new Map();
    schedule
      .filter((entry) => entry.enabled !== false)
      .forEach((entry) => {
        const key = `${entry.openTime || ""}|${entry.closeTime || ""}`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key).push(entry.day);
      });

    const parts = Array.from(groups.entries()).map(([key, days]) => {
      const [open, close] = key.split("|");
      const daysLabel = formatOpenDaysLabel(days, closedDays);
      return `${daysLabel} das ${open} as ${close}`;
    });

    return `${parts.join(" | ")}${closedLabel}`;
  }

  const openLabel = formatOpenDaysLabel(openDays, closedDays);
  const openTime = businessHours.openTime || "00:00";
  const closeTime = businessHours.closeTime || "23:59";
  return `${openLabel} das ${openTime} as ${closeTime}${closedLabel}`;
};

function isPizzariaOpen(now = new Date()) {
  const dow = now.getDay(); // 0-dom, 1-seg...
  const rule = OPENING_HOURS[dow];
  if (!rule) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= rule.open && minutes < rule.close;
}






const isBordaExtra = (item) => {
  const categoria = String(item?.categoria || "").toLowerCase();
  const nome = String(item?.nome || "").toLowerCase();
  return categoria.includes("borda") || nome.includes("borda");
};

// Abas por destaque / promoções / categorias especiais
const BADGE_TABS = [
  { key: "all", label: "Todos" },
  { key: "best", label: "Mais pedidos" },
  { key: "new", label: "Novidades" },
  { key: "veggie", label: "Veggie" },
  { key: "hot", label: "Picantes" },
  { key: "esfiha", label: "Big Esfihas" },
  { key: "promo", label: "Combos & Promoções" },
  { key: "doces", label: "Pizzas doces" },
];

// Label bonitinho para categoria
const prettyCategory = (c) => {
  if (!c) return "";
  if (c === "todas") return "Todas";
  const lower = String(c).toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Converte badges "humanos" do JSON em códigos usados nas abas
// e também tenta inferir por nome/categoria/ingredientes
const CardapioPage = () => {
  const { addItem, items, total } = useCart();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  // ---- Estados Gerais ----
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHalfModalOpen, setIsHalfModalOpen] = useState(false);
  // ---- Horario de funcionamento (PDV/API) ----
  const [businessHours, setBusinessHours] = useState(null);
  const [businessStatus, setBusinessStatus] = useState(null);
  const [businessHoursError, setBusinessHoursError] = useState("");
  const [businessHoursLoading, setBusinessHoursLoading] = useState(false);

  const { isAppWebView, initialized: appInfoReady } = useAppAccessInfo();
  const [showAppToast, setShowAppToast] = useState(false);

  const {
    menuData,
    pizzas,
    loadingMenu,
    menuError,
    isUsingCachedMenu,
    retry,
  } = useMenuData();

  const extrasFromApi = useMemo(
    () => normalizeExtrasFromJson(menuData),
    [menuData]
  );
  const ingredientesExtrasApi = useMemo(
    () => extrasFromApi.filter((item) => !isBordaExtra(item)),
    [extrasFromApi]
  );
  const hasGlobalExtras = ingredientesExtrasApi.length > 0;

  useEffect(() => {
    try {
      const raw = window.localStorage?.getItem(FILTER_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.categoria) setCategoria(saved.categoria);
      if (saved?.badgeFilter) setBadgeFilter(saved.badgeFilter);
      if (typeof saved?.search === "string") setSearch(saved.search);
    } catch (_err) {
      // ignore
    }
  }, []);

  const targetPizzaId = searchParams.get("pizzaId");
  const targetPizzaName = searchParams.get("pizza");

  useEffect(() => {
    try {
      const payload = { categoria, badgeFilter, search };
      window.localStorage?.setItem(FILTER_STORAGE_KEY, JSON.stringify(payload));
    } catch (_err) {
      // ignore
    }
  }, [categoria, badgeFilter, search]);

  useEffect(() => {
    let cancelled = false;

    const fetchBusinessHours = async () => {
      try {
        setBusinessHoursLoading(true);
        setBusinessHoursError("");

        const response = await server.fetchBusinessHours();
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        if (cancelled) return;

        setBusinessHours(
          payload?.businessHours || payload?.settings?.businessHours || null
        );
        setBusinessStatus(payload?.status || payload?.businessStatus || null);
      } catch (err) {
        if (cancelled) return;
        console.error("[Cardapio] erro ao buscar horario PDV:", err);
        setBusinessHoursError(
          "Nao foi possivel atualizar o horario do PDV."
        );
      } finally {
        if (!cancelled) setBusinessHoursLoading(false);
      }
    };

    fetchBusinessHours();
    const interval = setInterval(fetchBusinessHours, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!appInfoReady || !isAppWebView) return undefined;
    setShowAppToast(true);
    const timer = window.setTimeout(() => setShowAppToast(false), 3500);
    return () => window.clearTimeout(timer);
  }, [appInfoReady, isAppWebView]);

  // ---- Modal ----
  const [selectedPizza, setSelectedPizza] = useState(null);
  const cardRefs = useRef({});
  const modalRef = useRef(null);
  const [highlightedPizzaId, setHighlightedPizzaId] = useState(null);

  const openingLabel = buildBusinessHoursLabel(businessHours);
  const apiOpen =
    typeof businessStatus?.isOpen === "boolean"
      ? businessStatus.isOpen
      : null;
  const isOpenNow =
    apiOpen != null
      ? apiOpen
      : businessHours
      ? isBusinessOpenNow(businessHours)
      : isPizzariaOpen();



  // Categorias dinamicas
  const categorias = useMemo(() => {
    const set = new Set(pizzas.map((p) => p.categoria).filter(Boolean));
    return ["todas", ...Array.from(set)];
  }, [pizzas]);

  // Filtro principal (categoria + busca + aba de badges)
  const pizzasFiltradas = useMemo(() => {
    const termo = search.toLowerCase();

    return pizzas.filter((p) => {
      const categoriaUpper = String(p.categoria || "").toUpperCase();

      const okCat =
        categoria === "todas" || p.categoria === categoria;

      const texto = `${p.nome} ${p.categoria} ${(p.ingredientes || []).join(
        " "
      )}`.toLowerCase();
      const okBusca = texto.includes(termo);

      const badges = p.badges || [];

      let okBadge = true;
      if (badgeFilter === "all") {
        okBadge = true;
      } else if (badgeFilter === "promo") {
        okBadge = /PROMO|COMBO|OFERTA/.test(categoriaUpper);
      } else if (badgeFilter === "esfiha") {
        okBadge = categoriaUpper.includes("ESFIHA");
      } else if (badgeFilter === "doces") {
        okBadge = categoriaUpper.includes("DOCE");
      } else {
        // best, new, veggie, hot → via badges
        okBadge = badges.includes(badgeFilter);
      }

      return okCat && okBusca && okBadge;
    });
  }, [pizzas, categoria, search, badgeFilter]);

  const abrirModal = (pizza, options = {}) => {
    if (options.highlight) {
      setHighlightedPizzaId(pizza.id);
      window.setTimeout(() => setHighlightedPizzaId(null), 2000);
    }
    setSelectedPizza(pizza);
  };

  useEffect(() => {
    if (!pizzas.length || selectedPizza) return;

    let found = null;
    if (targetPizzaId) {
      found = pizzas.find((pizza) => pizza.id === targetPizzaId);
    }

    if (!found && targetPizzaName) {
      const nameLower = targetPizzaName.toLowerCase();
      found = pizzas.find((pizza) =>
        String(pizza.nome || "").toLowerCase().includes(nameLower)
      );
    }

    if (found) {
      const node = cardRefs.current?.[found.id];
      if (node && node.scrollIntoView) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      abrirModal(found, { highlight: true });
    }
  }, [pizzas, targetPizzaId, targetPizzaName, selectedPizza]);

  const fecharModal = useCallback(() => {
    setSelectedPizza(null);

    if (searchParams.has("pizzaId") || searchParams.has("pizza")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("pizzaId");
      nextParams.delete("pizza");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedPizza) return undefined;

    const modalNode = modalRef.current;
    const focusableSelector =
      "a, button, input, textarea, select, [tabindex]:not([tabindex='-1'])";

    const focusables = modalNode
      ? Array.from(modalNode.querySelectorAll(focusableSelector)).filter(
          (el) => !el.hasAttribute("disabled")
        )
      : [];

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (first && first.focus) {
      first.focus();
    } else if (modalNode && modalNode.focus) {
      modalNode.focus();
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        fecharModal();
      }

      if (event.key !== "Tab") return;

      if (!first || !last) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedPizza, fecharModal]);

  // total de itens no carrinho (para barra flutuante)
  const totalItensCarrinho = items.reduce(
    (acc, item) => acc + (Number(item.quantidade) || 0),
    0
  );

  return (
    <div className="premium-page min-h-screen">
      <SEOHead 
        title="Cardápio Completo - Pizzas Artesanais"
        description="🍕 Veja nosso cardápio completo com pizzas artesanais, massas especiais, bordas recheadas e muito mais. Peça agora e receba em casa!"
        keywords={['cardápio pizza', 'pizzas artesanais', 'delivery pizza', 'pizza zona norte', 'sabores pizza']}
      />
      
      {/* HEADER */}
      <header className="premium-panel border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logopizzaria.png"
              alt="Anne & Tom Pizzaria"
              className="w-10 h-10 object-contain"
            />
            <div>
              <p className="text-sm font-semibold">Pizzaria Anne & Tom</p>
              <p className="text-[11px] text-slate-500">Cardápio interno</p>
            </div>
          </Link>

          <button
            className="premium-button-ghost text-xs px-4 py-1.5"
            onClick={() => navigate("/checkout")}
          >
            🧾 Checkout
          </button>
        </div>
      </header>

      {showAppToast && (
        <div className="fixed left-1/2 top-24 z-40 w-[min(95%,360px)] -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-2 text-center text-xs font-semibold text-white shadow-lg">
          Você está no cardápio interno da Anne &amp; Tom.
        </div>
      )}

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {menuError && <RetryBanner message={menuError} onRetry={retry} />}

        {/* Título */}
        <section className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-black">
            Escolha suas pizzas
          </h1>

          <p className="text-base text-slate-600">
            Clique para ver detalhes, montar meio a meio e adicionar extras.
          </p>

          {/* Banner de horário */}
          <div className="text-xs md:text-sm flex flex-wrap gap-2 items-center">
            <span className="px-2 py-1 rounded-full bg-slate-900 text-white text-[11px] uppercase tracking-wide">
              {isOpenNow ? "Aberto agora" : "Fechado no momento"}
            </span>
            <span className="text-slate-600">{openingLabel}</span>
            {businessHoursLoading && (
              <span className="text-[11px] text-slate-400">
                Atualizando horario...
              </span>
            )}
            {businessHoursError && (
              <span className="text-[11px] text-amber-600">
                {businessHoursError}
              </span>
            )}
            {isUsingCachedMenu && (
              <span className="text-[11px] text-amber-600">
                (Usando cardápio salvo no dispositivo)
              </span>
            )}
          </div>

          {/* BANNER DE PROMOÇÕES DINÂMICAS */}
          <DynamicPromotionsBanner subtotal={total} items={items} />

          {/* BUSCA + CATEGORIA */}
          <div
            className="premium-panel sticky top-20 z-10 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl px-4 py-4"
            style={{ top: "calc(72px + env(safe-area-inset-top, 0px))" }}
          >
          <label htmlFor="cardapio-search" className="sr-only">
            Buscar cardápio
          </label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="premium-input flex-1">
              <span className="text-lg">🔍</span>
              <input
                id="cardapio-search"
                type="text"
                className="premium-input-field flex-1 text-sm md:text-base"
                placeholder="Buscar por nome ou ingrediente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="premium-select w-full md:w-56 text-sm md:text-base"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {prettyCategory(c)}
                </option>
              ))}
            </select>
          </div>
        </div>

          {loadingMenu && (
            <p className="text-xs text-slate-500">Carregando...</p>
          )}
          {menuError && (
            <p
              className="text-xs text-amber-700"
              role="status"
              aria-live="polite"
            >
              {menuError}
            </p>
          )}
        </section>

        {/* LISTA */}
        <section className="space-y-4 pb-16">
          <h2 className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
            Sabores disponíveis
          </h2>

          {/* ABAS DE DESTAQUE */}
          <div className="flex flex-wrap gap-2 mb-2">
            {BADGE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setBadgeFilter(tab.key)}
                className={`premium-pill min-h-[44px] text-xs md:text-sm ${
                  badgeFilter === tab.key ? "premium-pill--active" : ""
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {pizzasFiltradas.map((pizza) => {
              const priceParts = [];
              if (pizza.preco_grande != null) {
                priceParts.push(`Grande ${formatCurrencyBRL(pizza.preco_grande)}`);
              }
              if (pizza.preco_broto != null) {
                priceParts.push(`Broto ${formatCurrencyBRL(pizza.preco_broto)}`);
              }
              const ariaLabel = `${pizza.nome} ${
                priceParts.length ? `– ${priceParts.join(" / ")}` : ""
              } | ${prettyCategory(pizza.categoria)}`;

              return (
                <button
                  key={pizza.id}
                  ref={(node) => {
                    if (node) cardRefs.current[pizza.id] = node;
                  }}
                  onClick={() => abrirModal(pizza)}
                  aria-label={ariaLabel}
                  className={`premium-card text-left bg-white border rounded-2xl p-5 flex gap-4 hover:shadow-lg transition-shadow ${highlightedPizzaId === pizza.id ? "border-amber-400 ring-2 ring-amber-200" : "border-slate-200"}`}
                >
                  {/* imagem */}
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-amber-200 via-orange-300 to-red-300 flex items-center justify-center text-3xl">
                    {pizza.imagem ? (
                      <img
                        src={pizza.imagem}
                        alt={pizza.nome}
                        className="w-full h-full"
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.src = PRODUCT_PLACEHOLDER_IMAGE;
                        }}
                        style={buildImageStyle(pizza.imageTransform)}
                      />
                    ) : (
                      <span aria-hidden="true">🍕</span>
                    )}
                  </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase text-slate-400">
                      {prettyCategory(pizza.categoria)}
                    </p>

                    <h3 className="text-base md:text-lg font-semibold">
                      {pizza.nome}
                    </h3>

                    {/* INGREDIENTES */}
                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                      {pizza.ingredientes?.join(", ")}
                    </p>

                    {/* BADGES */}
                    <div className="flex gap-1 flex-wrap mt-2">
                      {(pizza.extras?.length > 0 || hasGlobalExtras) && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            abrirModal(pizza, { focusExtras: true });
                          }}
                          className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-600 rounded-full"
                        >
                          Adicionais
                        </button>
                      )}
                      {pizza.badges?.includes("best") && (
                        <span className="px-2 py-0.5 text-[11px] bg-amber-100 text-amber-700 rounded-full">
                          ⭐ Mais pedido
                        </span>
                      )}
                      {pizza.badges?.includes("new") && (
                        <span className="px-2 py-0.5 text-[11px] bg-sky-100 text-sky-600 rounded-full">
                          🆕 Novo
                        </span>
                      )}
                      {pizza.badges?.includes("hot") && (
                        <span className="px-2 py-0.5 text-[11px] bg-red-100 text-red-600 rounded-full">
                          🌶️ Picante
                        </span>
                      )}
                      {pizza.badges?.includes("veggie") && (
                        <span className="px-2 py-0.5 text-[11px] bg-emerald-100 text-emerald-700 rounded-full">
                          🥬 Veggie
                        </span>
                      )}
                      {pizza.badges?.includes("promo") && (
                        <span className="px-2 py-0.5 text-[11px] bg-purple-100 text-purple-700 rounded-full">
                          💥 Promo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PREÇOS */}
                  <div className="text-sm mt-3 font-medium text-slate-800">
                    {pizza.preco_broto != null && (
                      <span className="mr-3 block md:inline">
                        Broto:{" "}
                        <span className="font-semibold">
                          {formatCurrencyBRL(pizza.preco_broto)}
                        </span>
                      </span>
                    )}
                    {pizza.preco_grande != null && (
                      <span>
                        Grande:{" "}
                        <span className="font-semibold">
                          {formatCurrencyBRL(pizza.preco_grande)}
                        </span>
                      </span>
                    )}
                  </div>
                  </div>
                </button>
              );
            })}

            {!loadingMenu && pizzasFiltradas.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhum sabor encontrado.
              </p>
            )}
          </div>
        </section>
      </main>
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="premium-button-ghost fixed bottom-6 right-6 z-30 text-xs px-4 py-2 shadow-lg"
        >
          Voltar ao topo
        </button>
      )}


      {/* MODAL DE PERSONALIZAÇÃO COMPLETO */}
      <ProductCustomizerModal
        isOpen={Boolean(selectedPizza)}
        onClose={() => setSelectedPizza(null)}
        pizza={selectedPizza}
        allPizzas={pizzas}
        onAddToCart={addItem}
        isOpenNow={isOpenNow}
      />

      {/* BARRA FLUTUANTE DO CARRINHO */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-3 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-6xl w-full px-4">
            <button
              onClick={() => navigate("/checkout")}
              className="premium-button w-full flex items-center justify-between gap-3 py-3 px-5 shadow-xl text-sm md:text-base"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/10 text-xs">
                  {totalItensCarrinho}
                </span>
                <span>Ver carrinho e finalizar pedido</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span>{formatCurrencyBRL(total)}</span>
                <span className="text-xs md:text-sm opacity-80">
                  Ir para checkout →
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
      <MobileCartDrawer />
      <HalfPizzaBuilderModal
        isOpen={isHalfModalOpen}
        onClose={() => setIsHalfModalOpen(false)}
        pizzas={pizzas}
        onAddToCart={addItem}
      />
    </div>
  );
};

export default CardapioPage;
