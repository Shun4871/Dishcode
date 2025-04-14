from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prompt_builder import prompt_builder
from search import search
from result_formatter import result_formatter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/search-agent-super-cool")
async def search_recipes(
    people: int = Query(...),
    oven: bool = Query(...),
    hotplate: bool = Query(...),
    mixer: bool = Query(...),
    time: int = Query(...),
    toaster: bool = Query(...),
    pressurecooker: bool = Query(...),
    selected: str = Query(...)
):
    # クエリパラメータを組み合わせてクエリ文字列を作成
    params = f"people={people}&oven={oven}&hotplate={hotplate}&mixer={mixer}&time={time}&toaster={toaster}&pressurecooker={pressurecooker}&selected={selected}"

    # プロンプトを生成
    prompt = prompt_builder(params)

    # レシピ検索
    result = await search(prompt)

    # 結果をフォーマット
    formatted_result = result_formatter(result)

    return formatted_result
