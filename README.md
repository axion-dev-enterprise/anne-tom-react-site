# 🍕 Anne & Tom — React Website

Frontend oficial do **site da Pizzaria Anne & Tom**, desenvolvido em **React + Vite** (ou CRA, conforme seu setup atual) e estruturado para oferecer uma experiência rápida, moderna e totalmente responsiva para os clientes, incluindo cardápio, promoções, informações da loja e fluxo de pedido integrado ao WhatsApp/PDV.

---

## 🎯 Objetivo do Projeto

Este repositório abriga o **site público** da Pizzaria Anne & Tom, pensado para:

- Apresentar o **cardápio digital** com categorias, sabores, combos e bebidas.
- Direcionar clientes para pedidos por **WhatsApp**, **delivery**, ou integração futura com API própria.
- Criar uma presença visual forte, moderna e personalizada da marca.
- Servir como camada web do ecossistema Anne & Tom (Site → Electron PDV → App Motoboy).

---

## ✨ Principais Recursos

### 🖥️ Interface Moderna  
- Design inspirado em apps de delivery premium.  
- Componentes reutilizáveis para seções como:  
  - **Hero Section**,  
  - **Mais Pedidas**,  
  - **Veggies**,  
  - **Destaques**,  
  - **Seções promoncionais**,  
  - **Footer institucional**.

### 📱 Totalmente Responsivo
Funciona perfeitamente em celulares, tablets e desktops.

### ⚡ Performance
- Build otimizado.  
- Imagens otimizadas e carregamento progressivo.  
- Lazy loading onde apropriado.

### 🍽️ Cardápio Dinâmico
- Estrutura preparada para receber dados de forma centralizada.  
- Possibilidade de integração futura com API / DataEngine do PDV.

### 🧭 Navegação fluida
- React Router (ou estrutura modular de páginas).  
- Links entre seções do cardápio com filtros via query params (`?veggie=true`, `?top=true`, etc.).

### 🔧 Código Limpo e Organizável
- Componentização clara.  
- Pastas por contexto: `components`, `pages`, `assets`, `styles`.  
- Padronização para fácil manutenção.

---

## 📂 Estrutura do Projeto

```plaintext
anne-tom-react-site/
├── public/
├── src/
│   ├── assets/        # Imagens, logos, ícones
│   ├── components/    # Componentes reutilizáveis
│   ├── pages/         # Páginas principais
│   ├── hooks/         # Hooks personalizados
│   ├── context/       # Contextos globais
│   ├── styles/        # CSS/SCSS ou Tailwind
│   ├── utils/         # Funções auxiliares
│   └── App.jsx
├── package.json
└── README.md

▶️ Executando localmente

git clone https://github.com/iaguu/anne-tom-react-site.git
cd anne-tom-react-site

npm install
npm run dev     # ou npm start, dependendo do setup
