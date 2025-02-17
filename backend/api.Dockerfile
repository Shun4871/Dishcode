FROM hono:latest

WORKDIR /hono

RUN # ベースイメージ（Node.js公式）
FROM node:20-slim AS builder

# 環境変数設定
ENV NODE_ENV=production

# 作業ディレクトリの設定
WORKDIR /app

# パッケージ情報をコピー
COPY hono/package*.json ./

# npmで依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY hono/tsconfig.json ./
COPY hono/src ./src

# TypeScriptをビルド
RUN bun install -g typescript && tsc

# ──────────────────────────────────────────────────────
# 本番用イメージ
FROM node:20-slim AS runner

# 環境変数設定
ENV NODE_ENV=production

# 作業ディレクトリ設定
WORKDIR /app

# 依存関係のみコピー
COPY --from=builder /app/node_modules ./node_modules

# ビルド成果物をコピー
COPY --from=builder /app/dist ./dist

# ポートを公開
EXPOSE 8080

# 起動コマンド
CMD ["node", "./dist/index.js"]
