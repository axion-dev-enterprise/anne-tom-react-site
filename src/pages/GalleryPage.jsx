// src/pages/GalleryPage.jsx
import React from "react";
import SiteLayout from "../components/layout/SiteLayout";
import SEOHead from "../components/seo/SEOHead";
import PizzaGallery from "../components/seo/PizzaGallery";
import { useMenuData } from "../hooks/useMenuData";

const photos = [
  "Forno a lenha e borda crocante",
  "Queijos especiais e finalizacao no forno",
  "Pizza doce com calda e frutas",
  "Borda recheada no ponto",
  "Massa descansada e aberta na hora",
  "Entrega caprichada",
];

const GalleryPage = () => {
  const { pizzas, loadingMenu, menuError } = useMenuData();

  return (
    <>
      <SEOHead 
        title="Galeria de Pizzas - Fotos e Bastidores"
        description="🍕 Veja fotos das nossas pizzas artesanais, bastidores da cozinha e entregas. Conheça o trabalho da Pizzaria Anne & Tom."
        keywords={['galeria pizza', 'fotos pizza', 'pizzaria anne & tom', 'bastidores cozinha', 'pizza artesanal']}
      />
      
      <SiteLayout
        title="Galeria"
        subtitle="Fotos e bastidores da cozinha da Anne & Tom."
      >
        {/* Galeria de Fotos Tradicional */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Nossos Bastidores
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((caption, index) => (
              <div
                key={`${caption}-${index}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-36 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200" />
                <div className="p-4">
                  <p className="text-xs text-slate-600">{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Galeria de Pizzas com Placeholders */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Nossas Pizzas
          </h2>
          <PizzaGallery 
            pizzas={pizzas} 
            loading={loadingMenu}
            error={menuError}
          />
        </section>
      </SiteLayout>
    </>
  );
};

export default GalleryPage;
