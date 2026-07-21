// src/components/layout/SiteFooter.jsx

import React from "react";

import { Link } from "react-router-dom";



const SiteFooter = () => (

  <footer className="bg-slate-900 text-slate-200">

    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-10 grid md:grid-cols-[1.2fr_1fr_1fr] gap-8">

      <div className="space-y-3">

        <div className="flex items-center gap-3">

          <img

            src="/logopizzaria.png"

            alt="Anne & Tom Pizzaria"

            className="w-10 h-10 object-contain"

          />

          <div>

            <p className="text-sm font-semibold">Pizzaria Anne & Tom</p>

            <p className="text-[11px] text-slate-400">

              Zona Norte - Sao Paulo

            </p>

          </div>

        </div>

        <p className="text-xs text-slate-400">

          Pizzas artesanais, massa leve e cobertura generosa. Pedidos no

          cardapio interno ou pelo WhatsApp.

        </p>

      </div>



      <div className="space-y-2 text-xs">

        <p className="text-slate-300 font-semibold uppercase tracking-wide">

          Navegacao

        </p>

        <div className="grid grid-cols-2 gap-2">

          <Link to="/sobre" className="hover:text-white">

            Sobre

          </Link>

          <Link to="/galeria" className="hover:text-white">

            Galeria

          </Link>

          <Link to="/entrega" className="hover:text-white">

            Entrega

          </Link>

          <Link to="/promocoes" className="hover:text-white">

            Promocoes

          </Link>

          <Link to="/eventos" className="hover:text-white">

            Eventos

          </Link>

          <Link to="/faq" className="hover:text-white">

            FAQ

          </Link>

          <Link to="/alergenos" className="hover:text-white">

            Alergenos

          </Link>

          <Link to="/fidelidade" className="hover:text-white">

            Fidelidade

          </Link>

          <Link to="/trabalhe-conosco" className="hover:text-white">

            Trabalhe conosco

          </Link>

          <Link to="/contato" className="hover:text-white">

            Contato

          </Link>

        </div>

      </div>



      <div className="space-y-2 text-xs">

        <p className="text-slate-300 font-semibold uppercase tracking-wide">

          Atendimento

        </p>

        <p className="text-slate-400">Horarios: terca a domingo, 19h as 23h</p>

        <p className="text-slate-400">Telefone/WhatsApp: (11) 93250-7007</p>

        <p className="text-slate-400">Alto de Santana, Sao Paulo</p>

        <div className="pt-2">

          <Link

            to="/cardapio"

            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 text-[11px] font-semibold hover:bg-slate-100"

          >

            Fazer pedido agora

          </Link>

        </div>

      </div>

    </div>



    <div className="border-t border-slate-800 text-[11px] text-slate-500">

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">

        <p>Anne & Tom Pizzaria - Todos os direitos reservados.</p>

        <p>Site interno de pedidos e informacoes.</p>

      </div>

    </div>

  </footer>

);



export default SiteFooter;

