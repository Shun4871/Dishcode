# ベースイメージとしてPythonを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# requirements.txtをコンテナにコピー
COPY requirements.txt .

# 必要なパッケージをインストール
RUN pip install --no-cache-dir -r requirements.txt

# Playwright関連のインストール
RUN playwright install
RUN playwright install-deps

# プロジェクトのソースコードをコンテナにコピー
COPY . .

# ポートを公開
EXPOSE 8000

# スクリプトを実行するコマンドを指定
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
