// src/pages/HomeAnneTom.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";

import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMenuData } from "../hooks/useMenuData";
import { formatCurrencyBRL, resolveProductImage } from "../utils/menu";
import { HOME_MENU_OVERRIDES, matchOverrides } from "../data/menuOverrides";
import SEOHead from "../components/seo/SEOHead";

import { useAppAccessInfo } from "../hooks/useAppAccess";
import RetryBanner from "../components/ui/RetryBanner";
import SiteFooter from "../components/layout/SiteFooter";
import { useAuth } from "../context/AuthContext";
import QuickAuthModal from "../components/auth/QuickAuthModal";
import PizzaClubSection from "../components/club/PizzaClubSection";

const AVATAR_IMAGES = [
  "https://i.pravatar.cc/80?img=32",
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=56",
];

const REAL_PIZZA_IMAGES = [
  {
    src: "/menu-images/musa.png",
    alt: "Pizza Musa - Mussarela, tomate fresco e manjericão",
    title: "Musa Artesanal",
  },
  {
    src: "/menu-images/musa_rebelde.png",
    alt: "Pizza Musa Rebelde - Edição Especial da Casa",
    title: "Musa Rebelde",
  },
  {
    src: "/menu-images/marguerita.png",
    alt: "Pizza Marguerita - Molho artesanal e manjericão fresco",
    title: "Marguerita Tradicional",
  },
  {
    src: "/menu-images/anne_tom.png",
    alt: "Pizza Anne & Tom - Receita Autoral 48h",
    title: "Especial Anne & Tom",
  },
];





/* ===========================================================================

   HOME PAGE — ANNE & TOM

   Versão mais interativa, com:

   - Seção de Pizzas Veggie

   - Seção de Mais Vendidas

   - Ícones e textos um pouco maiores

   =========================================================================== */



const HomeAnneTom = () => {

  const [scrolled, setScrolled] = useState(false);

  const [imageLoaded, setImageLoaded] = useState(false);

  const { pizzas, loadingMenu, menuError, retry } = useMenuData();
  const { isAppWebView, initialized } = useAppAccessInfo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized || !isAppWebView) return;
    navigate("/cardapio", { replace: true });
  }, [initialized, isAppWebView, navigate]);



  useEffect(() => {

    const onScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);

  }, []);

  

  const bestSellerItems = useMemo(() => {
    const overrides = matchOverrides(pizzas, HOME_MENU_OVERRIDES.bestSellers);
    if (overrides.length) return overrides.slice(0, 4);
    const best = pizzas.filter((pizza) => (pizza.badges || []).includes("best"));
    return best.slice(0, 4);
  }, [pizzas]);

  const veggieItems = useMemo(() => {
    const overrides = matchOverrides(pizzas, HOME_MENU_OVERRIDES.veggie);
    if (overrides.length) return overrides.slice(0, 3);
    const veggie = pizzas.filter((pizza) => (pizza.badges || []).includes("veggie"));
    return veggie.slice(0, 3);
  }, [pizzas]);

  const showDownloadAppSection = !isAppWebView;




  return (

    <div className="home-anne-tom min-h-screen text-slate-900 antialiased">

      <SEOHead 
        title="Pizzaria Anne & Tom - Pizzas Artesanais na Zona Norte"
        description="🍕 Pizzaria Anne & Tom: As melhores pizzas artesanais da Zona Norte de São Paulo. Massa fermentada por 48h, ingredientes frescos e delivery rápido. Peça agora!"
        keywords={['pizzaria zona norte', 'pizza artesanal', 'delivery pizza', 'pizza Santana', 'massa fina pizza']}
      />

      <div className="animate-page-in">

        <Header scrolled={scrolled} />



        <main className="pt-14 md:pt-16">

        <Hero imageLoaded={imageLoaded} setImageLoaded={setImageLoaded} />

        {menuError && <RetryBanner message={menuError} onRetry={retry} />}

        <PizzaClubSection />

        {showDownloadAppSection && <DownloadAppSection />}



          {/* DESTAQUES GERAIS */}

          <SectionWrapper

            id="destaques"

            bg="bg-white"

            border="border-t border-slate-100"

          >

            <SectionTitle

              eyebrow="Por que todo mundo comenta?"

              title="O que faz a Anne & Tom ser diferente?"

              subtitle="Detalhes que você sente no primeiro pedaço: da massa ao atendimento."

            />



            <div className="grid sm:grid-cols-3 gap-5">

              <FeatureCard

                icon="🥖"

                title="Massa levíssima"

                text="Fermentação de 48h, borda crocante e miolo arejado para noites sem peso."

              />

              <FeatureCard

                icon="🧀"

                title="Recheio generoso"

                text="Queijos premium, ingredientes frescos e receitas autorais com carinho de bairro."

              />

              <FeatureCard

                icon="🚙"

                title="Entrega caprichada"

                text="Pedidos embalados com cuidado para chegar quentinhos e prontos para o seu sofá."

              />

            </div>

          </SectionWrapper>



          {/* MAIS VENDIDAS */}

          <BestSellers items={bestSellerItems} loading={loadingMenu} menuError={menuError} />



          {/* PIZZAS VEGGIE / LEVES */}

          <VeggieSection items={veggieItems} loading={loadingMenu} menuError={menuError} />



          {/* COMO FUNCIONA */}

          <HowItWorks />



          {/* AVALIAÇÕES */}

          <SectionWrapper

            id="avaliacoes"

            bg="bg-gradient-to-b from-white to-slate-100"

            border="border-y border-slate-100"

          >

            <SectionTitle

              eyebrow="Avaliações reais"

              title="Quem prova, recomenda"

              subtitle="Comentários de quem já transformou a noite de pizza em noite Anne & Tom."

            />



            <div className="grid md:grid-cols-3 gap-4">

              <Testimonial

                name="Lais Navarro"

                text="Pizza saborosa, chegou quentinha e no tempo combinado. Atendimento super atencioso."

              />

              <Testimonial

                name="Rachelle Françozo"

                text="Virou a pizzaria oficial de casa. Sabores autorais incríveis e massa muito leve."

              />

              <Testimonial

                name="Adriane R. Rosa"

                text="Produtos de ótima qualidade, cobertura caprichada e borda do jeito que eu gosto."

              />

            </div>

          </SectionWrapper>



          {/* BLOCO CONFRATERNIZAÇÃO */}

          <PartyBlock />



          {/* CTA FINAL */}

          <FinalCTA />

        </main>



        <SiteFooter />

      </div>



      {/* ANIMAÇÕES */}

      <style>{styles}</style>

    </div>

  );

};



