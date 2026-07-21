// src/components/layout/SiteLayout.jsx

import React from "react";

import SiteHeader from "./SiteHeader";

import SiteFooter from "./SiteFooter";



const SiteLayout = ({ title, subtitle, children }) => (

  <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">

    <SiteHeader />



    <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10 space-y-8">

      <section className="space-y-3">

        {title && (

          <h1 className="text-3xl md:text-4xl font-black tracking-tight">

            {title}

          </h1>

        )}

        {subtitle && (

          <p className="text-base text-slate-600 max-w-3xl">{subtitle}</p>

        )}

      </section>



      {children}

    </main>



    <SiteFooter />

  </div>

);



export default SiteLayout;

