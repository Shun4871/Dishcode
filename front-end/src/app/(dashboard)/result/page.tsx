"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UrlWindow } from "@/components/ui/urlWindow";

interface RecipeItem {
  title: string;
  image: string;
  url: string;
}

async function fetchMetadata(url: string): Promise<RecipeItem> {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i);

    return {
      title: titleMatch?.[1]?.trim() ?? "タイトル取得できませんでした",
      image: ogImageMatch?.[1]?.trim() ?? "",
      url,
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error);
    return { title: "タイトル取得エラー", image: "", url };
  }
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<RecipeItem[]>([]);

  useEffect(() => {
    // ✅ あなたの意図通り typeof チェック付きで URL を取得
    const url1 = typeof searchParams.get("url1") === "string" ? searchParams.get("url1")! : undefined;
    const url2 = typeof searchParams.get("url2") === "string" ? searchParams.get("url2")! : undefined;
    const url3 = typeof searchParams.get("url3") === "string" ? searchParams.get("url3")! : undefined;

    const urls = [url1, url2, url3].filter((url): url is string => !!url);

    const loadMetadata = async () => {
      const results = await Promise.all(urls.map(fetchMetadata));
      setItems(results);
    };

    loadMetadata();
  }, [searchParams]);

  
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
