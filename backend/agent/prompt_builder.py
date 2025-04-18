import urllib.parse

def prompt_builder(params: str) -> str:
    parsed_params = urllib.parse.parse_qs(params)

    selected = urllib.parse.unquote_plus(parsed_params.get('selected', [''])[0])
    people = parsed_params.get('people', [''])[0]
    time = parsed_params.get('time', [''])[0]
    oven = parsed_params.get('oven', ['false'])[0].lower()
    hotplate = parsed_params.get('hotplate', ['false'])[0].lower()

    conditions = [
        f"選択された食材：{selected}",
        f"人数：{people}人",
        f"調理時間：{time}分",
    ]

    if oven != 'true':
        conditions.append("オーブン：不要")
    if hotplate != 'true':
        conditions.append("ホットプレート：不要")

    prompt = (
        "以下の条件を満たすレシピを3つ検索してください。"
        "Yahooなど、Google以外の検索エンジンで検索してください。"
        "条件を多少妥協してでも、必ず3つのレシピのURLを出力してください。\n"
        f"""フォーマットは以下の通りです。\n
        {{"url1":"https://sample.url.1","url2":"https://sample.url.2","url3":"https://sample.url.3"}}
        + "、".join(conditions)"""
    )

    return prompt
