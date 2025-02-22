import httpx
import asyncio

async def fetch_recipes():
    async with httpx.AsyncClient(timeout=300.0) as client:  # 30秒に増加
        response = await client.get(
            'http://127.0.0.1:8000/api-endpoint',
            params={
                "people": 1,
                "oven": False,
                "hotplate": True,
                "mixer": False,
                "time": 15,
                "toaster": False,
                "pressurecooker": False,
                "selected": "牛肉"
            }
        )
        print(response.json())

asyncio.run(fetch_recipes())
