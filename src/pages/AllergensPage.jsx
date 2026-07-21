// src/pages/AllergensPage.jsx
import React from "react";
import SiteLayout from "../components/layout/SiteLayout";

const AllergensPage = () => (
  <SiteLayout
    title="Alergenos e ingredientes"
    subtitle="Informacoes gerais sobre ingredientes e alertas. Para casos graves, consulte a equipe."
  >
    <section className="grid md:grid-cols-2 gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
        <p className="text-sm font-semibold text-slate-800">Contem gluten</p>
        <p className="text-xs text-slate-600">
          Nossas massas tradicionais contem trigo e podem conter tracos de gluten.
        </p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
        <p className="text-sm font-semibold text-slate-800">Laticinios</p>
        <p className="text-xs text-slate-600">
          Queijos e molhos podem conter leite e derivados.
        </p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
        <p className="text-sm font-semibold text-slate-800">Oleaginosas</p>
        <p className="text-xs text-slate-600">
          Alguns ingredientes especiais podem conter castanhas e similares.
        </p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
        <p className="text-sm font-semibold text-slate-800">Alho e condimentos</p>
        <p className="text-xs text-slate-600">
          Molhos e temperos podem conter alho, cebola e pimentas.
        </p>
      </div>
    </section>

    <section className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-xs text-slate-700">
      Se voce tem alergia severa, avise a equipe antes de finalizar o pedido.
      Podemos orientar sobre ingredientes de cada sabor.
    </section>
  </SiteLayout>
);

export default AllergensPage;
