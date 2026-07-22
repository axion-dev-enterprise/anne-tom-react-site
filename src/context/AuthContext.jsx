import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import server from "../api/server";

const STORAGE_KEY = "at_customer";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
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
        };
        setCustomer(updatedCustomer);
        return { ok: true, customer: updatedCustomer, isNew: false };
      }

      const payload = {
        name: name?.trim() || "Cliente Anne & Tom",
        phone: cleanedPhone,
        pin: cleanedPin,
        points: 50,
        created_at: new Date().toISOString(),
      };

      const created = await server.salvarCliente(payload);
      const newCustomer = created?.ok && created.data ? { ...created.data, pin: cleanedPin, points: 50 } : payload;

      setCustomer(newCustomer);
      return { ok: true, customer: newCustomer, isNew: true };
    } catch (error) {
      console.error("[Auth] Falha no login/cadastro:", error);
      const fallbackCustomer = {
        name: name?.trim() || "Cliente Anne & Tom",
        phone: cleanedPhone,
        pin: cleanedPin,
        points: 120,
      };
      setCustomer(fallbackCustomer);
      return { ok: true, customer: fallbackCustomer, isNew: false };
    } finally {
      setLoading(false);
    }
  };

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
      isAuthenticated: !!customer,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customer, loading]
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
