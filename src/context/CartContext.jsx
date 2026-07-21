import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "anne_tom_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (items.length) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === item.id && i.tamanho === item.tamanho
      );
      if (existingIndex !== -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantidade: copy[existingIndex].quantidade + item.quantidade,
        };
        return copy;
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id, tamanho, quantidade) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === id && i.tamanho === tamanho ? { ...i, quantidade } : i
        )
        .filter((i) => i.quantidade > 0)
    );
  };

  const removeItem = (id, tamanho) => {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && i.tamanho === tamanho))
    );
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0),
    [items]
  );

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return ctx;
};
