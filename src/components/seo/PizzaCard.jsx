import React from 'react';
import PizzaImage from './PizzaImage';

const PizzaCard = ({ 
  pizza, 
  onSelect, 
  size = 'medium',
  showPrice = true,
  showDescription = true,
  className = ''
}) => {
  const price = pizza.preco_grande || pizza.preco_broto || pizza.priceGrande || pizza.priceBroto;
  const description = pizza.ingredientes ? pizza.ingredientes.slice(0, 5).join(', ') : pizza.description || '';
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(pizza);
    }
  };

  return (
    <div 
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Imagem da Pizza */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
        <PizzaImage
          pizza={pizza}
          size={size}
          className="w-full h-full object-cover"
        />
        
        {/* Badge de categoria */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-slate-700">
          {pizza.categoria || 'Especial'}
        </div>
      </div>

      {/* Informações da Pizza */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {pizza.nome || pizza.name}
        </h3>
        
        {showDescription && description && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {showPrice && price && (
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-amber-600">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs text-slate-500">
              {pizza.preco_grande ? 'Grande' : 'Broto'}
            </span>
          </div>
        )}

        <button 
          className="mt-3 w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white py-2 rounded-full text-sm font-semibold hover:brightness-110 transition"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
};

export default PizzaCard;