/* ===========================================================================

   COMPONENTES

   =========================================================================== */



/* HEADER -------------------------------------------------------------- */

/* HEADER -------------------------------------------------------------- */

const Header = ({ scrolled }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customer, isAuthenticated } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onClick = (event) => {
      if (!moreRef.current) return;
      if (!moreRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isHashActive = (hash) =>
    location.pathname === "/" && location.hash === hash;

  const pillClass = (active) =>
    [
      "px-2 py-1 rounded-full transition",
      active
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  const dropdownItemClass = (active) =>
    [
      "block w-full text-left px-3 py-2 rounded-lg transition",
      active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
    ].join(" ");

  return (
    <header
      className={
        "fixed top-0 inset-x-0 z-20 transition-all duration-300 " +
        (scrolled
          ? "bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur"
          : "bg-white/90 border-b border-transparent")
      }
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo + Local */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logopizzaria.png"
            alt="Anne & Tom Pizzaria"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
          />
          <div className="leading-tight">
            <p className="text-[12px] sm:text-[13px] font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Anne &amp; Tom
            </p>
            <p className="hidden sm:block text-[11px] text-slate-500 -mt-0.5">
              Alto de Santana - Sao Paulo
            </p>
          </div>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[12px] font-medium">
          <a href="#destaques" className={pillClass(isHashActive("#destaques"))}>
            Destaques
          </a>
          <a
            href="#mais-pedidas"
            className={pillClass(isHashActive("#mais-pedidas"))}
          >
            Mais vendidas
          </a>
          <a href="#veggie" className={pillClass(isHashActive("#veggie"))}>
            Pizzas veggie
          </a>
          <a
            href="#como-funciona"
            className={pillClass(isHashActive("#como-funciona"))}
          >
            Como funciona
          </a>
          <a
            href="#avaliacoes"
            className={pillClass(isHashActive("#avaliacoes"))}
          >
            Avaliacoes
          </a>

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              className={pillClass(isMoreOpen)}
              onClick={() => setIsMoreOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isMoreOpen}
            >
              Mais
              <span
                className={`ml-1 inline-block transition-transform duration-200 ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
              >
                v
              </span>
            </button>

            <div
              className={`absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg p-2 transition duration-150 ${
                isMoreOpen
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <NavLink
                to="/sobre"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Sobre
              </NavLink>
              <NavLink
                to="/entrega"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Entrega
              </NavLink>
              <NavLink
                to="/promocoes"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Promocoes
              </NavLink>
              <NavLink
                to="/faq"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                FAQ
              </NavLink>
              <NavLink
                to="/contato"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Contato
              </NavLink>
              <NavLink
                to="/cardapio"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Cardapio
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Botoes */}
        <div className="flex items-center gap-2 pt-1 shrink-0">
          {isAuthenticated ? (
            <Link
              to="/me"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xs hover:bg-slate-800 transition"
            >
              <span>👤 {customer.name?.split(" ")[0]}</span>
              <span className="text-amber-400">⭐ {customer.points ?? 0}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-50 text-amber-900 text-[11px] font-extrabold hover:bg-amber-100 transition whitespace-nowrap"
            >
              <span>🔐 Entrar (PIN)</span>
            </button>
          )}

          <Link
            to="/checkout"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-medium hover:bg-slate-50 transition whitespace-nowrap"
          >
            Ver Carrinho
          </Link>

          <Link
            to="/cardapio"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[12px] font-semibold shadow-sm hover:brightness-110 transition whitespace-nowrap pulse-gold-glow"
          >
            Fazer Pedido
          </Link>

          <QuickAuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onSuccess={() => navigate("/me")}
          />
        </div>
      </div>
    </header>
  );
};


/* HERO -------------------------------------------------------------- */

const HERO_STATS = [
  { value: "15k+", label: "Pedidos" },
  { value: "4.9★", label: "Avaliação" },
  { value: "48h", label: "Fermentação" },
  { value: "2019", label: "Desde" },
];

const Hero = ({ imageLoaded, setImageLoaded }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % REAL_PIZZA_IMAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + REAL_PIZZA_IMAGES.length) % REAL_PIZZA_IMAGES.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % REAL_PIZZA_IMAGES.length);
  };

  return (
    <section className="home-hero">
      <div className="home-hero-glow" aria-hidden="true" />
      <div className="home-hero-glow home-hero-glow--2" aria-hidden="true" />
      <div className="home-hero-grid" aria-hidden="true" />

      <div className="home-hero-inner max-w-6xl mx-auto px-4 lg:px-6 pt-3 pb-8 md:pt-5 md:pb-14 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* TEXTO */}
        <div className="space-y-6 lg:space-y-8 animate-fade-up">

          {/* Badge topo */}
          <div className="home-hero-badge">
            <span className="home-hero-badge-dot pulse-emerald-dot" />
            <span>Zona Norte · São Paulo · Aberto agora</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black leading-[1.06] tracking-tight">
            Pizza artesanal com{" "}
            <span className="home-hero-gradient-text">massa leve</span>,{" "}
            muito recheio e clima de bairro.
          </h1>

          <p className="text-base sm:text-lg max-w-xl leading-relaxed" style={{color:'#57524d'}}>
            Forno bem quente, massa descansada por 48h e ingredientes frescos.
            Você monta o pedido pelo cardápio e recebe em casa do jeitinho que combinou.
          </p>

          {/* CTA Buttons */}
          <div className="home-hero-actions flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            <Link
              to="/cardapio"
              className="home-cta-primary pulse-gold-glow inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full text-sm md:text-base font-bold shadow-lg transition"
            >
              <span>Montar meu pedido</span>
              <span aria-hidden="true">🍕</span>
            </Link>

            <a
              href="https://api.whatsapp.com/send?phone=5511932507007&text=Oi%20Anne%20%26%20Tom%2C%20quero%20fazer%20um%20pedido%20%F0%9F%8D%95"
              target="_blank"
              rel="noreferrer"
              className="home-cta-ghost inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full text-sm md:text-base font-semibold transition"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>

          {/* PROVA SOCIAL */}
          <div className="home-hero-social-proof">
            <div className="home-hero-avatars">
              {AVATAR_IMAGES.map((src, i) => (
                <img key={i} src={src} alt="Cliente" className="home-hero-avatar" />
              ))}
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{color:'#1c1917'}}>+15.000 clientes satisfeitos</p>
              <p className="text-[11px] font-medium mt-0.5" style={{color:'#d97706'}}>★★★★★ &nbsp;4.9 de avaliação média</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center shadow-xs">
                <span className="block text-base sm:text-lg font-black text-amber-700">{s.value}</span>
                <span className="block text-[10px] uppercase font-extrabold text-slate-700 tracking-wider mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IMAGEM ROTATIVA (CARD PRINCIPAL) */}
        <div className="relative flex justify-center lg:justify-end">

          {/* Ring orbital decoration */}
          <div className="home-hero-ring" aria-hidden="true" />

          <div
            className="home-hero-image group relative w-full max-w-[420px] aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in-image select-none cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {REAL_PIZZA_IMAGES.map((imgItem, idx) => (
              <img
                key={imgItem.src}
                src={imgItem.src}
                alt={imgItem.alt}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                }`}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                onLoad={() => {
                  if (idx === 0) setImageLoaded(true);
                }}
              />
            ))}
            
            <div className="home-hero-image-overlay z-20 pointer-events-none" aria-hidden="true" />

            {/* Prev / Next controls on hover */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Imagem anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-md"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Próxima imagem"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-md"
            >
              ›
            </button>

            {/* Slider Dots Indicator Bar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
              {REAL_PIZZA_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  aria-label={`Ir para a foto ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "w-6 bg-amber-400" : "w-1.5 bg-white/40 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Floating badge — massa */}
          <div className="home-hero-float-badge home-hero-float-badge--bl">
            <span className="text-lg">🍞</span>
            <div>
              <p className="font-bold text-[12px]" style={{color:'#1c1917'}}>Massa 48h</p>
              <p className="text-[11px]" style={{color:'#78716c'}}>Fermentação lenta</p>
            </div>
          </div>

          {/* Floating badge — rating */}
          <div className="home-hero-float-badge home-hero-float-badge--tr">
            <span className="text-lg">⭐</span>
            <div>
              <p className="font-bold text-[12px]" style={{color:'#1c1917'}}>4.9 / 5.0</p>
              <p className="text-[11px]" style={{color:'#78716c'}}>15k avaliações</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};



