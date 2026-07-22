// src/utils/menu.js
export const MENU_CACHE_KEY = "anne_tom_menu_cache_v1";
export const PRODUCT_PLACEHOLDER_IMAGE = "/pizza-placeholder.jpg";

export const formatCurrencyBRL = (value) =>
  (Number(value) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const clampNumber = (value, min, max, fallback) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
};

export const normalizeImageTransform = (value) => {
  const source = value && typeof value === "object" ? value : {};
  return {
    zoom: clampNumber(source.zoom, 1, 2.5, 1.08),
    focusX: clampNumber(source.focusX, 0, 100, 50),
    focusY: clampNumber(source.focusY, 0, 100, 42),
    mode: "cover",
  };
};

const slugify = (text) => {
  if (!text) return "";
  let val = String(text).toLowerCase().trim();
  val = val.replace(/[ãáâàä]/g, 'a');
  val = val.replace(/[ẽéêèë]/g, 'e');
  val = val.replace(/[ĩíîìï]/g, 'i');
  val = val.replace(/[õóôòö]/g, 'o');
  val = val.replace(/[ũúûùü]/g, 'u');
  val = val.replace(/[ç]/g, 'c');
  val = val.replace(/[^a-z0-9\s-]/g, '');
  val = val.replace(/[\s-]+/g, '_');
  return val.replace(/^_+|_+$/g, '');
};

const MANUAL_IMAGE_MAPPING = {
  // Pizzas
  "jatai": "/menu-images/jatai_catupiry_milho_e_alho_poro.webp",
  "diamantina_mussarela": "/menu-images/diamantina_portuguesa.webp",
  "diamantina_catupiry": "/menu-images/diamantina_portuguesa_c_catupiry.webp",
  "platina_pimenta": "/menu-images/platina_com_pimenta.webp",
  "sao_tome_mussarela": "/menu-images/sao_tome.webp",
  "sao_tome_catupiry": "/menu-images/sao_tome_catupiry.webp",
  "vegana_mix_1": "/menu-images/vegana_mix_berinjela_abobrinha_palmito_e_alho_poro.webp",
  "vegana_mix_2": "/menu-images/vegana_mix_2_brocolis_shitake_palmito_e_tomate_cereja.webp",
  "vila_rica": "/menu-images/vilarejo.webp",
  "frutas": "/menu-images/big_esfiha_doce_mesclada_com_mms.webp",
  "mesclada": "/menu-images/big_esfiha_doce_mesclada_com_mms.webp",
  "banana_nevada": "/menu-images/big_esfiha_doce_banana_com_chocolate_e_canela.webp",
  "nuvens": "/menu-images/big_esfiha_doce_prestigio.webp",

  // Bebidas
  "fanta_laranja_2l": "/menu-images/fanta_laranja_2_litros.webp",
  "guarana_antarctica_2l": "/menu-images/guarana_antartica_2_litros.webp",
  "guarana_zero_2l": "/menu-images/guarana_antartica_2_litros.webp",
  "soda_2l": "/menu-images/soda_20_litros.webp",
  "coca_cola_zero_2l": "/pizza-placeholder.jpg",

  // Bordas
  "borda_catupiry": "/menu-images/canastra_catupiry.webp",
  "borda_dois_queijos": "/menu-images/canastra_mussarela.webp",
  "borda_frango_catupiry": "/menu-images/borda_paozinho_frango_catupiry.webp",
  "borda_vulcao_calabresa": "/menu-images/borda_paozinho_frango_catupiry.webp",
  "borda_vulcao_catupiry": "/menu-images/borda_paozinho_dois_queijos.webp",

  // HD Gourmet Pizza Images (High Resolution)
  "musa": "/menu-images/musa.png",
  "musa_rebelde": "/menu-images/musa_rebelde.png",
  "marguerita": "/menu-images/marguerita.png",
  "anne_tom": "/menu-images/anne_tom.png",

  // Bordas
  "borda_recheada_catupiry": "/menu-images/borda_paozinho_dois_queijos.webp",
  "borda_vulcao_frango_catupiry": "/menu-images/borda_paozinho_frango_catupiry.webp",
  "borda_frango_c_catupiry": "/menu-images/borda_paozinho_frango_catupiry.webp",
  "borda_recheada_frango_com_catupiry": "/menu-images/borda_paozinho_frango_catupiry.webp",

  // Promoções
  "cabucu_broto_coca_600ml": "/menu-images/cabucu_broto_1_coca_600ml.webp",
  "2_grandes_mucuripe_musa_coca_2l": "/menu-images/promocao_combo_pizzas_musa_mucuripe_e_marguerita_gratis_guarana_2l.webp",
  "narizinho_mesclada_coca_2l": "/menu-images/promocao_narizinhomesclada_docecoca_2_litros.webp",
  "arraial_dajuda_refri_2l": "/menu-images/promocao_arraial_dajuda_refri_2_lts.webp",
  "canastra_catupiry_guarana_2l": "/menu-images/promocao_canastra_catupiryguarana_2_litros.webp",
  "cuca_caipira_guarana_2l": "/menu-images/promocao_cuca_caipira_guarana_2_litros.webp",
  "combo_musa_mucuripe_e_marguerita_guarana_2l": "/menu-images/promocao_combo_pizzas_musa_mucuripe_e_marguerita_gratis_guarana_2l.webp",
  "combo_diamantina_mucuripe_e_cuca_catupiry_refri": "/menu-images/promocao_combo_pizzas_diamantina_mucuripe_e_cuca_c_catupiry_refri.webp",

  // Esfihas
  "atum_e_catupiry": "/menu-images/big_esfiha_atum_e_catupiry.webp",
  "atum_e_cebola": "/menu-images/big_esfiha_atum_e_cebola.webp",
  "catupiry_e_bacon": "/menu-images/big_esfiha_catupiry_e_bacon.webp",
  "catupiry_e_milho": "/menu-images/big_esfiha_catupiry_e_milho.webp",
  "escarola_e_bacon": "/menu-images/big_esfiha_escarola_e_bacon.webp",
  "mussarela": "/menu-images/big_esfiha_mussarela.webp",
  "mussarela_com_molho": "/menu-images/big_esfiha_mussarela_com_molho.webp",
  "palmito_e_catupiry": "/menu-images/big_esfiha_palmito_e_catupiry.webp",
  "peru_c_catupiry_e_escarola": "/menu-images/big_esfiha_peru_com_catupiry_e_escarola.webp",
  "quatro_queijos": "/menu-images/big_esfiha_quatro_queijos.webp",
  "brocolis_e_catupiry": "/menu-images/big_esfiha_brocolis_e_catupiry.webp",
  "calabresa_e_catupiry": "/menu-images/big_esfiha_de_calabresa_e_catupiry.webp",
  "calabresa_com_cebola": "/menu-images/big_esfiha_de_calabresa_e_catupiry.webp",
  "dois_queijos": "/menu-images/big_esfiha_dois_queijos.webp",
  "dois_queijos_e_milho": "/menu-images/big_esfiha_dois_queijos_e_milho.webp",
  "frango_com_catupiry": "/menu-images/big_esfiha_frango_e_catupiry.webp",
  "pepperoni_com_mussarela": "/menu-images/big_esfiha_pepperoni_e_mussarela.webp",
  "quatro_queijos_com_milho": "/menu-images/big_esfiha_dois_queijos_e_milho.webp",
  "banana_chocolate_canela": "/menu-images/big_esfiha_doce_banana_com_chocolate_e_canela.webp",
  "chocolate_com_morango": "/menu-images/big_esfiha_doce_chocolate_com_morango.webp"
};

