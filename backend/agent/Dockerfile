# syntax=docker/dockerfile:1

########################################
# 1) Builder ステージ（依存関係をキャッシュ）
########################################
FROM python:3.11-slim AS builder

WORKDIR /app

# システムパッケージ更新＋Playwright のネイティブ依存を先に入れておく
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
       libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
       libxrandr2 libgbm1 libpango-1.0-0 libpangocairo-1.0-0 \
       libasound2 libgdk-pixbuf2.0-0 libgtk-3-0 curl gnupg \
    && rm -rf /var/lib/apt/lists/*

# Python 依存関係をインストール
COPY requirements.txt .
RUN python -m venv /opt/venv \
    && . /opt/venv/bin/activate \
    && pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Playwright のブラウザと依存ライブラリをインストール
RUN . /opt/venv/bin/activate \
    && pip install --no-cache-dir playwright \
    && playwright install --with-deps

########################################
# 2) Runtime ステージ（最終イメージをスリム化）
########################################
FROM python:3.11-slim

WORKDIR /app

# Builder から venv とコードをコピー
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app

ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# アプリのポート
EXPOSE 8000

# 実行コマンド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
