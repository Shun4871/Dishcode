// ファイル例：components/ui/UrlWindow.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export interface Recipe {
  title: string;
  image: string;
  url: string;
}

interface UrlWindowProps {
  recipes: Recipe[];
}

export const UrlWindow: React.FC<UrlWindowProps> = ({ recipes }) => {
  const { userId } = useAuth();
  const [favorites, setFavorites] = useState<boolean[]>(Array(recipes.length).fill(false));

  // 初回マウント時に Hono サーバーからお気に入り状態を取得
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      try {
        const res = await fetch("/api/favorite/" + userId);
        // ※ Hono 側は GET /favorites を用意しているため、
        // 次の行は不要。ここではサーバー側のトグル済み状態との整合性を例示するために残しておきます。
        // 実際は FavoritePage の取得結果 (favorites) が UrlWindow に渡されるため、ここでの更新は不要です。
      } catch (err) {
        console.error("お気に入り取得エラー:", err);
      }
    };
    fetchFavorites();
  }, [userId, recipes]);

  // お気に入りのトグル処理（POST / DELETE で Hono サーバーに更新）
  const toggleFavorite = async (index: number) => {
    const newFavorites = [...favorites];
    const recipe = recipes[index];

    try {
      if (newFavorites[index]) {
        const res = await fetch("/api/favorite", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeURL: recipe.url }),
        });
        if (!res.ok) throw new Error("削除失敗");
        newFavorites[index] = false;
      } else {
        const res = await fetch("/api/favorite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeURL: recipe.url }),
        });
        if (!res.ok) throw new Error("追加失敗");
        newFavorites[index] = true;
      }
      setFavorites(newFavorites);
    } catch (err) {
      console.error("お気に入り更新エラー:", err);
      alert("お気に入りの更新に失敗しました");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full justify-center items-center">
      {recipes.map((recipe, index) => (
        <div key={index} className="flex flex-row items-center border rounded-2xl p-6 shadow-md w-[600px]">
          <Image
            src={recipe.image}
            alt={recipe.title}
            width={180}
            height={180}
            className="rounded-lg"
          />
          <div className="ml-4 flex-grow">
            <Link href={recipe.url} target="_blank" rel="noopener noreferrer">
              <h2 className="text-lg font-bold">{recipe.title}</h2>
            </Link>
          </div>
          <div className="cursor-pointer" onClick={() => toggleFavorite(index)}>
            <Image
              src={favorites[index] ? "/like-star.svg" : "/not-like-star.svg"}
              alt="like icon"
              width={40}
              height={40}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
