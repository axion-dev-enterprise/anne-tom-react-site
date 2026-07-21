// Accessibility utilities

export const generateAriaLabels = {
  pizza: (pizza) => ({
    name: `Pizza ${pizza.nome || pizza.name}`,
    description: `Ingredientes: ${(pizza.ingredientes || []).join(', ') || pizza.description || 'Sabor especial'}`,
    price: pizza.preco_grande ? `Preço grande: R$ ${pizza.preco_grande.toFixed(2)}` : '',
    category: `Categoria: ${pizza.categoria || 'Especial'}`
  }),
  
  button: (action, item) => ({
    'aria-label': `${action} ${item}`,
    role: 'button',
    tabIndex: 0
  }),
  
  navigation: (item) => ({
    'aria-label': `Navegar para ${item}`,
    role: 'navigation'
  })
};

export const keyboardNavigation = {
  handleKeyDown: (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },
  
  trapFocus: (containerRef) => {
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements?.length) return null;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    return (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
  }
};

export const announceToScreenReader = (message) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const getAccessibilityProps = (role, options = {}) => {
  const baseProps = {
    role,
    ...(options.label && { 'aria-label': options.label }),
    ...(options.describedBy && { 'aria-describedby': options.describedBy }),
    ...(options.expanded !== undefined && { 'aria-expanded': options.expanded }),
    ...(options.selected !== undefined && { 'aria-selected': options.selected }),
  };
  
  return baseProps;
};

export const skipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-500 text-white px-4 py-2 rounded-md z-50"
  >
    Pular para o conteúdo principal
  </a>
);
