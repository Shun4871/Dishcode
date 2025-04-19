"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Load } from "@/components/Load";
import { Flex } from "@/components/ui/flex";

export interface Recipe {
  title: string;
  image: string;
  url: string;
}

interface UrlWindowProps {
  recipes: Recipe[];
}

export const UrlWindow: React.FC<UrlWindowProps> = ({ recipes }) => {
  const { userId, getToken } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<boolean[]>(
    Array(recipes.length).fill(false)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ログインしていなければ、全て false のまま読み込み完了にする
    if (!userId) {
      setFavorites(Array(recipes.length).fill(false));
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        recipes.map(async (recipe) => {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/favorite/check?recipeURL=${encodeURIComponent(
                recipe.url
              )}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const data = await res.json();
            return !!data.isFavorite;
          } catch (err) {
            console.error("お気に入り状態の取得に失敗:", err);
            return false;
          }
        })
      );

      setFavorites(results);
      setLoading(false);
    };

    fetchFavorites();
  }, [recipes, userId, getToken]);

  const toggleFavorite = async (index: number) => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const token = await getToken();
    if (!token) {
      alert("トークン取得に失敗しました");
      return;
    }

    const newFavorites = [...favorites];
    const recipe = recipes[index];

    try {
      const method = newFavorites[index] ? "DELETE" : "POST";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/favorite`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipeURL: recipe.url }),
        }
      );

      if (!res.ok) throw new Error(`${method === "POST" ? "追加" : "削除"}失敗`);

      newFavorites[index] = !newFavorites[index];
      setFavorites(newFavorites);
    } catch (err) {
      console.error("お気に入り更新エラー:", err);
      alert("お気に入りの更新に失敗しました");
    }
  };
  const handleShare = async (recipe: Recipe) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          url: recipe.url,
        });
      } catch (err) {
        console.warn("シェアに失敗しました:", err);
      }
    } else {
      // Fallback: URLをコピー
      await navigator.clipboard.writeText(recipe.url);
      alert("レシピURLをクリップボードにコピーしました");
    }
  };

  if (loading) {
    return (
      <Flex className="flex-col gap-10 m-20">
        <Load />
      </Flex>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full items-center px-8">
      {recipes.map((recipe, idx) => (
        <div
          key={idx}
          className="
            relative flex flex-col md:flex-row
            items-start md:items-center
            border rounded-2xl
            p-4 md:p-6 shadow-md
            w-full max-w-xl
            pb-4 md:pb-12       /* <- モバイルは下余白4, md以上は12 */
          "
        >
          {/* 画像＋モバイルボタン */}
          <div
            className="
              relative
              w-full md:w-1/3
              h-32 md:h-full
              md:aspect-square
              rounded-lg overflow-hidden
              flex-shrink-0
            "
          >
            {/* モバイル時：右下に配置 */}
            <div className="absolute bottom-2 right-2 flex space-x-2 md:hidden z-10">
              <button
                onClick={() => toggleFavorite(idx)}
                className="p-1 bg-white rounded-full shadow-md"
                aria-label="お気に入り切り替え"
              >
                <Image
                  src={favorites[idx] ? "/like-star.svg" : "/not-like-star.svg"}
                  alt="like icon"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </button>
              <button
                onClick={() => handleShare(recipe)}
                className="p-1 bg-white rounded-full shadow-md"
                aria-label="共有"
              >
                <Share2 size={28} />
              </button>
            </div>
  
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
  
          {/* テキスト部分 */}
          <div className="mt-4 md:mt-0 md:ml-6 flex-grow md:h-24 overflow-hidden">
            <Link href={recipe.url} target="_blank" rel="noopener noreferrer">
              <h2 className="text-lg font-bold hover:underline line-clamp-2">
                {recipe.title}
              </h2>
            </Link>
          </div>
  
          {/* デスクトップ時のボタン配置 */}
          <div className="hidden md:flex absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={() => toggleFavorite(idx)}
              className="p-1 bg-white rounded-full shadow-md"
              aria-label="お気に入り切り替え"
            >
              <Image
                src={favorites[idx] ? "/like-star.svg" : "/not-like-star.svg"}
                alt="like icon"
                width={28}
                height={28}
                className="object-contain"
              />
            </button>
            <button
              onClick={() => handleShare(recipe)}
              className="p-1 bg-white rounded-full shadow-md"
              aria-label="共有"
            >
              <Share2 size={28} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
  
  
  
  
};
