FROM python:3.13.0

WORKDIR /agent

# 依存パッケージのコピーとインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードのコピー
COPY agent .

# 必要なポートの公開（オプション）
EXPOSE 8000

# コンテナ起動時に uvicorn で FastAPI アプリを実行
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
