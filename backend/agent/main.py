from service import service
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()
@app.get("/api-endpoint")

async def main(
    people: int,
    oven: bool,
    hotplate: bool,
    mixer: bool,
    time: int,
    toaster: bool,
    pressurecooker: bool,
    selected: str
):
    # デコード
    decoded_selected = urllib.parse.unquote(selected)

    conditions = {
        "people": people,
        "oven": oven,
        "hotplate": hotplate,
        "mixer": mixer,
        "time": time,
        "toaster": toaster,
        "pressurecooker": pressurecooker,
        "selected": decoded_selected
    }

    results = await service(conditions)

    response = {
        "results": results,
        "conditions": conditions,
    }

    return JSONResponse(content=response)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
