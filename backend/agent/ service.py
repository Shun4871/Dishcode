from langchain_openai import ChatOpenAI
from browser_use import Agent
from dotenv import load_dotenv
import re

load_dotenv()

async def service(conditions: dict):
    condition_list = [
        f"オーブンを{'使用' if conditions['oven'] else '使用しない'}",
        f"フライパンで{'調理可能' if conditions['hotplate'] else '調理しない'}",
        f"ミキサーを{'使用' if conditions['mixer'] else '使用しない'}",
        f"{conditions['time']}分以内",
        f"トースターを{'使用' if conditions['toaster'] else '使用しない'}",
        f"圧力鍋を{'使用' if conditions['pressurecooker'] else '使用しない'}",
        conditions['selected'],
    ]

    prompt = f"以下の条件に合う日本語のレシピを3つ検索し、URLを教えてください。\n\n" + "\n".join(f"- {condition}" for condition in condition_list)

    agent = Agent(
        task=prompt,
        llm=ChatOpenAI(model="gpt-4o"),
    )

    result = await agent.run()
    return result
