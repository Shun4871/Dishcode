# === Build Stage ===
FROM node:20-alpine AS builder
WORKDIR /app

# 必要なツールのインストール
RUN apk add --no-cache bash curl

# package.json と package-lock.json のコピー（npm 用）
COPY package*.json ./

# npm を使って依存関係をインストール
RUN npm ci --quiet --no-fund --no-audit

COPY public ./public
COPY . .

RUN npm run build

# === Production Stage ===
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]