export const resolveProductImage = (item) => {
  const name = item?.name || item?.nome || "";
  const cat = String(item?.category || item?.categoria || "").toLowerCase();

  if (name) {
    const slug = slugify(name);
    
    if (MANUAL_IMAGE_MAPPING[slug]) {
      return MANUAL_IMAGE_MAPPING[slug];
    }
    
    if (cat.includes("esfiha") || slug.includes("esfiha")) {
      let esfihaSlug = slug;
      if (!esfihaSlug.startsWith("big_esfiha_")) {
        esfihaSlug = `big_esfiha_${esfihaSlug}`;
      }
      if (MANUAL_IMAGE_MAPPING[esfihaSlug]) {
        return MANUAL_IMAGE_MAPPING[esfihaSlug];
      }
      return `/menu-images/${esfihaSlug}.webp`;
    }
    
    if (slug) {
      return `/menu-images/${slug}.webp`;
    }
  }

  return String(
    item?.imageUrl ||
      item?.image ||
      item?.imagem ||
      item?.thumbnail ||
      PRODUCT_PLACEHOLDER_IMAGE
  ).trim() || PRODUCT_PLACEHOLDER_IMAGE;
};

export const normalizeBadgesFromItem = (item) => {
  const rawBadges = Array.isArray(item.badges) ? item.badges : [];
  const name = item.name || item.nome || "";
  const category = item.category || item.categoria || "";
  const ingredientes = Array.isArray(item.ingredientes) ? item.ingredientes : [];

  const text = normalizeText(`${name} ${category} ${ingredientes.join(" ")}`);
  const badgesSet = new Set();

  rawBadges.forEach((badge) => {
    const value = normalizeText(badge);

    if (value.includes("veggie") || value.includes("veg")) {
      badgesSet.add("veggie");
    } else if (
      value.includes("picante") ||
      value.includes("pimenta") ||
      value.includes("hot") ||
      value.includes("spicy")
    ) {
      badgesSet.add("hot");
    } else if (value.includes("mais pedido") || value.includes("best")) {
      badgesSet.add("best");
    } else if (
      value.includes("promo") ||
      value.includes("combo") ||
      value.includes("oferta")
    ) {
      badgesSet.add("promo");
    } else if (value.includes("novo") || value.includes("lancamento")) {
      badgesSet.add("new");
    }
  });

  if (text.includes("pimenta") || text.includes("apiment")) {
    badgesSet.add("hot");
  }

  const hasMeat =
    /calabresa|bacon|frango|carne|presunto|lombo|linguica|peru|pepperoni|mignon|costela|salmao|camarao|atum|anchov|peixe|pernil/i.test(
      text
    );

  const hasVeggieHint =
    /mussarela|muzzarela|mozarela|queijo|ricota|gorgonzola|parmesao|catupiry|brocolis|milho|palmito|escaraola|rucula|tomate|berinjela|abobrinha|cebola|pimentao|champignon|azeitona|alcaparra|alho/i.test(
      text
    );

  if (!hasMeat && hasVeggieHint) {
    badgesSet.add("veggie");
  }

  const normName = normalizeText(name);
  if (
    /musa|calabresa|portuguesa|frango com catupiry|anne & tom|anne e tom|mucuripe|4 queijos|quatro queijos|marguerita|margherita/.test(
      normName
    )
  ) {
    badgesSet.add("best");
  }

  return Array.from(badgesSet);
};

