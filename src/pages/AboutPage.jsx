// src/pages/AboutPage.jsx

import React from "react";

import SiteLayout from "../components/layout/SiteLayout";

import { Link } from "react-router-dom";



const highlights = [

  {

    title: "Massa leve e longa fermentacao",

    text: "Massa descansada por 48h para ficar leve, macia por dentro e crocante por fora.",

  },

  {

    title: "Ingredientes bem selecionados",

    text: "Queijos, legumes e carnes escolhidos para garantir sabor e consistencia.",

  },

  {

    title: "Bairro, gente e historia",

    text: "Atendimento de pizzaria de bairro, com foco em proximidade e cuidado.",

  },

];



const timeline = [

  {

    year: "2019",

    label: "Primeira fornada",

    text: "A Anne & Tom nasce com foco em pizza artesanal e clima de bairro.",

  },

  {

    year: "2021",

    label: "Cardapio autoral",

    text: "Novos sabores, bordas recheadas e combinacoes exclusivas.",

  },

  {

    year: "2024",

    label: "Pedidos digitais",

    text: "Cardapio interno com checkout, descontos e acompanhamento do pedido.",

  },

];



const AboutPage = () => (

  <SiteLayout

    title="Sobre a Anne & Tom"

    subtitle="Pizzaria artesanal com alma de bairro. A ideia e simples: massa leve, recheio generoso e atendimento direto."

  >

    <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6">

      <div className="space-y-4">

        <h2 className="text-xl font-semibold">Nossa historia</h2>

        <p className="text-sm text-slate-600">

          A Anne & Tom nasceu da paixao por pizza artesanal e do desejo de criar

          um lugar proximo, com sabores bem feitos e entrega caprichada. O foco

          sempre foi a mesma: massa leve, ingredientes de qualidade e uma

          experiencia simples de pedir e comer bem.

        </p>

        <p className="text-sm text-slate-600">

          Hoje a pizzaria segue com o mesmo cuidado, mantendo o clima de bairro

          e uma equipe que conhece os clientes pelo nome.

        </p>

        <div className="flex flex-wrap gap-2">

          <Link

            to="/cardapio"

            className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold"

          >

            Ver cardapio

          </Link>

          <Link

            to="/contato"

            className="px-5 py-2 rounded-full border border-slate-300 text-xs font-semibold"

          >

            Falar com a pizzaria

          </Link>

        </div>

      </div>



      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">

        <p className="text-xs uppercase tracking-wide text-slate-400">

          Destaques

        </p>

        <div className="space-y-3">

          {highlights.map((item) => (

            <div

              key={item.title}

              className="border border-slate-100 rounded-xl p-3 bg-slate-50"

            >

              <p className="text-sm font-semibold text-slate-800">

                {item.title}

              </p>

              <p className="text-xs text-slate-600">{item.text}</p>

            </div>

          ))}

        </div>

      </div>

    </section>



    <section className="space-y-4">

      <h2 className="text-xl font-semibold">Linha do tempo</h2>

      <div className="grid md:grid-cols-3 gap-4">

        {timeline.map((item) => (

          <div

            key={item.year}

            className="bg-white border border-slate-200 rounded-2xl p-4"

          >

            <p className="text-xs text-amber-600 font-semibold">{item.year}</p>

            <p className="text-sm font-semibold text-slate-800">

              {item.label}

            </p>

            <p className="text-xs text-slate-600">{item.text}</p>

          </div>

        ))}

      </div>

    </section>

  </SiteLayout>

);



export default AboutPage;

