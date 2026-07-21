# Deployment Guide - Anne & Tom Pizzaria

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Environment variables configured

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.production
   ```

2. **Configure production variables:**
   ```bash
   # API Configuration
   REACT_APP_AT_API_BASE_URL=https://pdv.axionenterprise.cloud/annetom/api
   REACT_APP_AT_API_KEY=your_production_api_key
   REACT_APP_PUBLIC_API_TOKEN=your_production_token
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
   REACT_APP_DELIVERY_ORIGIN=Pizzaria Anne & Tom, Alto de Santana, Sao Paulo
   REACT_APP_AXIONPAY_API_KEY=your_axionpay_key
   REACT_APP_AXIONPAY_BASE_URL=https://pay.axionenterprise.cloud
   REACT_APP_AXIONPAY_PAY_TAG=your_production_tag
   PRIVATE_API_TOKEN=your_private_token
   ```

### Build Process

1. **Install dependencies:**
   ```bash
   npm ci --production
   ```

2. **Run tests:**
   ```bash
   npm run test:ci
   ```

3. **Lint code:**
   ```bash
   npm run lint
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Analyze bundle size (optional):**
   ```bash
   npm run build:analyze
   ```

### Deployment Options

#### Static Hosting (Vercel, Netlify, AWS S3)

1. **Deploy build folder:**
   ```bash
   # The build/ folder contains the optimized production files
   # Upload this folder to your hosting provider
   ```

2. **Configure redirects:**
   - Ensure SPA routing is configured
   - All routes should redirect to index.html

#### Docker Deployment

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Security Considerations

- ✅ Environment variables are properly configured
- ✅ API keys are not exposed in client-side code
- ✅ Error boundaries implemented
- ✅ Input validation in place
- ✅ Rate limiting utilities available
- ✅ CSRF protection utilities included

### Performance Optimizations

- ✅ Lazy loading implemented for all routes
- ✅ Code splitting optimized
- ✅ Web Vitals monitoring
- ✅ Image optimization utilities
- ✅ Bundle size analysis tools

### Monitoring & Logging

- ✅ Structured logging implemented
- ✅ Error boundaries with detailed logging
- ✅ Performance metrics collection
- ✅ Web Vitals reporting

### Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test all critical user flows
- [ ] Check error monitoring dashboard
- [ ] Verify performance metrics
- [ ] Test payment integration
- [ ] Validate API connectivity
- [ ] Check mobile responsiveness
- [ ] Test accessibility features

### Rollback Plan

1. **Keep previous build backup**
2. **Monitor error rates for 24 hours**
3. **Have hotfix process ready**
4. **Database backup verification**

### Support & Monitoring

- Monitor error rates in production
- Track performance metrics
- Set up alerts for critical failures
- Regular security audits
- Performance optimization reviews

## 📞 Emergency Contacts

- Development Team: [Contact Info]
- Infrastructure Team: [Contact Info]
- Business Team: [Contact Info]
