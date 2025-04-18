from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def result_formatter(text: str):
    prompt = f"""与えるテキストから3つのurlを摘出してください。
    https://www.yahoo.co.jp/で検索してください、
    フォーマットは以下のようにして、余分な改行やスペースは入れないようにしてください。
    {{"url1":"https://sample.url.1","url2":"https://sample.url.2","url3":"https://sample.url.3"}}
    抽出元のテキスト: {text}
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    # 実行確認ログ
    print(f"formatter: {response}")

    return(response.choices[0].message.content.strip())
