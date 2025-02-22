from fastapi import FastAPI
from fastapi.responses import JSONResponse
from typing import List
from langchain_openai import ChatOpenAI
from browser_use import Agent
from browser_use.browser.browser import Browser, BrowserConfig
from dotenv import load_dotenv
import asyncio
import urllib.parse

app = FastAPI()

browser = Browser(
	config=BrowserConfig(
		headless=True,
	)
)

# browser-use の実行
async def search_recipes(conditions: List[str]):
    load_dotenv()

    task = f'以下の条件に合う日本語のレシピを3つ検索し、URLを教えてください。回答はjson形式で、{{"url1":"link","url2":"link","url3":"link"}}\\のみにしてください。\n\n' + '\n'.join(f'- {condition}' for condition in conditions)

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

# apiの立ち上げ
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

    params = {
        "people": people,
        "oven": oven,
        "hotplate": hotplate,
        "mixer": mixer,
        "time": time,
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
    uvicorn.run(app, host="127.0.0.1", port=8080)
