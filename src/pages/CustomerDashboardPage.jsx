// src/pages/CustomerDashboardPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteLayout from "../components/layout/SiteLayout";
import { useAuth } from "../context/AuthContext";
import { formatCurrencyBRL } from "../utils/menu";

export const CustomerDashboardPage = () => {
  const { customer, isAuthenticated, loginOrRegister, logout, loadingAuth } = useAuth();
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    const res = await loginOrRegister({ name: nameInput, phone: phoneInput });
    if (!res.ok) {
      setAuthError(res.error || "Falha na autenticação.");
    }
  };

  // Mocked/Saved Order History
  const mockOrders = customer?.orders || [
    {
      id: "AT-9842",
      date: "21/07/2026 20:15",
      items: ["1x Pizza Musa (Grande)", "1x Coca-Cola 2L"],
      total: 78.0,
      status: "ENTREGUE",
      pointsEarned: 78,
    },
    {
      id: "AT-9104",
      date: "14/07/2026 19:40",
      items: ["1x Pizza Namorados (Grande)", "1x Borda Catupiry"],
      total: 82.5,
      status: "ENTREGUE",
      pointsEarned: 82,
    },
  ];

  const totalPoints = mockOrders.reduce((acc, o) => acc + (o.pointsEarned || 0), 0);

  if (!isAuthenticated) {
    return (
      <SiteLayout
        title="Área do Cliente & Fidelidade"
        subtitle="Acesse sua conta via auth.annetom.com para ver histórico de pedidos e pontos de fidelidade."
      >
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-3xl flex items-center justify-center mx-auto">
              🔐
            </div>
            <h2 className="text-xl font-bold text-slate-900">Login (auth.annetom.com)</h2>
            <p className="text-xs text-slate-500">
              Digite seu telefone de contato para acessar seu histórico e resgatar pontos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {authError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seu Nome</label>
              <input
                type="text"
                placeholder="Ex: Carlos Silva"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone (WhatsApp)</label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingAuth}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-white text-sm transition shadow-lg disabled:opacity-50"
            >
              {loadingAuth ? "Conectando..." : "Entrar no auth.annetom.com →"}
            </button>
          </form>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout
      title={`Olá, ${customer.name || "Cliente"}!`}
      subtitle="Gerencie seus pedidos, dados e resgate pontos de fidelidade."
    >
      <div className="space-y-8">
        {/* Profile & Loyalty Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl grid md:grid-cols-3 gap-6 items-center border border-slate-800">
          <div className="md:col-span-2 space-y-3">
            <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Cliente VIP Anne & Tom
            </span>
            <h2 className="text-2xl font-black text-white">{customer.name || "Cliente Registrado"}</h2>
            <p className="text-xs text-slate-300">Telefone: {customer.phone || "Não informado"}</p>
          </div>

          <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-5 text-center space-y-1">
            <span className="text-3xl">⭐</span>
            <p className="text-2xl font-black text-amber-400">{totalPoints} PONTOS</p>
            <p className="text-[11px] text-slate-400">100 pontos = 1 Pizza Broto Grátis</p>
          </div>
        </div>

        {/* Order History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Histórico de Pedidos</h3>
            <button onClick={logout} className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline">
              Sair da conta
            </button>
          </div>

          <div className="grid gap-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-900">Pedido {order.id}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{order.date}</p>
                  <p className="text-xs text-slate-700 font-medium">{order.items.join(" • ")}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrencyBRL(order.total)}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/cardapio`)}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 hover:bg-amber-500 hover:text-white text-xs font-bold transition"
                  >
                    Repetir Pedido 🍕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default CustomerDashboardPage;
