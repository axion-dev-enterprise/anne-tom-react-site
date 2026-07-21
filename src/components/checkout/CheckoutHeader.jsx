// src/components/checkout/CheckoutHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutHeader = () => {
  return (
    <header className="premium-panel border-b bg-white">
      <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logopizzaria.png"
            alt="Anne & Tom Pizzaria"
            className="w-10 h-10 object-contain"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Checkout</p>
            <p className="text-[11px] text-slate-500">
              Revise e finalize seu pedido
            </p>
          </div>
        </Link>

        <Link
          to="/cardapio"
          className="premium-button-ghost text-xs px-4 py-1.5"
        >
          ← Voltar ao cardápio
        </Link>
      </div>
    </header>
  );
};

export default CheckoutHeader;
