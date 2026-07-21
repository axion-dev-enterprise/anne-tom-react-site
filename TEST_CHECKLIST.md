# Checklist de Testes - Produção Anne & Tom

## 🚀 Fluxos Críticos para Testar

### 1. **Navegação e Performance**
- [ ] Carregamento inicial < 3s
- [ ] Lazy loading funcionando
- [ ] Transições suaves entre páginas
- [ ] Responsividade mobile/desktop

### 2. **Cardápio e Carrinho**
- [ ] Carregamento do cardápio
- [ ] Adicionar itens ao carrinho
- [ ] Alterar quantidades
- [ ] Remover itens
- [ ] Persistência do carrinho (localStorage)

### 3. **Checkout - Fluxo Completo**
- [ ] Step 1: Carrinho (validação de itens)
- [ ] Step 2: Dados pessoais (validação de campos)
- [ ] Step 3: Endereço (funcionamento do mapa)
- [ ] Step 4: Pagamento (meios de pagamento)
- [ ] Step 5: Revisão (resumo do pedido)

### 4. **Validações e Segurança**
- [ ] Validação de e-mail
- [ ] Validação de telefone
- [ ] Validação de CPF
- [ ] Campos obrigatórios
- [ ] Tratamento de erros

### 5. **Integrações Externas**
- [ ] Google Maps API
- [ ] API do cardápio
- [ ] Sistema de pagamento (AxionPay)

### 6. **Error Handling**
- [ ] ErrorBoundary funcionando
- [ ] Falha de API tratada
- [ ] Offline handling
- [ ] Logging de erros

### 7. **Performance**
- [ ] Web Vitals (LCP, FID, CLS)
- [ ] Tamanho dos bundles
- [ ] Lazy loading de imagens
- [ ] Cache strategy

## 🔍 Testes Manuais

### Teste 1: Fluxo de Pedido Completo
1. Acessar site → Cardápio
2. Adicionar 2-3 produtos diferentes
3. Acessar carrinho
4. Preencher dados válidos
5. Selecionar endereço no mapa
6. Escolher forma de pagamento
7. Confirmar pedido

### Teste 2: Validações
1. Tentar checkout com e-mail inválido
2. Tentar checkout sem itens no carrinho
3. Tentar pagamento sem dados
4. Testar campos obrigatórios vazios

### Teste 3: Performance
1. Medir tempo de carregamento
2. Testar em mobile
3. Testar com conexão lenta
4. Verificar console para erros

### Teste 4: Error Scenarios
1. Desconectar internet durante uso
2. Simular erro de API
3. Testar com localStorage desativado

## 📊 Métricas Esperadas

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🐛 Bugs Conhecidos para Monitorar

- Performance em dispositivos low-end
- Conexões 3G/4G instáveis
- Compatibilidade com browsers antigos
- Problemas de CORS em produção

## ✅ Critérios de Aceite

O sistema está pronto para produção quando:
- Todos os fluxos críticos funcionam sem erros
- Performance está dentro das métricas esperadas
- Validações estão funcionando corretamente
- Error handling está operacional
- Integrações externas respondem bem
