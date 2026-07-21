// src/data/menuOverrides.js
export const HOME_MENU_OVERRIDES = {
  bestSellers: [],
  veggie: [],
  heroHighlights: [],
};

export const matchOverrides = (pizzas, overrides) => {
  if (!Array.isArray(overrides) || overrides.length === 0) return [];

  return overrides
    .map((override) => {
      if (!override) return null;
      const idMatch = override.id
        ? pizzas.find((pizza) => pizza.id === String(override.id))
        : null;
      if (idMatch) return idMatch;

      if (override.name) {
        const nameLower = String(override.name).toLowerCase();
        return pizzas.find((pizza) =>
          String(pizza.nome || "").toLowerCase().includes(nameLower)
        );
      }

      return null;
    })
    .filter(Boolean);
};
