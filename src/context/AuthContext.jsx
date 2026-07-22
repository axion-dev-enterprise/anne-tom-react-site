import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import server from "../api/server";

const STORAGE_KEY = "at_customer";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.orders)) {
        // Sanitize and deduplicate orders from local storage
        const uniqueMap = new Map();
        parsed.orders.forEach((ord) => {
          if (ord && ord.id) {
            const key = String(ord.id);
            const existing = uniqueMap.get(key);
            // Prefer order entry with valid total > 0
            if (!existing || (Number(ord.total) > 0 && Number(existing.total) === 0)) {
              uniqueMap.set(key, {
                ...ord,
                total: Number(ord.total) || 0,
                pointsEarned: ord.pointsEarned ?? Math.floor(Number(ord.total) || 0),
              });
            }
          }
        });
        parsed.orders = Array.from(uniqueMap.values());
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (customer) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [customer]);

  const loginOrRegister = async ({ name, phone, pin }) => {
    const cleanedPhone = String(phone || "")
      .replace(/\D/g, "")
      .replace(/^0+/, "");
    if (!cleanedPhone || cleanedPhone.length < 10) {
      return { ok: false, error: "Informe um telefone WhatsApp válido com DDD." };
    }

    const cleanedPin = String(pin || "").trim();
    if (!cleanedPin || !/^\d{6}$/.test(cleanedPin)) {
      return { ok: false, error: "O PIN de acesso deve conter exatamente 6 números." };
    }

    setLoading(true);
    try {
      const existingRes = await server.checkCustomerByPhone(cleanedPhone);
      let existingCustomer = existingRes?.ok ? existingRes.data : null;

      if (!existingCustomer && customer && customer.phone === cleanedPhone) {
        existingCustomer = customer;
      }

      if (existingCustomer) {
        if (existingCustomer.pin && existingCustomer.pin !== cleanedPin) {
          return { ok: false, error: "PIN de 6 dígitos incorreto. Tente novamente." };
        }

        const updatedCustomer = {
          ...existingCustomer,
          pin: cleanedPin,
          points: existingCustomer.points ?? 120,
          orders: existingCustomer.orders || [],
          addresses: existingCustomer.addresses || [],
        };
        setCustomer(updatedCustomer);
        return { ok: true, customer: updatedCustomer, isNew: false };
      }

      const payload = {
        name: name?.trim() || "Cliente Anne & Tom",
        phone: cleanedPhone,
        pin: cleanedPin,
        points: 50,
        orders: [],
        addresses: [],
        created_at: new Date().toISOString(),
      };

      const created = await server.salvarCliente(payload);
      const newCustomer = created?.ok && created.data ? { ...created.data, pin: cleanedPin, points: 50, orders: [], addresses: [] } : payload;

      setCustomer(newCustomer);
      return { ok: true, customer: newCustomer, isNew: true };
    } catch (error) {
      console.error("[Auth] Falha no login/cadastro:", error);
      const fallbackCustomer = {
        name: name?.trim() || "Cliente Anne & Tom",
        phone: cleanedPhone,
        pin: cleanedPin,
        points: 120,
        orders: [],
        addresses: [],
      };
      setCustomer(fallbackCustomer);
      return { ok: true, customer: fallbackCustomer, isNew: false };
    } finally {
      setLoading(false);
    }
  };

  const recordOrder = useCallback((orderData) => {
    if (!orderData) return;

    const orderId = String(orderData.id || `ord-${Date.now()}`);
    const totalAmount = Number(orderData.totalFinal || orderData.total || orderData.total_final) || 0;
    const pointsEarned = orderData.pointsEarned ?? Math.floor(totalAmount);

    setCustomer((prevCustomer) => {
      if (!prevCustomer) return prevCustomer;

      const existingOrders = Array.isArray(prevCustomer.orders) ? prevCustomer.orders : [];

      // Avoid duplicating order if already recorded
      if (existingOrders.some((o) => String(o.id) === orderId)) {
        return prevCustomer;
      }

      const newOrder = {
        id: orderId,
        date: orderData.date || (new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })),
        items: orderData.items || [],
        total: totalAmount,
        status: orderData.status || "Em Produção",
        address: orderData.address || "Zona Norte, São Paulo - SP",
        pointsEarned,
      };

      const updatedOrders = [newOrder, ...existingOrders];
      const existingAddresses = prevCustomer.addresses || [];
      const newAddress = orderData.address;
      const updatedAddresses = newAddress && !existingAddresses.includes(newAddress)
        ? [newAddress, ...existingAddresses]
        : existingAddresses;

      return {
        ...prevCustomer,
        points: (prevCustomer.points || 0) + pointsEarned,
        orders: updatedOrders,
        addresses: updatedAddresses,
      };
    });
  }, []);

  const redeemPoints = (pointsToRedeem) => {
    if (!customer) return false;
    const currentPoints = customer.points ?? 0;
    if (currentPoints < pointsToRedeem) return false;

    const updated = {
      ...customer,
      points: currentPoints - pointsToRedeem,
    };
    setCustomer(updated);
    return true;
  };

  const logout = () => {
    setCustomer(null);
  };

  const value = useMemo(
    () => ({
      customer,
      loadingAuth: loading,
      loginOrRegister,
      logout,
      redeemPoints,
      recordOrder,
      isAuthenticated: !!customer,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customer, loading, recordOrder]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
};