/* MAIS VENDIDAS ------------------------------------------------------ */

const BestSellers = ({ items = [], loading = false, menuError = "" }) => {
  const navigate = useNavigate();

  const handleOpen = (item) => {
    const params = new URLSearchParams();
    if (item?.id) {
      params.set("pizzaId", item.id);
    } else if (item?.name) {
      params.set("pizza", item.name);
    }
    const query = params.toString();
    navigate(query ? `/cardapio?${query}` : "/cardapio");
  };

  const fallbackItems = [
    {
      name: "Musa",
      desc: "Mucarela, tomate fresco, manjericao e toque de azeite.",
      badge: "Queridinha da casa",
      priceLabel: "a partir de R$ 60",
      icon: "*",
    },
    {
      name: "Namorados",
      desc: "Dois queijos, calabresa artesanal e cebola na medida.",
      badge: "Perfeita pra dividir",
      priceLabel: "a partir de R$ 69",
      icon: "<3",
    },
    {
      name: "Tres Coracoes",
      desc: "Trio de queijos marcantes com borda bem recheada.",
      badge: "Para amantes de queijo",
      priceLabel: "a partir de R$ 76",
      icon: "*",
    },
    {
      name: "Amor Perfeito",
      desc: "Sabor autoral com toque doce-salgado que surpreende.",
      badge: "Sabor autoral",
      priceLabel: "a partir de R$ 72",
      icon: "*",
    },
  ];

  const normalizedItems = items.length
    ? items.map((item) => {
        const price = item.preco_grande ?? item.preco_broto;
        return {
          id: item.id,
          name: item.nome,
          desc: (item.ingredientes || []).join(", ") || "Sabor da casa.",
          badge: "Mais pedidos",
          priceLabel: price
            ? `a partir de ${formatCurrencyBRL(price)}`
            : "Consulte no cardapio",
          icon: "*",
        };
      })
    : fallbackItems;

  return (
    <SectionWrapper
      id="mais-pedidas"
      bg="bg-slate-50"
      border="border-y border-slate-100"
    >
      <SectionTitle
        eyebrow="Mais vendidas"
        title="Sabores que saem toda noite"
        subtitle="Alguns dos sabores que mais aparecem nos pedidos do dia a dia."
      />

      {loading && (
        <p className="text-xs text-slate-500 text-center">
          Carregando sabores em destaque...
        </p>
      )}

      {menuError && !loading && (
        <p className="text-xs text-amber-700 text-center">{menuError}</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && items.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-5 h-40 animate-pulse"
              />
            ))
          : normalizedItems.map((item, idx) => (
              <BestSellerCard key={item.id || item.name} item={item} onSelect={handleOpen} index={idx} />
            ))}
      </div>

      <div className="flex justify-center pt-6">
        <Link
          to="/cardapio"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-sm md:text-base bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md hover:shadow-lg transition"
        >
          Ver cardápio completo →
        </Link>
      </div>
    </SectionWrapper>
  );
};

