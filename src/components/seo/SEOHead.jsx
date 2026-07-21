import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ 
  title, 
  description, 
  image = '/logopizzaria.png',
  type = 'website',
  keywords = [],
  structuredData = null
}) => {
  const location = useLocation();
  const siteUrl = 'https://annetom.com.br';
  const fullUrl = `${siteUrl}${location.pathname}${location.search}${location.hash}`;

  const defaultTitle = 'Pizzaria Anne & Tom - Pizzas Artesanais | Delivery Zona Norte SP';
  const defaultDescription = '🍕 Pizzaria Anne & Tom: As melhores pizzas artesanais da Zona Norte de São Paulo. Cardápio completo, delivery rápido e sabores únicos. Peça agora pelo WhatsApp!';
  const defaultKeywords = [
    'pizzaria', 
    'pizza artesanal', 
    'Anne & Tom', 
    'cardápio', 
    'pedido online', 
    'delivery', 
    'Santana', 
    'Zona Norte São Paulo', 
    'pizza massa fina', 
    'pizza borda recheada',
    'pizza delivery',
    'pizzaria zona norte',
    'pizza artesanal sp'
  ];

  const finalTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = [...defaultKeywords, ...keywords].join(', ');

  const restaurantStructuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Pizzaria Anne & Tom",
    "description": "Pizzaria artesanal com sabores únicos na Zona Norte de São Paulo",
    "url": siteUrl,
    "telephone": "+5511932507007",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Alto de Santana",
      "addressLocality": "São Paulo",
      "addressRegion": "SP",
      "postalCode": "00000-000",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-23.4678",
      "longitude": "-46.6298"
    },
    "servesCuisine": "Pizza",
    "priceRange": "$$",
    "openingHours": "Mo-Su 18:00-23:00",
    "sameAs": [
      "https://api.whatsapp.com/send?phone=5511932507007"
    ],
    "menu": `${siteUrl}/cardapio`,
    "image": `${siteUrl}${image}`
  };

  const finalStructuredData = structuredData || restaurantStructuredData;

  return (
    <Helmet>
      {/* Meta Tags Básicas */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Pizzaria Anne & Tom" />
      <meta name="language" content="pt-BR" />
      <meta name="geo.region" content="BR-SP" />
      <meta name="geo.placename" content="São Paulo" />
      <meta name="geo.position" content="-23.4678;-46.6298" />
      <meta name="ICBM" content="-23.4678, -46.6298" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:alt" content="Pizzaria Anne & Tom" />
      <meta property="og:site_name" content="Pizzaria Anne & Tom" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={`${siteUrl}${image}`} />
      <meta property="twitter:image:alt" content="Pizzaria Anne & Tom" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#f59e0b" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Anne & Tom" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>

      {/* Preconnect para performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link rel="preconnect" href="https://api.annetom.com" />

      {/* DNS prefetch para recursos externos */}
      <link rel="dns-prefetch" href="//recipesblob.oetker.com.br" />
      <link rel="dns-prefetch" href="//i.pravatar.cc" />
      <link rel="dns-prefetch" href="//api.whatsapp.com" />
    </Helmet>
  );
};

export default SEOHead;
