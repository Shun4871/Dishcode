import { UrlWindow } from "@/components/ui/urlWindow";

const urls = [
  "https://cookpad.com/jp/recipes/17662797",
  "https://mi-journey.jp/foodie/80782/",
  "https://delishkitchen.tv/recipes/233678306187149791",
  "https://www.kikkoman.co.jp/homecook/search/recipe/00055074/",
];

async function getMetadata(urls: string[]) {
  const params = new URLSearchParams();
  urls.forEach((url) => params.append("url", url));

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/metadata?${params.toString()}`, {
    cache: "no-store", // 必要ならキャッシュ無効化
  });

  if (!res.ok) {
    console.error("Failed to fetch metadata");
    return [];
  }

  const data = await res.json();
  return data;
}

export default async function Favorite() {
  const items = await getMetadata(urls);

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
