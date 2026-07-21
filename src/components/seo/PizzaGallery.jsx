import React, { useState } from 'react';
import PizzaImage from './PizzaImage';

const PizzaGallery = ({ pizzas, loading = false, error = null }) => {
  const [selectedCategory, setSelectedCategory] = useState('todas');
  
  const categories = [
    { id: 'todas', name: 'Todas', icon: '🍕' },
    { id: 'queijo', name: 'Queijo', icon: '🧀' },
    { id: 'carne', name: 'Carne', icon: '🥩' },
    { id: 'legumes', name: 'Legumes', icon: '🥬' },
    { id: 'peixes', name: 'Peixes', icon: '🐟' },
    { id: 'doces', name: 'Doces', icon: '🍰' },
    { id: 'vegana', name: 'Vegana', icon: '🌱' }
  ];

  const filteredPizzas = selectedCategory === 'todas' 
    ? pizzas 
    : pizzas.filter(pizza => pizza.categoria === selectedCategory);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-slate-200 rounded-2xl mb-4"></div>
            <div className="h-4 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍕</div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Ops! Algo deu errado
        </h3>
        <p className="text-slate-600">
          Não conseguimos carregar nossas pizzas. Tente novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros de Categoria */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === category.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Pizzas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPizzas.map((pizza, index) => (
          <div 
            key={pizza.id || pizza.nome || index}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            {/* Imagem */}
            <div className="aspect-square overflow-hidden">
              <PizzaImage
                pizza={pizza}
                size="medium"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Informações */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {pizza.nome || pizza.name}
                </h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  {pizza.categoria || 'Especial'}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {pizza.ingredientes ? pizza.ingredientes.slice(0, 4).join(', ') : pizza.description || 'Sabor especial da casa'}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  {pizza.preco_grande && (
                    <span className="text-lg font-bold text-amber-600">
                      R$ {pizza.preco_grande.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  {pizza.preco_broto && pizza.preco_grande && (
                    <span className="text-xs text-slate-500 ml-2">
                      / R$ {pizza.preco_broto.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
                <button className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-amber-600 transition">
                  Pedir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPizzas.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Nenhuma pizza encontrada
          </h3>
          <p className="text-slate-600">
            Não temos pizzas na categoria "{categories.find(c => c.id === selectedCategory)?.name}" no momento.
          </p>
        </div>
      )}
    </div>
  );
};

export default PizzaGallery;
