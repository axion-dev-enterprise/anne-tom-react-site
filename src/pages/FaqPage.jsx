// src/pages/FaqPage.jsx
import React from "react";
import SiteLayout from "../components/layout/SiteLayout";

const faqs = [
  {
    q: "Como funciona o meio a meio?",
    a: "Voce pode combinar dois sabores e o preco sera o maior entre eles.",
  },
  {
    q: "Quais tamanhos existem?",
    a: "Broto e grande. Algumas opcoes tem tamanho unico.",
  },
  {
    q: "Posso retirar no balcao?",
    a: "Sim, fale com a equipe para combinar retirada e horario.",
  },
  {
    q: "Quais formas de pagamento?",
    a: "Aceitamos dinheiro, cartao e Pix. No checkout voce escolhe.",
  },
];

const FaqPage = () => (
  <SiteLayout
    title="Perguntas frequentes"
    subtitle="Respostas rapidas para as duvidas mais comuns."
  >
    <section className="space-y-3">
      {faqs.map((item) => (
        <details
          key={item.q}
          className="bg-white border border-slate-200 rounded-2xl p-4"
        >
          <summary className="text-sm font-semibold text-slate-800 cursor-pointer">
            {item.q}
          </summary>
          <p className="text-xs text-slate-600 mt-2">{item.a}</p>
        </details>
      ))}
    </section>
  </SiteLayout>
);

export default FaqPage;
