from fastapi import FastAPI
from fastapi.responses import JSONResponse
from typing import List
from langchain_openai import ChatOpenAI
from browser_use import Agent
from dotenv import load_dotenv
import asyncio

app = FastAPI()

async def search_recipes(conditions: List[str]):
    load_dotenv()

    prompt = f"以下の条件に合う日本語のレシピを3つ検索し、URLを教えてください。\n\n" + "\n".join(f"- {condition}" for condition in conditions)

    agent = Agent(
        task=prompt,
        llm=ChatOpenAI(model="gpt-4o"),
    )

    result = await agent.run()
    return result

@app.get("/api-endpoint")
async def get_urls(
    people: int,
    oven: bool,
    hotplate: bool,
    mixer: bool,
    time: int,
    toaster: bool,
    pressurecooker: bool,
    selected: str
):
    # クエリパラメータを条件リストに変換
    conditions = [
        f"{people}人分",
        f"オーブンを{'使用' if oven else '使用しない'}",
        f"フライパンで{'調理可能' if hotplate else '調理しない'}",
        f"ミキサーを{'使用' if mixer else '使用しない'}",
        f"{time}分以内",
        f"トースターを{'使用' if toaster else '使用しない'}",
        f"圧力鍋を{'使用' if pressurecooker else '使用しない'}",
        selected
    ]

    # 非同期処理で検索を実行
    result = await search_recipes(conditions)

    return JSONResponse(content=result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
