# syntax=docker/dockerfile:1

########################################
# 1) Builder ステージ
########################################
FROM python:3.11-slim AS builder
WORKDIR /app

# システム依存ライブラリ
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libpango-1.0-0 libpangocairo-1.0-0 \
    libasound2 libgdk-pixbuf2.0-0 libgtk-3-0 curl gnupg \
 && rm -rf /var/lib/apt/lists/*

# Python依存関係をインストール
COPY requirements.txt .
RUN python -m venv /opt/venv \
 && . /opt/venv/bin/activate \
 && pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Playwright のインストール（ブラウザと依存ライブラリ）
RUN . /opt/venv/bin/activate \
 && pip install --no-cache-dir playwright \
 && playwright install --with-deps

# ← ここで “ソースコードを丸ごとコピー”
COPY . .

########################################
# 2) Runtime ステージ
########################################
FROM python:3.11-slim
WORKDIR /app

# 仮想環境とコードを引き継ぎ
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app

ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
