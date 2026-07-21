// SEO utilities

export const generatePizzaStructuredData = (pizza) => ({
  "@context": "https://schema.org",
  "@type": "MenuItem",
  "name": pizza.nome || pizza.name,
  "description": (pizza.ingredientes || []).join(", ") || pizza.description || "Sabor especial da casa",
  "offers": {
    "@type": "Offer",
    "price": pizza.preco_grande || pizza.priceGrande || "0",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock"
  },
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "300 kcal"
  },
  "suitableForDiet": pizza.categoria === 'vegana' ? "https://schema.org/VeganDiet" : 
                     pizza.categoria === 'legumes' ? "https://schema.org/VegetarianDiet" : null
});

export const generateBreadcrumbStructuredData = (breadcrumbs) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": `https://annetom.com.br${crumb.path}`
  }))
});

export const generateFAQStructuredData = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const getKeywordsByCategory = (category) => {
  const categoryKeywords = {
    'queijo': ['pizza queijo', 'pizza mussarela', 'pizza catupiry', 'pizza provolone'],
    'carne': ['pizza carne', 'pizza calabresa', 'pizza pepperoni', 'pizza bacon', 'pizza frango'],
    'legumes': ['pizza vegetariana', 'pizza legumes', 'pizza brócolis', 'pizza abobrinha'],
    'peixes': ['pizza atum', 'pizza seafood', 'pizza peixe'],
    'doces': ['pizza doce', 'pizza chocolate', 'pizza sobremesa'],
    'vegana': ['pizza vegana', 'pizza sem lactose', 'pizza vegetariana'],
    'borda': ['pizza borda recheada', 'pizza borda catupiry', 'pizza borda chocolate'],
    'promocao': ['pizza promoção', 'pizza combo', 'pizza oferta', 'pizza desconto']
  };
  
  return categoryKeywords[category] || [];
};

export const formatPriceForSEO = (price) => {
  if (!price) return '';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
};

export const generateAltText = (pizzaName, ingredients) => {
  const ingredientList = ingredients.slice(0, 3).join(', ');
  return `Pizza ${pizzaName} com ${ingredientList} - Pizzaria Anne & Tom`;
};
