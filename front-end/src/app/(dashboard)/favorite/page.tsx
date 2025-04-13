import { UrlWindow } from "@/components/ui/urlWindow";

// レシピのURLリスト（ここにURLを追加）
const urls = [
  "https://cookpad.com/jp/recipes/17662797",
  "https://mi-journey.jp/foodie/80782/",
  "https://delishkitchen.tv/recipes/233678306187149791",
  "https://www.kikkoman.co.jp/homecook/search/recipe/00055074/",

];

// 指定のURLのHTMLからタイトルとog:imageを抽出する関数
async function fetchMetadata(url: string): Promise<{ title: string; image: string }> {
  try {
    const res = await fetch(url);
    const html = await res.text();

    // <title> タグからタイトルを抽出
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "タイトルが取得できませんでした";

    // <meta property="og:image" ...> タグから画像URLを抽出
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i);
    const image = ogImageMatch ? ogImageMatch[1].trim() : ""; // 画像が取得できなければ空文字

    return { title, image };
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error);
    return { title: "タイトル取得エラー", image: "" };
  }
}

// ページコンポーネント
export default async function Page() {
  // 各URLからmetadataを取得し、レシピアイテムを生成
  const items = await Promise.all(
    urls.map(async (url) => {
      const { title, image } = await fetchMetadata(url);
      return { title, image, url };
    })
  );
  return (
    <div className="mt-16 flex flex-col gap-6 w-full justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">おすすめレシピ</h1>
      <UrlWindow recipes={items} />
      <button className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl mb-12">
        もう一回
      </button>
    </div>
  );
}
