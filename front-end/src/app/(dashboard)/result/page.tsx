import { UrlWindow } from "@/components/ui/urlWindow";

interface RecipeItem {
  title: string;
  image: string;
  url: string;
}

// 指定の URL の HTML からタイトルと og:image を抽出する関数
async function fetchMetadata(url: string): Promise<{ title: string; image: string }> {
  try {
    const res = await fetch(url);
    const html = await res.text();

    // <title> タグからタイトルを抽出
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "タイトルが取得できませんでした";

    // <meta property="og:image" ...> タグから画像 URL を抽出
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i);
    const image = ogImageMatch ? ogImageMatch[1].trim() : ""; // 画像が取得できなければ空文字またはデフォルト画像を設定

    return { title, image };
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error);
    return { title: "タイトル取得エラー", image: "" };
  }
}

// interface ResultPageProps {
//   searchParams: {
//     [key: string]: string | string[] | undefined;
//   };
// }

type ResultPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  // クエリパラメータから各 URL を文字列として取得
  const url1 = typeof searchParams.url1 === "string" ? searchParams.url1 : undefined;
  const url2 = typeof searchParams.url2 === "string" ? searchParams.url2 : undefined;
  const url3 = typeof searchParams.url3 === "string" ? searchParams.url3 : undefined;

  // undefined でない URL のみを配列にする
  const urls: string[] = [url1, url2, url3].filter((url): url is string => !!url);

  // 各 URL から metadata を取得し、RecipeItem を生成
  const items: RecipeItem[] = await Promise.all(
    urls.map(async (url) => {
      const { title, image } = await fetchMetadata(url);
      return { title, image, url };
    })
  );

  return (
    <div className="mt-16 flex flex-col gap-6 w-full justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">おすすめレシピ</h1>
      <UrlWindow recipes={items} />
      {/* もう一回ボタン */}
      <button className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl mb-12">
        もう一回
      </button>
    </div>
  );
}
