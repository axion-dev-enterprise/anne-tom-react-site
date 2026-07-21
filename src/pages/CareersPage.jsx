// src/pages/CareersPage.jsx

import React from "react";

import SiteLayout from "../components/layout/SiteLayout";



const roles = [

  {

    title: "Pizzaiolo(a)",

    text: "Experiencia com forno, massas e organizacao de bancada.",

  },

  {

    title: "Atendimento e caixa",

    text: "Atendimento ao cliente, WhatsApp e suporte ao pedido.",

  },

  {

    title: "Entregador(a)",

    text: "Conhecer a regiao e ter foco em pontualidade.",

  },

];



const CareersPage = () => (

  <SiteLayout

    title="Trabalhe conosco"

    subtitle="Quer fazer parte da equipe? Veja as oportunidades abertas."

  >

    <section className="grid md:grid-cols-3 gap-4">

      {roles.map((role) => (

        <div

          key={role.title}

          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2"

        >

          <p className="text-sm font-semibold text-slate-800">{role.title}</p>

          <p className="text-xs text-slate-600">{role.text}</p>

        </div>

      ))}

    </section>



    <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-slate-700">

      Envie seu nome, funcao desejada e disponibilidade para o WhatsApp

      (11) 93250-7007.

    </section>

  </SiteLayout>

);



export default CareersPage;

