import React, { useState } from 'react';
import OptimizedImage from '../ui/OptimizedImage';

const PizzaImage = ({ 
  pizza, 
  size = 'medium',
  className = '',
  priority = false,
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [imageError, setImageError] = useState(false);


  // Mapeamento de tamanhos para dimensões
  const sizeDimensions = {
    small: { width: 200, height: 200 },
    medium: { width: 400, height: 400 },
    large: { width: 600, height: 600 },
    hero: { width: 800, height: 600 }
  };

  // Determina dimensões e URL da imagem
  const currentSize = sizeDimensions[size] || sizeDimensions.medium;
  const imageUrl = pizza.imagem || `https://placehold.co/${currentSize.width}x${currentSize.height}?text=Pizza`;

  const altText = `Pizza ${pizza.nome || pizza.name || 'Especial'} - Pizzaria Anne & Tom`;
  
  const handleError = () => {
    setImageError(true);
  };
  
  if (imageError) {
    // Fallback para placeholder ainda mais simples
    return (
      <div 
        className={`bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-600 font-semibold ${className}`}
        style={{
          width: size === 'small' ? '150px' : size === 'medium' ? '300px' : size === 'large' ? '400px' : '600px',
          height: size === 'small' ? '150px' : size === 'medium' ? '300px' : size === 'large' ? '400px' : '400px'
        }}
      >
        🍕
      </div>
    );
  }
  
  return (
    <OptimizedImage
      src={imageUrl}
      alt={altText}
      className={className}
      loading={loading}
      priority={priority}
      onError={handleError}
      width={size === 'small' ? 150 : size === 'medium' ? 300 : size === 'large' ? 400 : 600}
      height={size === 'small' ? 150 : size === 'medium' ? 300 : size === 'large' ? 400 : 400}
    />
  );
};

export default PizzaImage;
