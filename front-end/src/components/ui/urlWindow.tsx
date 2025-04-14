"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Recipe {
  title: string;
  image: string;
  url: string;
}

interface UrlWindowProps {
  recipes: Recipe[];
}

const UrlWindow: React.FC<UrlWindowProps> = ({ recipes }) => {
  // 各レシピの「いいね」状態を配列で管理
  const [favorites, setFavorites] = useState<boolean[]>(
    Array(recipes.length).fill(false) // 初期状態は全てお気に入り済みと仮定（後でAPI側から受け取る形にしてもOK）
  );

  // いいねボタンのトグル処理
  const toggleFavorite = async (index: number) => {
    const newFavorites = [...favorites];
    const recipe = recipes[index];

    try {
      if (newFavorites[index]) {
        // 現在いいね → 削除
        const res = await fetch("/api/favorite", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeURL: recipe.url }),
        });

        if (!res.ok) throw new Error("削除に失敗しました");

        newFavorites[index] = false;
      } else {
        // 現在いいねしてない → 追加
        const res = await fetch("/api/favorite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeURL: recipe.url }),
        });

        if (!res.ok) throw new Error("追加に失敗しました");

        newFavorites[index] = true;
      }

      setFavorites(newFavorites);
    } catch (err) {
      console.error("お気に入りの更新に失敗しました", err);
      alert("お気に入りの更新に失敗しました");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full justify-center items-center">
      {recipes.map((recipe, index) => (
        <div
          key={index}
          className="flex flex-row items-center border rounded-2xl p-6 shadow-md w-[600px]"
        >
          {/* 画像 */}
          <Image
            src={recipe.image}
            alt={recipe.title}
            width={180}
            height={180}
            className="rounded-lg"
          />

          {/* タイトル */}
          <div className="ml-4 flex-grow">
            <Link href={recipe.url} target="_blank" rel="noopener noreferrer">
              <h2 className="text-lg font-bold">{recipe.title}</h2>
            </Link>
          </div>

          {/* いいねボタン */}
          <div
            className="cursor-pointer"
            onClick={() => toggleFavorite(index)}
          >
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

export { UrlWindow };
