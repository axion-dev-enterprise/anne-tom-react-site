// src/components/layout/SiteHeader.jsx

import React, { useState } from "react";

import { Link, NavLink } from "react-router-dom";



const navItems = [
  { to: "/me", label: "👤 Minha Conta" },
  { to: "/cardapio", label: "Cardápio" },
  { to: "/sobre", label: "Sobre" },
  { to: "/entrega", label: "Entrega" },
  { to: "/promocoes", label: "Promoções" },
  { to: "/eventos", label: "Eventos" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
];



const SiteHeader = () => {

  const [open, setOpen] = useState(false);



  return (

    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">

      <div className="max-w-6xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">

        <Link to="/" className="flex items-center gap-3">

          <img

            src="/logopizzaria.png"

            alt="Anne & Tom Pizzaria"

            className="w-10 h-10 object-contain"

          />

          <div className="leading-tight">

            <p className="text-[13px] font-semibold tracking-tight">

              Pizzaria Anne & Tom

            </p>

            <p className="text-[11px] text-slate-500 -mt-0.5">

              Alto de Santana - Sao Paulo

            </p>

          </div>

        </Link>



        <nav className="hidden lg:flex items-center gap-4 text-[12px] font-medium text-slate-600">

          {navItems.map((item) => (

            <NavLink

              key={item.to}

              to={item.to}

              className={({ isActive }) =>

                `transition hover:text-slate-900 ${

                  isActive ? "text-slate-900" : "text-slate-600"

                }`

              }

            >

              {item.label}

            </NavLink>

          ))}

        </nav>



        <div className="flex items-center gap-2">

          <Link

            to="/checkout"

            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-medium hover:bg-slate-50 transition"

          >

            Ver Carrinho

          </Link>

          <Link

            to="/cardapio"

            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[12px] font-semibold shadow-sm hover:brightness-110 transition"

          >

            Fazer Pedido

          </Link>



          <button

            type="button"

            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200"

            onClick={() => setOpen((prev) => !prev)}

            aria-label="Abrir menu"

          >

            {open ? "X" : "Menu"}

          </button>

        </div>

      </div>



      {open && (

        <div className="lg:hidden border-t border-slate-200 bg-white">

          <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-2 gap-2 text-sm">

            {navItems.map((item) => (

              <NavLink

                key={item.to}

                to={item.to}

                onClick={() => setOpen(false)}

                className={({ isActive }) =>

                  `px-3 py-2 rounded-lg border ${

                    isActive

                      ? "border-slate-900 text-slate-900"

                      : "border-slate-200 text-slate-600"

                  }`

                }

              >

                {item.label}

              </NavLink>

            ))}

          </div>

        </div>

      )}

    </header>

  );

};



export default SiteHeader;

