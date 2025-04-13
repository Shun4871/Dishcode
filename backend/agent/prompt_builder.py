import urllib.parse

def prompt_builder(params: str) -> str:
    parsed_params = urllib.parse.parse_qs(params)

    conditions = [
        f"人数: {parsed_params.get('people', [''])[0]}人",
        f"オーブン: {'必要' if parsed_params.get('oven', ['false'])[0].lower() == 'true' else '不要'}",
        f"ホットプレート: {'必要' if parsed_params.get('hotplate', ['false'])[0].lower() == 'true' else '不要'}",
        f"ミキサー: {'必要' if parsed_params.get('mixer', ['false'])[0].lower() == 'true' else '不要'}",
        f"調理時間: {parsed_params.get('time', [''])[0]}分",
        f"トースター: {'必要' if parsed_params.get('toaster', ['false'])[0].lower() == 'true' else '不要'}",
        f"圧力鍋: {'必要' if parsed_params.get('pressurecooker', ['false'])[0].lower() == 'true' else '不要'}",
        f"選択された食材: {urllib.parse.unquote(parsed_params.get('selected', [''])[0])}"
    ]

    prompt = "以下の条件を満たすレシピを3つ検索してください。条件ちょっと妥協してでも3つのレシピのURLを用意してほしいです。\n" + "、".join(conditions)

    return prompt
