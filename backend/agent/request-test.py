import httpx
import asyncio

async def fetch_recipes():
    async with httpx.AsyncClient(timeout=600.0) as client:
        response = await client.get('http://127.0.0.1:8000/api-endpoint?people=1&oven=false&hotplate=true&mixer=false&time=15&toaster=false&pressurecooker=false&selected=%E7%89%9B%E8%82%89')
        print(response.json())

asyncio.run(fetch_recipes())
