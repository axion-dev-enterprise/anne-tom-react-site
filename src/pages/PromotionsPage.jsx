// src/pages/PromotionsPage.jsx
// Promoções semanais Anne & Tom — Brand Kit 2026
// Design white puro + animações suaves + bordas coloridas com paleta

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import SEOHead from "../components/seo/SEOHead";

/* ==========================================================================
   HOOK: FADE IN ON SCROLL (IntersectionObserver)
   ========================================================================== */
const useFadeIn = (threshold = 0.12) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
};

const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ==========================================================================
   DADOS DAS PROMOÇÕES — Conforme Brand Kit Anne & Tom
   Paleta: Bordô #8F2D1F | Dourado #D79A3B | Verde #557A3E | Marrom #48251B
   ========================================================================== */
const PROMOCOES = [
  {
    dia: "Terça & Quarta",
    tag: "TERÇA E QUA",
    headline: "Big Esfiha Prestígio Grátis",
    mecanica: "Na compra de 1 pizza grande + 1 refri",
    descricao:
      "Leve sua pizza favorita e ganhe uma Big Esfiha Prestígio (chocolate com coco) — a sobremesa que todo mundo ama.",
    img: "/promos/01-terca-quarta-pizza-esfiha.jpg",
    icone: "🍕",
    cta: "PEDIR AGORA",
    // Bordô
    color: "#8F2D1F",
    borderColor: "border-l-[#8F2D1F]",
    badgeBg: "bg-[#8F2D1F]",
    badgeText: "text-white",
    btnBg: "bg-[#8F2D1F] hover:bg-[#7a271a]",
    tagBg: "bg-[#8F2D1F]/10 text-[#8F2D1F]",
  },
  {
    dia: "Quinta",
    tag: "QUINTA",
    headline: "Borda de Requeijão Grátis",
    mecanica: "Válida para qualquer pizza grande",
    descricao:
      "Sua pizza favorita com borda de catupiry cremoso e generoso — sem pagar nada a mais por isso.",
    img: "/promos/02-quinta-borda-requeijao.jpg",
    icone: "🧀",
    cta: "QUERO O MEU",
    // Dourado
    color: "#D79A3B",
    borderColor: "border-l-[#D79A3B]",
    badgeBg: "bg-[#D79A3B]",
    badgeText: "text-white",
    btnBg: "bg-[#D79A3B] hover:bg-[#c48a2e]",
    tagBg: "bg-[#D79A3B]/10 text-[#D79A3B]",
  },
  {
    dia: "Sexta & Sábado",
    tag: "SEXTA E SÁB",
    headline: "Refri 2L Grátis",
    mecanica: "Na compra de 2 pizzas grandes",
    descricao:
      "Duas pizzas do seu jeito + refrigerante 2L para acompanhar. O combo perfeito para o fim de semana.",
    img: "/promos/03-sexta-sabado-2pizzas-refri.jpg",
    icone: "🍺",
    cta: "APROVEITAR",
    // Verde
    color: "#557A3E",
    borderColor: "border-l-[#557A3E]",
    badgeBg: "bg-[#557A3E]",
    badgeText: "text-white",
    btnBg: "bg-[#557A3E] hover:bg-[#4a6d34]",
    tagBg: "bg-[#557A3E]/10 text-[#557A3E]",
  },
  {
    dia: "Domingo",
    tag: "DOMINGO",
    headline: "Escolha Seu Presente",
    mecanica: "Big Esfiha Prestígio OU Borda de Requeijão",
    descricao:
      "Domingo você escolhe: uma Big Esfiha Prestígio docinha ou borda de requeijão cremosa. Os dois são por nossa conta.",
    img: "/promos/04-domingo-esfiha-borda.jpg",
    icone: "🎁",
    cta: "FAZER MEU PEDIDO",
    // Bordô
    color: "#8F2D1F",
    borderColor: "border-l-[#8F2D1F]",
    badgeBg: "bg-[#8F2D1F]",
    badgeText: "text-white",
    btnBg: "bg-[#8F2D1F] hover:bg-[#7a271a]",
    tagBg: "bg-[#8F2D1F]/10 text-[#8F2D1F]",
  },
];

/* ==========================================================================
   DiaCirculo — bolinhas do calendário visual (12px stagged)
   ========================================================================== */
const DIAS_CALENDARIO = [
  { dia: "Ter", cor: "bg-[#8F2D1F]" },
  { dia: "Qua", cor: "bg-[#8F2D1F]" },
  { dia: "Qui", cor: "bg-[#D79A3B]" },
  { dia: "Sex", cor: "bg-[#557A3E]" },
  { dia: "Sáb", cor: "bg-[#557A3E]" },
  { dia: "Dom", cor: "bg-[#8F2D1F]" },
];

/* ==========================================================================
   INFOS — boxes decorativos
   ========================================================================== */
const INFO_BOXES = [
  { icone: "🍕", titulo: "Pizzas Grandes", texto: "Massa fermentada por 48h, borda crocante e recheio generoso", cor: "#8F2D1F", delay: 0 },
  { icone: "🧀", titulo: "Borda de Requeijão", texto: "Catupiry cremoso e generoso na borda da sua pizza", cor: "#D79A3B", delay: 100 },
  { icone: "🥟", titulo: "Big Esfiha", texto: "Sobremesa recheada com chocolate e coco — imperdível", cor: "#557A3E", delay: 200 },
];

/* ==========================================================================
   SETA SVG reutilizável
   ========================================================================== */
const ArrowRight = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

