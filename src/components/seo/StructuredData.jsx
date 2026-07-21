import React from 'react';

const StructuredData = ({ data }) => {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ 
        __html: JSON.stringify(data, null, 2) 
      }}
    />
  );
};

export const RestaurantStructuredData = ({ restaurant }) => ({
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": restaurant.name || "Pizzaria Anne & Tom",
  "description": restaurant.description || "Pizzaria artesanal com sabores únicos na Zona Norte de São Paulo",
  "url": restaurant.url || "https://annetom.com.br",
  "telephone": restaurant.telephone || "+5511932507007",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": restaurant.streetAddress || "Alto de Santana",
    "addressLocality": restaurant.addressLocality || "São Paulo",
    "addressRegion": restaurant.addressRegion || "SP",
    "postalCode": restaurant.postalCode || "00000-000",
    "addressCountry": restaurant.addressCountry || "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": restaurant.latitude || "-23.4678",
    "longitude": restaurant.longitude || "-46.6298"
  },
  "servesCuisine": "Pizza",
  "priceRange": restaurant.priceRange || "$$",
  "openingHours": restaurant.openingHours || "Mo-Su 18:00-23:00",
  "sameAs": [
    "https://api.whatsapp.com/send?phone=5511932507007"
  ],
  "menu": "https://annetom.com.br/cardapio",
  "image": "https://annetom.com.br/logopizzaria.png",
  "aggregateRating": restaurant.aggregateRating || {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "1500"
  }
});

export const PizzaStructuredData = ({ pizza }) => ({
  "@context": "https://schema.org",
  "@type": "MenuItem",
  "name": pizza.nome || pizza.name,
  "description": (pizza.ingredientes || []).join(", ") || pizza.description || "Sabor especial da casa",
  "offers": {
    "@type": "Offer",
    "price": pizza.preco_grande || pizza.priceGrande || "0",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Pizzaria Anne & Tom"
    }
  },
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "300 kcal"
  },
  "suitableForDiet": pizza.categoria === 'vegana' ? "https://schema.org/VeganDiet" : 
                     pizza.categoria === 'legumes' ? "https://schema.org/VegetarianDiet" : null
});

export const BreadcrumbStructuredData = ({ breadcrumbs }) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": `https://annetom.com.br${crumb.path}`
  }))
});

export const FAQStructuredData = ({ faqs }) => ({
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

export const WebPageStructuredData = ({ page, breadcrumbs }) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": page.title,
  "description": page.description,
  "url": `https://annetom.com.br${page.path}`,
  "isPartOf": {
    "@type": "WebSite",
    "name": "Pizzaria Anne & Tom",
    "url": "https://annetom.com.br"
  },
  "breadcrumb": breadcrumbs ? BreadcrumbStructuredData({ breadcrumbs }) : undefined,
  "mainEntity": page.mainEntity
});

export default StructuredData;
