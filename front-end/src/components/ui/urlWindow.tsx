// ファイル例：components/ui/UrlWindow.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [favorites, setFavorites] = useState<boolean[]>(Array(recipes.length).fill(false));

  // 初回レンダリング時に、必要であればお気に入り状態を取得
  useEffect(() => {
    // ログインしている場合のみAPIからお気に入り情報を取得する
    if (!userId) return;
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`/api/favorite/${userId}`);
        if (res.ok) {
          const data = await res.json();
          // data はお気に入りレシピの配列（各お気に入りオブジェクトに recipeURL があると想定）
          const favoriteURLs: string[] = data.map((fav: any) => fav.recipeURL);
          const newFavorites = recipes.map(recipe => favoriteURLs.includes(recipe.url));
          setFavorites(newFavorites);
        }
      } catch (err) {
        console.error("お気に入り取得エラー:", err);
      }
    };
    fetchFavorites();
  }, [userId, recipes]);

  // お気に入りボタンのトグル処理
  const toggleFavorite = async (index: number) => {
    // ログインしていない場合はログインページにリダイレクト
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const newFavorites = [...favorites];
    const recipe = recipes[index];

    try {
      if (newFavorites[index]) {
        // お気に入り削除：DELETE リクエスト
        const res = await fetch("/api/favorite", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeURL: recipe.url }),
        });
        if (!res.ok) throw new Error("削除失敗");
        newFavorites[index] = false;
      } else {
        // お気に入り追加：POST リクエスト
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
          {/* レシピ画像 */}
          <Image
            src={recipe.image}
            alt={recipe.title}
            width={180}
            height={180}
            className="rounded-lg"
          />
          {/* タイトルとリンク */}
          <div className="ml-4 flex-grow">
            <Link href={recipe.url} target="_blank" rel="noopener noreferrer">
              <h2 className="text-lg font-bold">{recipe.title}</h2>
            </Link>
          </div>
          {/* お気に入りボタン */}
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
