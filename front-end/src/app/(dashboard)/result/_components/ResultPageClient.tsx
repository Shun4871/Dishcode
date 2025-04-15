"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UrlWindow } from "@/components/ui/urlWindow";

interface RecipeItem {
  title: string;
  image: string;
  url: string;
}

export function ResultPageClient() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<RecipeItem[]>([]);

  const url1 = searchParams.get("url1") || undefined;
  const url2 = searchParams.get("url2") || undefined;
  const url3 = searchParams.get("url3") || undefined;

  const fetchAllMetadata = async (urls: string[]): Promise<RecipeItem[]> => {
    const query = urls.map((url) => `url=${encodeURIComponent(url)}`).join("&");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/metadata?${query}`);
      if (!res.ok) throw new Error("Failed to fetch metadata");

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching metadata:", error);
      return urls.map((url) => ({
        title: "取得エラー",
        image: "",
        url,
      }));
    }
  };

  useEffect(() => {
    const urls: string[] = [url1, url2, url3].filter((url): url is string => !!url);

    const fetchAll = async () => {
      const results = await fetchAllMetadata(urls);
      setItems(results);
    };

    if (urls.length > 0) {
      fetchAll();
    }
  }, [url1, url2, url3]);

  return (
    <div className="mt-16 flex flex-col gap-6 w-full justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">おすすめレシピ</h1>
      <UrlWindow recipes={items} />
      <button
        onClick={() => (window.location.href = "/")}
        className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl mb-12"
      >
        もう一回
      </button>
    </div>
  );
}
