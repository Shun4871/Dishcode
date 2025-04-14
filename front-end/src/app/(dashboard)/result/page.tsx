export const dynamic = "force-dynamic";

import { UrlWindow } from "@/components/ui/urlWindow";

interface RecipeItem {
  title: string;
  image: string;
  url: string;
}

async function fetchMetadata(url: string): Promise<{ title: string; image: string }> {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "タイトルが取得できませんでした";
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i);
    const image = ogImageMatch ? ogImageMatch[1].trim() : "";
    return { title, image };
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error);
    return { title: "タイトル取得エラー", image: "" };
  }
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: any; // 型チェック回避用のワークアラウンド
}) {
  // searchParams はプレーンなオブジェクトとして扱う
  const resolvedSearchParams = searchParams as { [key: string]: string | string[] | undefined };

  const url1 = typeof resolvedSearchParams.url1 === "string" ? resolvedSearchParams.url1 : undefined;
  const url2 = typeof resolvedSearchParams.url2 === "string" ? resolvedSearchParams.url2 : undefined;
  const url3 = typeof resolvedSearchParams.url3 === "string" ? resolvedSearchParams.url3 : undefined;

  const urls: string[] = [url1, url2, url3].filter((url): url is string => !!url);

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
      <button className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl mb-12">
        もう一回
      </button>
    </div>
  );
}