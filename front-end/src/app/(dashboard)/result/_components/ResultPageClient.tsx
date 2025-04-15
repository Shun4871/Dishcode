// ファイル例：pages/result.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UrlWindow, Recipe } from "@/components/ui/urlWindow";
import Link from "next/link";

export default function ResultPageClient() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Recipe[]>([]);

  // URLパラメータからレシピURLを取得
  const url1 = searchParams.get("url1") || undefined;
  const url2 = searchParams.get("url2") || undefined;
  const url3 = searchParams.get("url3") || undefined;

  // メタデータを取得する関数
  const fetchAllMetadata = async (urls: string[]): Promise<Recipe[]> => {
    const query = urls.map(url => `url=${encodeURIComponent(url)}`).join("&");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/metadata?${query}`);
      if (!res.ok) throw new Error("メタデータ取得失敗");
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("メタデータ取得エラー:", error);
      // 失敗時はエラーメッセージ付きのダミーデータを返す
      return urls.map(url => ({
        title: "取得エラー",
        image: "",
        url,
      }));
    }
  };

  useEffect(() => {
    const urls: string[] = [url1, url2, url3].filter((url): url is string => !!url);
    if (urls.length > 0) {
      fetchAllMetadata(urls).then(results => {
        setItems(results);
      });
    }
  }, [url1, url2, url3]);

  return (
    <div className="mt-16 flex flex-col gap-6 w-full justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">検索結果</h1>
      <UrlWindow recipes={items} />
      <Link href="/">
        <button className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl mb-12">
          もう一回
        </button>
      </Link>
    </div>
  );
}
