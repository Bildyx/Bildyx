# =========================
# 1. BUILD TYPESCRIPT
# =========================
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# =========================
# 2. PHP + APACHE
# =========================
FROM php:8.3-apache

RUN a2enmod rewrite

WORKDIR /var/www/html

COPY --from=build /app/ /var/www/html/

# On ne garde pas les dépendances/build tools Node en production
RUN rm -rf /var/www/html/node_modules \
    && rm -f /var/www/html/package.json \
    && rm -f /var/www/html/esbuild.config.mjs \
    && rm -f /var/www/html/tsconfig.json \
    && find /var/www/html/js -maxdepth 1 -type f -name '*.ts' -delete

EXPOSE 80