const BestSellerCard = ({ item, onSelect, index = 0 }) => {
  const fallbackSrc = REAL_PIZZA_IMAGES[index % REAL_PIZZA_IMAGES.length].src;
  const resolved = resolveProductImage(item);
  const initialImage = item.imgUrl || (resolved && resolved !== "/pizza-placeholder.jpg" ? resolved : fallbackSrc);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="home-bestseller-card group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left flex flex-col hover:border-amber-400 hover:shadow-lg transition duration-300"
    >
      {/* Pizza image */}
      <div className="home-bestseller-img relative overflow-hidden h-44 w-full bg-slate-900">
        <img
          src={initialImage}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackSrc;
          }}
        />
        <div className="home-bestseller-img-overlay" aria-hidden="true" />
        <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
          {item.badge}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1 bg-white">
        <p className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
          {item.name}
        </p>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 flex-1 font-normal">
          {item.desc}
        </p>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
          <p className="text-xs font-black text-amber-700">{item.priceLabel}</p>
          <span className="w-7 h-7 rounded-full bg-amber-50 group-hover:bg-amber-500 text-amber-600 group-hover:text-white flex items-center justify-center text-xs font-bold transition-all duration-200 shadow-xs">
            →
          </span>
        </div>
      </div>
    </button>
  );
};

/* PIZZAS VEGGIE ------------------------------------------------------ */

