# ─────────────────────────────────────────────
# Etapa 1: build
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifests primero (mejor cache)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto
COPY . .

# Build de producción
RUN npm run build -- --configuration=production

# ─────────────────────────────────────────────
# Etapa 2: Nginx
# ─────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copiar config personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build
COPY --from=builder /app/dist/admin-web/browser /usr/share/nginx/html

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O- http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]