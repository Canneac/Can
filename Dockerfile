# NUVESSA — üretim imajı (Railway, Render, Fly.io ve benzeri Docker destekli sağlayıcılar için).
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build
# Kalıcı disk /data klasörüne bağlanmalıdır (veritabanı, yedekler ve yüklenen görseller burada durur).
ENV NUVESSA_DATA_DIR=/data PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p ${PORT}"]
