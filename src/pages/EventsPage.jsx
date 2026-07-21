// src/pages/EventsPage.jsx

import React from "react";

import SiteLayout from "../components/layout/SiteLayout";



const steps = [

  {

    title: "Conte quantas pessoas",

    text: "Diga para quantas pessoas e qual o tipo de evento.",

  },

  {

    title: "Defina o estilo",

    text: "Escolha sabores, bebidas e se quer borda recheada.",

  },

  {

    title: "Agende a entrega",

    text: "Combinamos horario e logistica para chegar certinho.",

  },

];



const EventsPage = () => (

  <SiteLayout

    title="Eventos e pedidos grandes"

    subtitle="Pedidos para confraternizacoes, aniversarios e reunioes." 

  >

    <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6">

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">Como funciona</h2>

        <div className="space-y-3">

          {steps.map((step, idx) => (

            <div

              key={step.title}

              className="flex gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3"

            >

              <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-semibold">

                {idx + 1}

              </span>

              <div>

                <p className="text-sm font-semibold text-slate-800">

                  {step.title}

                </p>

                <p className="text-xs text-slate-600">{step.text}</p>

              </div>

            </div>

          ))}

        </div>

      </div>



      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">Pedido rapido</h2>

        <form className="space-y-3">

          <input

            type="text"

            placeholder="Seu nome"

            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"

          />

          <input

            type="text"

            placeholder="Numero de pessoas"

            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"

          />

          <input

            type="text"

            placeholder="Data e horario"

            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"

          />

          <textarea

            rows="3"

            placeholder="Sabores preferidos e detalhes"

            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"

          />

          <button

            type="button"

            className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-semibold"

          >

            Solicitar orcamento

          </button>

        </form>

        <p className="text-[11px] text-slate-500">

          Formulario visual. Para enviar, conecte com WhatsApp ou backend.

        </p>

      </div>

    </section>

  </SiteLayout>

);



export default EventsPage;

