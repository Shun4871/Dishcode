# === Build Stage ===
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# 🔽 config.json を含む public フォルダを確実にコピー
COPY public ./public
COPY . .
RUN npm run build

# === Production Stage ===
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 🔽 明示的に public を再度 COPY（確実に config.json を含むように）
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
#COPY .env.production .env.production  

EXPOSE 3000
CMD ["npm", "start"]