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
  const [favorites, setFavorites] = useState<boolean[]>(Array(recipes.length).fill(false));

  // いいねボタンのトグル
  const toggleFavorite = (index: number) => {
    setFavorites((prev) => prev.map((fav, i) => (i === index ? !fav : fav)));
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

export default UrlWindow;