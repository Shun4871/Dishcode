import httpx

async def main():
    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.get('http://127.0.0.1:8000/api-endpoint?people=1&oven=false&hotplate=true&mixer=false&time=15&toaster=false&pressurecooker=false&selected=牛肉')

        print("ステータスコード:", response.status_code)
        print("レスポンスデータ:", response.json())

import asyncio
asyncio.run(main())
