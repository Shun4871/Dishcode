# syntax=docker/dockerfile:1

########################################
# 1) Builder ステージ
########################################
FROM python:3.11-slim AS builder
WORKDIR /app

# 必要なシステムライブラリ（Playwright用）を先にインストール
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libpango-1.0-0 libpangocairo-1.0-0 \
    libasound2 libgdk-pixbuf2.0-0 libgtk-3-0 curl gnupg \
 && rm -rf /var/lib/apt/lists/*

# Python 依存関係を仮想環境にインストール
COPY requirements.txt .
RUN python -m venv /opt/venv \
 && . /opt/venv/bin/activate \
 && pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt playwright

# Playwright のブラウザを /ms-playwright にダウンロード
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN . /opt/venv/bin/activate \
 && python -m playwright install --with-deps

# アプリケーションコードをコピー
COPY . .

########################################
# 2) Runtime ステージ
########################################
FROM python:3.11-slim
WORKDIR /app

# ランタイムにも同じシステムライブラリを入れておく
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libpango-1.0-0 libpangocairo-1.0-0 \
    libasound2 libgdk-pixbuf2.0-0 libgtk-3-0 \
 && rm -rf /var/lib/apt/lists/*

# ビルダーから venv・アプリ・ブラウザキャッシュ を引き継ぎ
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app
COPY --from=builder /ms-playwright /ms-playwright

ENV PATH="/opt/venv/bin:$PATH"
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