const extractMenuItems = (json) => {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.products)) return json.products;
  if (Array.isArray(json.items)) return json.items;
  return [];
};

export const normalizePizzasFromJson = (json) => {
  const items = extractMenuItems(json);

  const safeNumber = (value) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  };

  return items
    .filter((item) => {
      if (item.active === false) return false;
      if (item.isAvailable === false) return false;
      return item.type === "pizza";
    })
    .map((item) => {
      const categoria = item.category || item.categoria || "Outros";
      const categoriaUpper = String(categoria).toUpperCase();

      let precoBroto = safeNumber(item.priceBroto ?? item.preco_broto);
      let precoGrande = safeNumber(item.priceGrande ?? item.preco_grande);

      if (categoriaUpper.includes("ESFIHA")) {
        const unitPrice = precoGrande != null ? precoGrande : precoBroto;
        precoBroto = null;
        precoGrande = unitPrice;
      }

      const badges = normalizeBadgesFromItem(item);

      return {
        id: String(item.id),
        nome: item.name || item.nome || "",
        categoria,
        ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
        preco_broto: precoBroto,
        preco_grande: precoGrande,
        badges,
        extras: Array.isArray(item.extras) ? item.extras : [],
        sugestoes: Array.isArray(item.sugestoes) ? item.sugestoes : [],
        imagem: resolveProductImage(item),
        imageTransform: normalizeImageTransform(item.imageTransform),
      };
    });
};

export const normalizeExtrasFromJson = (json) => {
  const items = extractMenuItems(json);

  const safeNumber = (value) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  };

  const resolveCents = (value) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue / 100 : null;
  };

  return items
    .filter((item) => {
      if (item.active === false) return false;
      if (item.isAvailable === false) return false;

      const type = String(item.type || item.tipo || "").toLowerCase();
      const categoria = String(item.category || item.categoria || "").toLowerCase();

      if (type === "pizza") return false;
      if (type === "extra") return true;

      return (
        categoria.includes("borda") ||
        categoria.includes("extra") ||
        categoria.includes("adicional") ||
        categoria.includes("ingrediente")
      );
    })
    .map((item) => {
      const id =
        item.id ||
        item.code ||
        item.codigo ||
        item.slug ||
        item.name ||
        item.nome ||
        "";

      return {
        id: id ? String(id) : "",
        nome: item.name || item.nome || "",
        categoria: item.category || item.categoria || "",
        descricao: item.description || item.descricao || "",
        preco: safeNumber(
          item.price ??
            item.preco ??
            item.valor ??
            item.amount ??
            resolveCents(
              item.amount_cents ?? item.price_cents ?? item.preco_cents
            )
        ),
        preco_broto: safeNumber(item.priceBroto ?? item.preco_broto),
        preco_grande: safeNumber(item.priceGrande ?? item.preco_grande),
      };
    })
    .filter((item) => item.id || item.nome);
};
