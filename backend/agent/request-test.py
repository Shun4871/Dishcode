import httpx

async def main():
    async with httpx.AsyncClient() as client:
        response = await client.get('http://127.0.0.1:8000/your-api-endpoint?people=1&oven=false&hotplate=true&mixer=false&time=15&toaster=false&pressurecooker=false&selected=%25E7%2589%259B%25E8%2582%2589')

        print("ステータスコード:", response.status_code)
        print("レスポンスデータ:", response.json())

import asyncio
asyncio.run(main())
