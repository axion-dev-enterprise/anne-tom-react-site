// src/pages/CustomerDashboardPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SiteLayout from "../components/layout/SiteLayout";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrencyBRL } from "../utils/menu";

export const CustomerDashboardPage = () => {
  const { customer, isAuthenticated, loginOrRegister, logout, loadingAuth } = useAuth();
  const { addItem } = useCart();
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("historico"); // historico | enderecos | fidelidade
  const [repeatSuccess, setRepeatSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    const res = await loginOrRegister({ name: nameInput, phone: phoneInput, pin: pinInput });
    if (!res.ok) {
      setAuthError(res.error || "Falha na autenticação via auth.annetom.com.");
    }
  };

  // Histórico de pedidos do cliente (do estado global)
  const ordersList = customer?.orders || [];

  const totalPoints = customer?.points || ordersList.reduce((acc, o) => acc + (o.pointsEarned || 0), 0);
  const nextRewardThreshold = 100;
  const rewardProgress = Math.min(100, Math.round((totalPoints / nextRewardThreshold) * 100));

  const handleRepeatOrder = (order) => {
    order.items.forEach((it) => {
      addItem({
        id: it.name.toLowerCase().replace(/\s+/g, "-"),
        nome: it.name,
        name: it.name,
        preco_grande: it.price,
        price: it.price,
        quantidade: it.qty,
      });
    });
    setRepeatSuccess(`Pedido ${order.id} re-adicionado ao seu carrinho! Redirecionando...`);
    setTimeout(() => {
      navigate("/checkout");
    }, 1200);
  };

  if (!isAuthenticated) {
    return (
      <SiteLayout
        title="Perfil do Cliente (annetom.com/me)"
        subtitle="Acesse sua conta via auth.annetom.com para ver histórico de pedidos, fidelidade e endereços salvos."
      >
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-3xl flex items-center justify-center mx-auto">
              🔐
            </div>
            <h2 className="text-2xl font-black text-slate-900">Entrar em annetom.com/me</h2>
            <p className="text-xs text-slate-600">
              Digite seu WhatsApp para sincronizar seu histórico e pontos de fidelidade.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {authError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Seu Nome</label>
              <input
                type="text"
                placeholder="Ex: Carlos Silva"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefone (WhatsApp)</label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN de Acesso (6 dígitos)</label>
              <input
                type="password"
                maxLength={6}
                placeholder="******"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingAuth}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 text-sm transition shadow-lg disabled:opacity-50"
            >
              {loadingAuth ? "Conectando..." : "Acessar minha conta (auth.annetom.com) →"}
            </button>
          </form>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout
      title={`Olá, ${customer.name || "Cliente"}!`}
      subtitle="Gerencie seus pedidos, dados cadastrais e pontos do Programa de Fidelidade Anne & Tom."
    >
      <div className="space-y-8">
        {repeatSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-800 animate-pulse text-center">
            {repeatSuccess}
          </div>
        )}

        {/* Profile & Loyalty Header Card - THEMA WHITE CLEAN */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100/60 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-md grid md:grid-cols-3 gap-6 items-center border-2 border-amber-300">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                VIP Anne &amp; Tom
              </span>
              <span className="text-xs font-semibold text-slate-600">auth.annetom.com</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{customer.name || "Cliente Registrado"}</h2>
            <div className="flex flex-wrap gap-4 text-xs text-slate-700">
              <p>📱 WhatsApp: <strong className="text-slate-950">{customer.phone || "Não informado"}</strong></p>
              {customer.email && <p>✉️ E-mail: <strong className="text-slate-950">{customer.email}</strong></p>}
            </div>
          </div>

          <div className="bg-white border-2 border-amber-400 rounded-2xl p-5 text-center space-y-2 shadow-sm">
            <span className="text-3xl">⭐</span>
            <p className="text-2xl font-black text-amber-600">{totalPoints} PONTOS</p>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${rewardProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-700 font-extrabold">
              {totalPoints >= nextRewardThreshold
                ? "🎉 Você tem pontos para 1 Broto Grátis!"
                : `Faltam ${nextRewardThreshold - totalPoints} pontos para 1 Broto Grátis`}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab("historico")}
            className={`pb-3 transition border-b-2 ${
              activeTab === "historico" ? "border-amber-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            📋 Histórico de Pedidos ({ordersList.length})
          </button>
          <button
            onClick={() => setActiveTab("enderecos")}
            className={`pb-3 transition border-b-2 ${
              activeTab === "enderecos" ? "border-amber-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            📍 Endereços de Entrega
          </button>
          <button
            onClick={() => setActiveTab("fidelidade")}
            className={`pb-3 transition border-b-2 ${
              activeTab === "fidelidade" ? "border-amber-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            🎁 Fidelidade &amp; Vouchers
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "historico" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Seus Pedidos Anteriores</h3>
              <button onClick={logout} className="text-xs text-rose-600 hover:text-rose-800 font-bold underline">
                Sair da conta
              </button>
            </div>

            {ordersList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <p className="text-4xl">🍕</p>
                <h4 className="text-base font-bold text-slate-900">Nenhum pedido realizado ainda</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Faça seu primeiro pedido no nosso cardápio para acumular pontos no programa de fidelidade!
                </p>
                <Link to="/cardapio" className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition">
                  Ir para o Cardápio →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {ordersList.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-slate-900">Pedido {order.id}</span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {order.status}
                        </span>
                        <span className="text-[11px] text-amber-700 font-bold">+{order.pointsEarned} pts</span>
                      </div>
                      <p className="text-xs text-slate-500">{order.date}</p>
                      <p className="text-xs text-slate-800 font-semibold">
                        {order.items.map((i) => (typeof i === "string" ? i : `${i.qty}x ${i.name}`)).join(" • ")}
                      </p>
                      {order.address && (
                        <p className="text-[11px] text-slate-500">📍 {order.address}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block font-medium">Total</span>
                        <span className="text-base font-black text-slate-900">{formatCurrencyBRL(order.total)}</span>
                      </div>
                      <button
                        onClick={() => handleRepeatOrder(order)}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-1.5"
                      >
                        <span>Repetir Pedido</span>
                        <span>🍕</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "enderecos" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Endereço Principal Salvo</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Rua Voluntários da Pátria, 2400</p>
                <p className="text-xs text-slate-600">Santana — São Paulo / SP — CEP 02010-000</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Entrega Padrão (Zona Norte)
                </span>
              </div>
              <Link to="/checkout" className="text-xs font-bold text-amber-600 hover:underline">
                Editar no Checkout →
              </Link>
            </div>
          </div>
        )}

        {activeTab === "fidelidade" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Programa de Fidelidade Anne &amp; Tom</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A cada R$ 1,00 gasto nos seus pedidos em <strong>annetom.com</strong>, você ganha 1 Ponto no seu saldo. Ao acumular 100 pontos, você pode resgatar 1 Pizza Broto Doce ou Salgada totalmente grátis!
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-950">Seu Saldo Atual: {totalPoints} PONTOS</p>
                <p className="text-xs text-amber-800">Acumule pontos automaticamente em cada pedido concluído.</p>
              </div>
              <Link to="/cardapio" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition">
                Pedir Agora 🍕
              </Link>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default CustomerDashboardPage;
