// ファイル例：pages/favorite.tsx
import { UrlWindow, Recipe } from "@/components/ui/urlWindow";
import Link from "next/link";

export const runtime = "edge";

async function getFavorites(): Promise<Recipe[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    console.error("お気に入り取得失敗:", res.statusText);
    return [];
  }
  const data = await res.json();
  return data;
}

export default async function FavoritePage() {
  const favorites = await getFavorites();

  return (
    <div className="mt-16 flex flex-col gap-6 w-full justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">お気に入りレシピ一覧</h1>
      {/* サーバー側で取得した favorites を UrlWindow に渡す */}
      <UrlWindow recipes={favorites} />
      <Link href="/">
        <button className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl mb-12">
          ホームに戻る
        </button>
      </Link>
    </div>
  );
}
