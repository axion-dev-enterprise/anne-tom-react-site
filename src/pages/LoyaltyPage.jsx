// src/pages/LoyaltyPage.jsx

import React from "react";

import SiteLayout from "../components/layout/SiteLayout";



const steps = [

  {

    title: "Peca pelo cardapio",

    text: "A cada pedido, voce acumula pontos com seu numero de WhatsApp.",

  },

  {

    title: "Acumule vantagens",

    text: "Troque pontos por descontos, borda recheada ou sobremesas.",

  },

  {

    title: "Resgate quando quiser",

    text: "Avise a equipe na hora do pedido e use seus beneficios.",

  },

];



const LoyaltyPage = () => (

  <SiteLayout

    title="Programa de fidelidade"

    subtitle="Pontos por pedido e beneficios para quem pede sempre."

  >

    <section className="grid md:grid-cols-3 gap-4">

      {steps.map((step, idx) => (

        <div

          key={step.title}

          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2"

        >

          <span className="text-[11px] text-amber-600 font-semibold">

            Passo {idx + 1}

          </span>

          <p className="text-sm font-semibold text-slate-800">

            {step.title}

          </p>

          <p className="text-xs text-slate-600">{step.text}</p>

        </div>

      ))}

    </section>



    <section className="bg-slate-900 rounded-2xl p-6 text-white">

      <p className="text-sm font-semibold">Quer participar?</p>

      <p className="text-xs text-slate-300">

        Fale com a equipe e ative o fidelidade no seu numero.

      </p>

    </section>

  </SiteLayout>

);



export default LoyaltyPage;

