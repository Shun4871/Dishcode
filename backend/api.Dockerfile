FROM python:3.13.0

WORKDIR /agent

# 依存パッケージのコピーとインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 必要なOSライブラリのインストール（Playwright実行に必要）
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libxi6 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
 && apt-get clean

RUN playwright install-deps
RUN playwright install

# .env ファイルのコピー（必要な場合）
COPY /agent/.env .

# アプリケーションコードのコピー
COPY agent .

# 必要なポートの公開
EXPOSE 8000

# コンテナ起動時に uvicorn で FastAPI アプリを実行
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