/* ==========================================================================
   WhatsAppIcon SVG
   ========================================================================== */
const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ==========================================================================
   PROMOCARD
   Card branco com borda lateral colorida de 4px, imagem, badge, conteúdo
   ========================================================================== */
const PromoCard = ({ promo, index }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const handleLoad = useCallback(() => setImgLoaded(true), []);

  return (
    <FadeIn delay={100 + index * 120}>
      <article
        className={`group bg-white rounded-2xl border border-gray-100 border-l-4 ${promo.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1`}
      >
        {/* Imagem */}
        <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden bg-gray-50">
          <img
            src={promo.img}
            alt={`Promoção ${promo.dia}: ${promo.headline}`}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
            } group-hover:scale-105`}
            onLoad={handleLoad}
            loading={index < 2 ? "eager" : "lazy"}
          />
          {/* Gradiente sutil sobre imagem — só overlay claro */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />

          {/* Badge do dia — bold, upper, com a cor da paleta */}
          <span
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${promo.badgeBg} ${promo.badgeText}`}
          >
            {promo.tag}
          </span>

          {/* Ícone decorativo */}
          <span className="absolute bottom-3 right-3 text-2xl sm:text-3xl opacity-70 drop-shadow-sm">
            {promo.icone}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col flex-1 p-5 sm:p-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#48251B] leading-tight tracking-tight">
            {promo.headline}
          </h2>

          {/* Tag da mecânica */}
          <span
            className={`self-start px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${promo.tagBg}`}
          >
            {promo.mecanica}
          </span>

          <p className="text-sm text-gray-500 leading-relaxed flex-1">
            {promo.descricao}
          </p>

          {/* CTA */}
          <div className="pt-3 border-t border-gray-100">
            <Link
              to="/cardapio"
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${promo.btnBg}`}
            >
              {promo.cta}
              <ArrowRight />
            </Link>
          </div>
        </div>
      </article>
    </FadeIn>
  );
};

/* ==========================================================================
   PROMOTIONS PAGE
   ========================================================================== */
const PromotionsPage = () => (
  <div className="min-h-screen bg-white antialiased">
    <SEOHead
      title="Promoções - Pizzaria Anne & Tom"
      description="Confira as promoções especiais da semana: Big Esfiha Prestígio Grátis, Borda de Requeijão Grátis, Refri 2L Grátis e muito mais. Peça já!"
      keywords={[
        "promoção pizza",
        "pizza desconto",
        "combo pizza e refrigerante",
        "esfiha grátis",
        "borda de requeijão grátis",
        "pizza zona norte",
      ]}
    />

    <SiteHeader />

    <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10 sm:py-14 lg:py-16 space-y-10 sm:space-y-14">
      {/* ===== HEADER ===== */}
      <FadeIn>
        <section className="text-center max-w-2xl mx-auto space-y-4">
          {/* Tag decorativa com dot pulsante dourado */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#8F2D1F]/5 border border-[#8F2D1F]/10 text-[#8F2D1F] text-[11px] font-bold uppercase tracking-[0.15em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D79A3B] animate-pulse" />
            Promoções da Semana
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#48251B] leading-tight tracking-tight">
            Todo dia tem um{" "}
            <span className="text-[#D79A3B]">benefício</span>{" "}
            diferente
          </h1>

          <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
            Cada dia da semana uma promoção especial preparada para sua
            fome. Sempre com o sabor artesanal que só a Anne & Tom tem.
          </p>

          {/* Calendário visual — bolinhas com as cores da paleta */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {DIAS_CALENDARIO.map((item, i) => (
              <span
                key={item.dia}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm transition-all duration-300 hover:scale-110 ${item.cor}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {item.dia}
              </span>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ===== GRID DE PROMOÇÕES ===== */}
      <section className="grid sm:grid-cols-2 gap-5 lg:gap-6">
        {PROMOCOES.map((promo, i) => (
          <PromoCard key={promo.dia} promo={promo} index={i} />
        ))}
      </section>

      {/* ===== INFO BOXES — borda superior colorida ===== */}
      <section className="grid sm:grid-cols-3 gap-4 lg:gap-5">
        {INFO_BOXES.map((item) => (
          <FadeIn key={item.titulo} delay={item.delay}>
            <div
              className="bg-white rounded-xl border border-gray-100 border-t-4 p-4 sm:p-5 text-center space-y-2 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              style={{ borderTopColor: item.cor }}
            >
              <span className="text-2xl block">{item.icone}</span>
              <p className="text-[13px] font-bold text-[#48251B]">{item.titulo}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">{item.texto}</p>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* ===== CTA WHATSAPP ===== */}
      <FadeIn delay={200}>
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF9F0] to-white border border-amber-100 shadow-sm">
          {/* Bolhas decorativas de fundo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D79A3B]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#557A3E]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="space-y-1.5">
              <p className="text-lg font-bold text-[#48251B]">
                🔔 Quer receber as promoções no WhatsApp?
              </p>
              <p className="text-sm text-gray-400">
                Enviamos as ofertas do dia direto no seu celular. Sem spam,
                só pizza.
              </p>
            </div>

            <a
              href="https://wa.me/5511932507007?text=Quero%20receber%20as%20promo%C3%A7%C3%B5es"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#557A3E] hover:bg-[#4a6d34] text-white text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0"
            >
              <WhatsAppIcon />
              QUERO RECEBER
            </a>
          </div>
        </section>
      </FadeIn>
    </main>

    <SiteFooter />
  </div>
);

export default PromotionsPage;