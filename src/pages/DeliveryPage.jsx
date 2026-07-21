// src/pages/DeliveryPage.jsx

import React from "react";

import SiteLayout from "../components/layout/SiteLayout";

import { Link } from "react-router-dom";



const deliveryAreas = [

  "Alto de Santana",

  "Santana",

  "Jardim Sao Paulo",

  "Mandaqui",

  "Tucuruvi",

  "Parada Inglesa",

  "Vila Mazzei",

  "Casa Verde",

];



const DeliveryPage = () => (

  <SiteLayout

    title="Entrega e taxas"

    subtitle="Consulte as regioes atendidas e como funciona a entrega."

  >

    <section className="grid lg:grid-cols-[1.2fr_1fr] gap-6">

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">Regioes atendidas</h2>

        <p className="text-sm text-slate-600">

          Entregamos em bairros selecionados da Zona Norte. Se o seu bairro nao

          estiver na lista, fale com a gente e confirmamos.

        </p>

        <div className="grid sm:grid-cols-2 gap-2 text-sm">

          {deliveryAreas.map((area) => (

            <div

              key={area}

              className="border border-slate-100 rounded-lg px-3 py-2 bg-slate-50"

            >

              {area}

            </div>

          ))}

        </div>

      </div>



      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">Taxas e prazos</h2>

        <div className="space-y-2 text-sm text-slate-600">

          <p>Tempo medio: 35 a 55 minutos</p>

          <p>Taxa de entrega: varia por bairro e horario</p>

          <p>Pedidos grandes: consulte condicoes especiais</p>

        </div>

        <Link

          to="/contato"

          className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-semibold"

        >

          Falar sobre entrega

        </Link>

      </div>

    </section>

  </SiteLayout>

);



export default DeliveryPage;

