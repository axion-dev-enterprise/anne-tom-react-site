// src/pages/ContactPage.jsx

import React from "react";

import SiteLayout from "../components/layout/SiteLayout";



const ContactPage = () => (

  <SiteLayout

    title="Contato e localizacao"

    subtitle="Fale com a equipe, tire duvidas e encontre a pizzaria."

  >

    <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6">

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">Atendimento</h2>

        <div className="grid gap-3 text-sm text-slate-700">

          <p>

            <span className="font-semibold">WhatsApp:</span> (11) 93250-7007

          </p>

          <p>

            <span className="font-semibold">Telefone:</span> (11) 93250-7007

          </p>

          <p>

            <span className="font-semibold">Endereco:</span> Alto de Santana,

            Sao Paulo

          </p>

          <p>

            <span className="font-semibold">Horario:</span> Terca a domingo,

            19h as 23h (segunda fechado)

          </p>

        </div>



        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">

          Mapa e como chegar: adicione aqui o link oficial do Google Maps quando

          estiver disponivel.

        </div>

      </div>



      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">Mensagem rapida</h2>

        <form className="space-y-3">

          <input

            type="text"

            placeholder="Seu nome"

            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"

          />

          <input

            type="text"

            placeholder="WhatsApp"

            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"

          />

          <textarea

            rows="4"

            placeholder="Escreva sua mensagem"

            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"

          />

          <button

            type="button"

            className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold"

          >

            Enviar mensagem

          </button>

        </form>

        <p className="text-[11px] text-slate-500">

          Este formulario e visual. Para integrar, conecte com o WhatsApp ou

          backend.

        </p>

      </div>

    </section>

  </SiteLayout>

);



export default ContactPage;

