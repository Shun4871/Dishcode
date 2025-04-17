from langchain_openai import ChatOpenAI
from browser_use import Agent
from browser_use.browser.browser import Browser, BrowserConfig
from dotenv import load_dotenv

# Browserの設定
browser = Browser(
    config=BrowserConfig(
        headless=True,
    )
)

async def search_async(prompt: str):
    # 環境変数の読み込み
    load_dotenv()

    # エージェント作成
    agent = Agent(
        task=prompt,
        llm=ChatOpenAI(model="gpt-4o"),
        browser=browser,
    )

    # エージェントの実行
    result = await agent.run(max_steps=5)

    return result

async def search(prompt: str):
    return await search_async(prompt)
