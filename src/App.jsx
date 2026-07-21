// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from "./components/ui/ErrorBoundary";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { reportWebVitals } from "./utils/performance";
import logger from "./utils/logger";

// Lazy loading das páginas para melhor performance
const HomeAnneTom = lazy(() => import("./pages/HomeAnneTom"));
const CardapioPage = lazy(() => import("./pages/CardapioPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DeliveryPage = lazy(() => import("./pages/DeliveryPage"));
const PromotionsPage = lazy(() => import("./pages/PromotionsPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const AllergensPage = lazy(() => import("./pages/AllergensPage"));
const LoyaltyPage = lazy(() => import("./pages/LoyaltyPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));

const AppContent = () => {
  const location = useLocation();

  useEffect(() => {
    // Report web vitals for performance monitoring
    reportWebVitals((metric) => {
      logger.info(`Web Vitals - ${metric.name}`, {
        value: metric.value,
        id: metric.id,
        delta: metric.delta
      });
    });

    // Log page changes for analytics
    logger.info(`Page navigation: ${location.pathname}`, {
      path: location.pathname,
      search: location.search,
      hash: location.hash
    });
  }, [location]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div key={location.pathname} className="page-fade">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes location={location}>
              <Route path="/" element={<HomeAnneTom />} />
              <Route path="/cardapio" element={<CardapioPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/confirmacao" element={<OrderConfirmationPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/contato" element={<ContactPage />} />
              <Route path="/entrega" element={<DeliveryPage />} />
              <Route path="/promocoes" element={<PromotionsPage />} />
              <Route path="/eventos" element={<EventsPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/alergenos" element={<AllergensPage />} />
              <Route path="/fidelidade" element={<LoyaltyPage />} />
              <Route path="/trabalhe-conosco" element={<CareersPage />} />
              <Route path="/galeria" element={<GalleryPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;