const VeggieSection = ({ items = [], loading = false, menuError = "" }) => {
  const navigate = useNavigate();

  const handleOpen = (item) => {
    const params = new URLSearchParams();
    if (item?.id) {
      params.set("pizzaId", item.id);
    } else if (item?.name) {
      params.set("pizza", item.name);
    }
    const query = params.toString();
    navigate(query ? `/cardapio?${query}` : "/cardapio");
  };

  const fallbackItems = [
    {
      name: "Veggie Anne",
      icon: "*",
      desc: "Mucarela, brocolis, tomate seco e toque de alho.",
      tag: "Leve e bem temperada",
    },
    {
      name: "Quatro Queijos",
      icon: "*",
      desc: "Mucarela, provolone, parmesao e catupiry.",
      tag: "Classico sem carne",
    },
    {
      name: "Marguerita",
      icon: "*",
      desc: "Mucarela, tomate, manjericao fresco e azeite.",
      tag: "Veggie favorita",
    },
  ];

  const normalizedItems = items.length
    ? items.map((item) => ({
        id: item.id,
        name: item.nome,
        icon: "*",
        desc: (item.ingredientes || []).join(", ") || "Sabor leve e fresco.",
        tag: "Veggie",
      }))
    : fallbackItems;

  return (
    <SectionWrapper id="veggie" bg="bg-emerald-50/40" border="border-y border-emerald-100">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-6">
        <SectionTitle
          eyebrow="Pizzas veggie e sem carne"
          title="Opcoes leves pra quem quer pegar mais leve"
          subtitle="Sabores sem carne, com bastante queijo e legumes bem escolhidos."
        />
        <div className="text-xs md:text-sm text-emerald-800 bg-emerald-100/70 border border-emerald-200 rounded-2xl px-4 py-2 max-w-xs">
          * <span className="font-semibold">Todas essas pizzas sao preparadas sem carne,</span> ideais pra quem prefere algo mais leve ou vegetariano.
        </div>
      </div>

      {loading && (
        <p className="text-xs text-emerald-700 text-center">
          Carregando opcoes veggie...
        </p>
      )}

      {menuError && !loading && (
        <p className="text-xs text-amber-700 text-center">{menuError}</p>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {loading && items.length === 0
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-4 py-5 h-36 animate-pulse"
              />
            ))
          : normalizedItems.map((item) => (
              <button
                key={item.id || item.name}
                type="button"
                onClick={() => handleOpen(item)}
                className="home-card bg-white rounded-2xl border border-emerald-100 shadow-sm px-4 py-5 flex flex-col gap-2 hover:shadow-md hover:-translate-y-[2px] transition transform text-left"
              >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-emerald-600">{item.icon}</span>
              <p className="text-sm md:text-base font-semibold text-slate-900">
                {item.name}
              </p>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {item.desc}
            </p>
            <span className="mt-1 text-[11px] text-emerald-700 font-medium">
              {item.tag}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-5">
        <Link
          to="/cardapio"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-emerald-300 bg-white text-sm md:text-base text-emerald-800 hover:bg-emerald-50 transition"
        >
          Ver apenas opcoes veggie no cardapio
        </Link>
      </div>
    </SectionWrapper>
  );
};

/* COMO FUNCIONA ------------------------------------------------------ */

const HowItWorks = () => (

  <SectionWrapper

    id="como-funciona"

    bg="bg-white"

    border="border-y border-slate-100"

  >

    <SectionTitle

      eyebrow="Sem complicação"

      title="Como funciona o pedido"

      subtitle="Você monta tudo pelo cardápio interno e finaliza em poucos toques."

    />



    <div className="grid md:grid-cols-3 gap-5">

      <StepCard

        index="1"

        title="Escolha os sabores"

        text="Abra o cardápio interno, veja os detalhes de cada sabor e escolha o tamanho ideal."

      />

      <StepCard

        index="2"

        title="Monte o carrinho"

        text="Adicione pizzas, bebidas e complementos. Tudo já sai calculado bonitinho."

      />

      <StepCard

        index="3"

        title="Finalize e envie"

        text="Revise o resumo no checkout e envie direto para o WhatsApp da pizzaria."

      />

    </div>

  </SectionWrapper>

);



const StepCard = ({ index, title, text }) => (

  <div className="home-card bg-slate-50 rounded-2xl border border-slate-100 px-5 py-6 flex flex-col gap-2">

    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500 text-[12px] font-bold text-white">

      {index}

    </span>

    <p className="text-sm md:text-base font-semibold text-slate-800">

      {title}

    </p>

    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">

      {text}

    </p>

  </div>

);



/* PARTY / CONFRATERNIZAÇÃO ------------------------------------------ */

const PartyBlock = () => (

  <section className="bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 border-y border-amber-100">

    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-10 lg:py-14 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">

      <div className="space-y-3">

        <p className="uppercase text-[11px] tracking-[0.2em] text-rose-600">

          CONFRATERNIZAÇÃO • REUNIÃO • ANIVERSÁRIO

        </p>

        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">

          Vai fazer encontro com a galera? Deixa a pizza por nossa conta.

        </h2>

        <p className="text-sm md:text-base text-slate-600 max-w-xl">

          Monte um pedido com vários sabores, combos e bebidas. A gente te ajuda

          a calcular quantas pizzas precisa, monta o resumo e combina tudo pelo

          WhatsApp.

        </p>



        <ul className="text-xs md:text-sm text-slate-600 space-y-1 pt-1">

          <li>• Sugestão de quantidade por número de pessoas</li>

          <li>• Opções mais em conta para grupos grandes</li>

          <li>• Horário combinado pra chegar na hora certa</li>

        </ul>



        <div className="flex flex-wrap gap-3 pt-3">

          <a

            href="https://api.whatsapp.com/send?phone=5511932507007&text=Oi%20Anne%20%26%20Tom%2C%20quero%20montar%20um%20pedido%20para%20confraterniza%C3%A7%C3%A3o%20%F0%9F%8E%89"

            target="_blank"

            rel="noreferrer"

            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-500 text-white text-sm md:text-base font-semibold shadow-sm hover:bg-emerald-600 transition"

          >

            Falar sobre pedido grande 🎉

          </a>

          <Link

            to="/cardapio"

            className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-slate-200 bg-white text-sm md:text-base text-slate-800 hover:bg-slate-50 transition"

          >

            Ver opções de sabores

          </Link>

        </div>

      </div>



      <div className="hidden lg:flex justify-end">

        <div className="w-full max-w-xs rounded-3xl bg-white/80 border border-slate-100 shadow-sm p-4 space-y-2 text-xs md:text-sm text-slate-600 backdrop-blur">

          <p className="text-[12px] font-semibold text-slate-800">

            Exemplo de pedido para 12 pessoas:

          </p>

          <ul className="space-y-1">

            <li>• 4 pizzas grandes de sabores mistos</li>

            <li>• 2 pizzas doces</li>

            <li>• Refrigerantes e água</li>

          </ul>

          <p className="text-[11px] text-slate-500 mt-1">

            A gente te ajuda a ajustar os sabores certinho pro seu grupo.

          </p>

        </div>

      </div>

    </div>

  </section>

);



/* COMPONENTES PEQUENOS ---------------------------------------------- */

const SectionWrapper = ({ children, id, bg, border }) => (

  <section id={id} className={`home-section ${bg} ${border}`}>

    <div className="home-section-inner max-w-6xl mx-auto px-4 lg:px-6 py-12 lg:py-16 space-y-6">

      {children}

    </div>

  </section>

);



const SectionTitle = ({ eyebrow, title, subtitle }) => (
  <div className="home-section-title text-center space-y-2 max-w-3xl mx-auto">
    {eyebrow && (
      <p className="uppercase text-[11px] font-black tracking-[0.25em] text-amber-600">
        {eyebrow}
      </p>
    )}
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
      {title}
    </h2>
    {subtitle && (
      <p className="text-sm md:text-base text-slate-600 font-medium">{subtitle}</p>
    )}
  </div>
);

const FeatureCard = ({ icon, title, text }) => (
  <div className="home-feature-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition text-center flex flex-col items-center gap-2">
    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-1">
      {icon}
    </div>
    <p className="text-base font-bold text-slate-900">{title}</p>
    <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">{text}</p>
  </div>
);



const Testimonial = ({ name, text }) => (

  <div className="home-card bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-5 flex flex-col gap-2">

    <p className="text-[12px] text-amber-500">★★★★★</p>

    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">

      “{text}”

    </p>

    <p className="text-xs md:text-sm font-semibold text-slate-800 mt-1">

      {name}

    </p>

  </div>

);



/* CTA FINAL ---------------------------------------------------------- */

const FinalCTA = () => (
  <section className="home-cta bg-slate-900 text-white my-8 rounded-3xl overflow-hidden max-w-6xl mx-auto border border-slate-800 shadow-2xl">
    <div className="home-cta-inner px-6 py-14 lg:py-20 text-center space-y-6">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight" style={{ color: '#fef3c7' }}>
        Bora pedir uma Anne &amp; Tom hoje?
      </h2>

      <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
        Monte seu pedido pelo cardápio, revise tudo no checkout e acompanhe a entrega em tempo real. Noite de pizza perfeita!
      </p>

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link
          to="/cardapio"
          className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl hover:scale-105 transition transform"
        >
          Montar meu pedido 🍕
        </Link>

        <Link
          to="/checkout"
          className="px-7 py-4 rounded-full border-2 border-slate-700 bg-slate-800/90 text-white hover:bg-slate-700 font-bold text-base shadow-lg transition"
        >
          Ver resumo do carrinho 🧾
        </Link>
      </div>
    </div>
  </section>
);



const APP_DOWNLOAD_WHATSAPP =
  "https://api.whatsapp.com/send?phone=5511932507007&text=Quero%20baixar%20o%20app%20Anne%20%26%20Tom";

const DownloadAppSection = () => (
  <section className="home-app">
    <div className="home-app-inner max-w-6xl mx-auto px-4 lg:px-6">
      <div className="home-app-copy">
        <p className="home-app-eyebrow">APP OFICIAL</p>
        <h3 className="home-app-title">Baixe o app e peca mais rapido</h3>
        <p className="home-app-text">
          Receba avisos, salve favoritos e abra o cardapio com um toque. O link
          chega no WhatsApp e a instalacao e rapida.
        </p>
        <div className="home-app-actions">
          <a
            href={`${APP_DOWNLOAD_WHATSAPP}&text=Quero%20o%20link%20do%20app%20Android`}
            target="_blank"
            rel="noreferrer"
            className="home-app-store"
          >
            Android (beta)
          </a>
          <a
            href={`${APP_DOWNLOAD_WHATSAPP}&text=Quero%20o%20link%20do%20app%20iOS`}
            target="_blank"
            rel="noreferrer"
            className="home-app-store home-app-store--ghost"
          >
            iOS (em breve)
          </a>
        </div>
        <p className="home-app-note">Receba o link no WhatsApp em segundos.</p>
      </div>
      <div className="home-app-cards">
        <div className="home-app-phone">
          <div className="home-app-phone-notch" />
          <p className="home-app-phone-title">Anne & Tom App</p>
          <ul className="home-app-phone-list">
            <li>Cardapio salvo</li>
            <li>Repetir pedido</li>
            <li>Tempo de entrega</li>
          </ul>
          <span className="home-app-phone-tag">Instalacao rapida</span>
        </div>
        <div className="home-app-benefits">
          <p className="home-app-benefits-title">No app voce tem</p>
          <ul className="home-app-benefits-list">
            <li>Checkout mais rapido</li>
            <li>Favoritos sempre prontos</li>
            <li>Atalhos para WhatsApp</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);



/* ===========================================================================

   ANIMAÇÕES

   =========================================================================== */



const styles = `
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Manrope:wght@400;600;700&display=swap");

  .home-anne-tom {
    --home-bg: linear-gradient(160deg, #faf9f6 0%, #ffffff 50%, #f4f3ef 100%);
    --home-ink: #1c1917;
    --home-muted: #78716c;
    --home-accent: #f59e0b;
    --home-accent-2: #f97316;
    --home-cream: #faf9f6;
    --home-card: #ffffff;
    --home-border: rgba(0, 0, 0, 0.07);
    --home-shadow: 0 20px 45px -30px rgba(0, 0, 0, 0.08);
    background: var(--home-bg);
    color: var(--home-ink);
    font-family: "Manrope", sans-serif;
  }

  .home-anne-tom h1,
  .home-anne-tom h2,
  .home-anne-tom h3 {
    font-family: "Fraunces", serif;
    letter-spacing: -0.025em;
    color: inherit;
  }

  .home-cta h2,
  .home-cta-inner h2 {
    color: #fef3c7 !important;
  }


  .home-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(160deg, #ffffff 0%, #faf9f6 60%, #f4f3ef 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .home-hero-inner {
    position: relative;
    z-index: 1;
  }

  .home-hero-glow {
    position: absolute;
    top: -20%;
    left: 15%;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.18), transparent 65%);
    pointer-events: none;
    animation: heroGlowPulse 6s ease-in-out infinite;
  }

  .home-hero-glow--2 {
    top: 30%;
    left: 55%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.12), transparent 65%);
    animation-delay: 3s;
  }

  @keyframes heroGlowPulse {
    0%, 100% { opacity: 0.7; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.08); }
  }

  .home-hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  /* Hero Badge */
  .home-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(245, 158, 11, 0.3);
    background: rgba(245, 158, 11, 0.08);
    color: #f59e0b;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .home-hero-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
    animation: blink 2s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .home-hero-gradient-text {
    background: linear-gradient(90deg, #f59e0b, #f97316, #ef4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .home-cta-primary {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 60%, #ef4444 100%);
    color: #0f0e0c;
    font-weight: 800;
    box-shadow: 0 0 40px -10px rgba(245, 158, 11, 0.5), 0 20px 40px -25px rgba(15, 10, 5, 0.8);
    border: 1px solid rgba(255, 220, 100, 0.3);
  }
  .home-cta-primary:hover {
    filter: brightness(1.08);
    transform: translateY(-2px);
    box-shadow: 0 0 55px -8px rgba(245, 158, 11, 0.65), 0 24px 44px -22px rgba(15, 10, 5, 0.9);
  }

  .home-cta-ghost {
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.15);
    color: #0f172a;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  }
  .home-cta-ghost:hover {
    background: #f8fafc;
    border-color: #f59e0b;
    color: #d97706;
    transform: translateY(-2px);
  }

  .home-hero-social-proof {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.06);
    width: fit-content;
  }

  .home-hero-avatars { display: flex; }

  .home-hero-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    object-fit: cover;
    margin-left: -8px;
  }

  .home-hero-avatar:first-child { margin-left: 0; }

  .home-hero-stats-strip {
    display: flex;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 1rem;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.06);
    width: fit-content;
  }

  .home-hero-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.6rem 1.2rem;
    gap: 0.15rem;
    border-right: 1px solid rgba(0, 0, 0, 0.06);
  }

  .home-hero-stat:last-child { border-right: none; }

  .home-hero-stat-val {
    font-size: 0.95rem;
    font-weight: 800;
    color: #d97706;
    font-family: "Fraunces", serif;
  }

  .home-hero-stat-lbl {
    font-size: 0.6rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .home-hero-image {
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(245, 158, 11, 0.15);
  }

  .home-hero-image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, transparent 50%, rgba(0,0,0,0.2) 100%);
    pointer-events: none;
  }

  .home-hero-ring {
    position: absolute;
    inset: -24px;
    border-radius: 50%;
    border: 1px dashed rgba(245, 158, 11, 0.2);
    animation: ringRotate 20s linear infinite;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes ringRotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .home-hero-float-badge {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.85rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(12px);
    box-shadow: 0 10px 25px -10px rgba(0,0,0,0.1);
    z-index: 10;
    animation: floatBob 4s ease-in-out infinite;
  }

  .home-hero-float-badge--bl { bottom: -12px; left: -16px; animation-delay: 0s; }
  .home-hero-float-badge--tr { top: -12px; right: -16px; animation-delay: 2s; }

  @keyframes floatBob {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }

  .home-section {
    position: relative;
    overflow: hidden;
    background: transparent;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }

  .home-section::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(600px 300px at 80% 0%, rgba(245, 158, 11, 0.05), transparent 65%);
    pointer-events: none;
  }

  .home-section-inner {
    position: relative;
    z-index: 1;
  }

  .home-section-title::after {
    content: "";
    display: block;
    width: 56px;
    height: 3px;
    margin: 14px auto 0;
    border-radius: 999px;
    background: linear-gradient(90deg, #f59e0b, #f97316);
  }

  .home-eyebrow {
    letter-spacing: 0.3em;
    color: #f59e0b;
    font-size: 0.65rem;
    font-weight: 700;
  }

  /* BestSeller card */
  .home-bestseller-card {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 1.25rem;
    overflow: hidden;
    text-align: left;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
  }

  .home-bestseller-card:hover {
    transform: translateY(-4px);
    border-color: rgba(245, 158, 11, 0.4);
    box-shadow: 0 20px 40px -20px rgba(245, 158, 11, 0.15);
  }

  .home-bestseller-img {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: #1c1917;
  }

  .home-bestseller-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(15,12,10,0.7) 0%, transparent 60%);
    pointer-events: none;
  }

  .home-bestseller-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: rgba(245, 158, 11, 0.9);
    color: #0f0e0c;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Feature card */
  .home-feature-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    padding: 1.75rem 1.25rem;
    border-radius: 1.25rem;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .home-feature-card:hover {
    transform: translateY(-3px);
    border-color: rgba(245, 158, 11, 0.3);
    box-shadow: 0 15px 35px -15px rgba(0, 0, 0, 0.08);
  }

  .home-feature-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  /* Testimonial card */
  .home-testimonial-card {
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    border-radius: 1.25rem;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .home-testimonial-card:hover {
    transform: translateY(-2px);
    border-color: rgba(245, 158, 11, 0.3);
    box-shadow: 0 15px 35px -15px rgba(0, 0, 0, 0.08);
  }

  .home-testimonial-stars {
    color: #f59e0b;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  /* Premium Light accents for home sections */
  .home-anne-tom .bg-amber-50 { background-color: rgba(245, 158, 11, 0.08) !important; }
  .home-anne-tom .text-amber-700 { color: #b45309 !important; }
  .home-anne-tom .text-emerald-700 { color: #047857 !important; }
  .home-anne-tom .border-emerald-100 { border-color: rgba(16, 185, 129, 0.15) !important; }
  .home-anne-tom .border-emerald-200 { border-color: rgba(16, 185, 129, 0.2) !important; }
  .home-anne-tom .bg-emerald-100\\/70 { background-color: rgba(209, 250, 229, 0.7) !important; }
  .home-anne-tom .bg-emerald-50\\/40 { background-color: rgba(240, 253, 250, 0.4) !important; }
  .home-anne-tom .border-emerald-300 { border-color: rgba(16, 185, 129, 0.25) !important; }
  .home-anne-tom .text-emerald-800 { color: #065f46 !important; }
  .home-anne-tom .bg-emerald-50 { background-color: rgba(240, 253, 250, 1) !important; }
  .home-anne-tom .border-amber-100 { border-color: rgba(245, 158, 11, 0.15) !important; }

  .home-anne-tom .home-card {
    background: #ffffff !important;
    border-color: rgba(0,0,0,0.06) !important;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.04);
  }

  .home-anne-tom .home-card:hover {
    border-color: rgba(245, 158, 11, 0.35) !important;
    box-shadow: 0 20px 40px -20px rgba(245, 158, 11, 0.15) !important;
  }



  .animate-page-in {
    animation: pageIn 0.35s ease-out;
  }

  .animate-fade-up {
    animation: fadeUp 0.45s ease-out;
  }

  .animate-fade-in-image {
    animation: fadeInImage 0.6s ease-out;
  }

  @keyframes pageIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInImage {
    from { opacity: 0; transform: scale(1.02); }
    to   { opacity: 1; transform: scale(1); }
  }

  

  .home-hero-actions { gap: 0.75rem; }

  .home-app {
    position: relative;
    overflow: hidden;
    padding: 2.5rem 0;
    background: #faf9f6;
    border-top: 1px solid rgba(0,0,0,0.05);
    color: #1c1917;
  }

  .home-app::before {
    content: "";
    position: absolute;
    inset: -50% 30% auto;
    height: 220%;
    background: radial-gradient(circle at 40% 30%, rgba(245, 158, 11, 0.08), transparent 68%);
    pointer-events: none;
  }

  .home-app-inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2.5rem;
    align-items: center;
  }

  .home-app-copy {
    display: grid;
    gap: 0.75rem;
  }

  .home-app-eyebrow {
    font-size: 0.65rem;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #b45309;
    font-weight: 700;
  }

  .home-app-title {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #0f172a;
  }

  .home-app-text {
    font-size: 0.95rem;
    color: #475569;
  }

  .home-app-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .home-app-store {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.85rem 1rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: #1f2937;
    font-weight: 700;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 18px 30px -20px rgba(15, 23, 42, 0.35);
  }

  .home-app-store:hover {
    transform: translateY(-1px);
  }

  .home-app-store--ghost {
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.45);
    color: #0f172a;
    box-shadow: none;
  }

  .home-app-note {
    font-size: 0.75rem;
    color: #64748b;
  }

  .home-app-cards {
    display: grid;
    gap: 1rem;
  }

  .home-app-phone {
    position: relative;
    padding: 1.25rem;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: #ffffff;
    box-shadow: 0 24px 40px -32px rgba(15, 23, 42, 0.35);
    color: #0f172a;
  }

  .home-app-phone-notch {
    width: 64px;
    height: 6px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.15);
    margin: 0 auto 0.9rem;
  }

  .home-app-phone-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
  }

  .home-app-phone-list {
    margin-top: 0.75rem;
    display: grid;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: #475569;
  }

  .home-app-phone-tag {
    display: inline-flex;
    margin-top: 0.75rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: #92400e;
    border: 1px solid rgba(245, 158, 11, 0.35);
    background: rgba(245, 158, 11, 0.18);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
  }

  .home-app-benefits {
    border-radius: 20px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: #fff9f1;
    padding: 1rem 1.25rem;
    color: #0f172a;
  }

  .home-app-benefits-title {
    font-size: 0.85rem;
    font-weight: 700;
  }

  .home-app-benefits-list {
    margin-top: 0.6rem;
    display: grid;
    gap: 0.35rem;
    font-size: 0.78rem;
    color: #475569;
  }

  @media (max-width: 900px) {
    .home-app-inner {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .home-hero-inner {
      padding-top: 2.5rem;
      padding-bottom: 3rem;
      gap: 1.5rem;
    }

    .home-hero h1 {
      font-size: 2.35rem;
      line-height: 1.08;
    }

    .home-hero p {
      font-size: 0.98rem;
    }

    .home-hero-actions a {
      width: 100%;
    }

    .home-hero-highlights {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.6rem;
    }

    .home-hero-proof-card {
      text-align: left;
      padding: 1rem 1.2rem;
    }

    .home-hero-proof-badge {
      right: 12px;
    }

    .home-app-actions {
      grid-template-columns: 1fr;
    }
  }


  @media (prefers-reduced-motion: reduce) {
    .animate-page-in,
    .animate-fade-up,
    .animate-fade-in-image {
      animation-duration: 0.01s !important;
      animation-iteration-count: 1 !important;
      animation-fill-mode: both !important;
    }
  }
`;



export default HomeAnneTom;
