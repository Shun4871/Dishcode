from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from langchain_openai import ChatOpenAI
from browser_use import Agent
from browser_use.browser.browser import Browser, BrowserConfig
from dotenv import load_dotenv
import asyncio
import urllib.parse

app = FastAPI()

# CORS ミドルウェアの設定
origins = [
    "http://localhost:8080",  # このオリジンからのリクエストを許可
    # 必要に応じて他のオリジンも追加できます
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

browser = Browser(
    config=BrowserConfig(
        headless=True,
    )
)

# browser-use の実行
async def search_recipes(conditions: List[str]):
    load_dotenv()

    task = (
    '以下の条件に合う日本語のレシピを3つ検索し、各レシピのURLを返してください。'
    '回答は必ずJSON形式で、以下のフォーマットに従い、他のテキストや説明を一切含まず、'
    'jsonオブジェクトのみを返してください \n'
    '{\n'
    '    "url1": "レシピ1のURL",\n'
    '    "url2": "レシピ2のURL",\n'
    '    "url3": "レシピ3のURL"\n'
    '}\n\n'
    + '\n'.join(f'- {condition}' for condition in conditions)
)

    agent = Agent(
        task=task,
        llm=ChatOpenAI(model="gpt-4o"),
        browser=browser,
    )

    history = await agent.run(max_steps=3)
    result = history.final_result()
    return result

# クエリパラメータを条件リストに変換
def parse_conditions(params):
    return [
        f"{params['people']}人分",
        f"オーブンを{'使用' if params['oven'] else '使用しない'}",
        f"フライパンで{'調理可能' if params['hotplate'] else '調理しない'}",
        f"ミキサーを{'使用' if params['mixer'] else '使用しない'}",
        f"{params['time']}分以内",
        f"トースターを{'使用' if params['toaster'] else '使用しない'}",
        f"圧力鍋を{'使用' if params['pressurecooker'] else '使用しない'}",
        urllib.parse.unquote(params['selected'])
    ]

# 生のクエリ文字列を扱い、先頭の "=" を取り除いてパースするエンドポイント
@app.get("/api-endpoint")
async def get_urls(request: Request):
    # 生のクエリ文字列を取得
    query = request.url.query
    # 先頭に "=" があれば除去
    if query.startswith("="):
        query = query[1:]
    # クエリ文字列をパース（値はリストになるので、最初の値を使う）
    parsed_params = urllib.parse.parse_qs(query)

    # パラメータ取得用のユーティリティ関数
    def get_value(key, type_func=str, default=None):
        values = parsed_params.get(key)
        if not values:
            return default
        try:
            return type_func(values[0])
        except Exception:
            return default

    try:
        people = get_value("people", int)
        oven = get_value("oven", lambda x: x.lower() == "true")
        hotplate = get_value("hotplate", lambda x: x.lower() == "true")
        mixer = get_value("mixer", lambda x: x.lower() == "true")
        time_val = get_value("time", int)
        toaster = get_value("toaster", lambda x: x.lower() == "true")
        pressurecooker = get_value("pressurecooker", lambda x: x.lower() == "true")
        selected = get_value("selected", str)
        if None in [people, oven, hotplate, mixer, time_val, toaster, pressurecooker, selected]:
            raise ValueError("Missing required parameter")
    except Exception as e:
        return JSONResponse(status_code=422, content={"detail": "Invalid or missing query parameters"})

    params = {
        "people": people,
        "oven": oven,
        "hotplate": hotplate,
        "mixer": mixer,
        "time": time_val,
        "toaster": toaster,
        "pressurecooker": pressurecooker,
        "selected": selected
    }

    conditions = parse_conditions(params)

    # 非同期処理で検索を実行
    result = await search_recipes(conditions)

    return JSONResponse(content={"result": str(result)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
