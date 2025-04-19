"use client";

import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <Flex className="flex-col gap-10 m-20">
        <Load />
      </Flex>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full justify-center items-center">
      {recipes.map((recipe, index) => (
        <div
          key={index}
          className="flex flex-row items-center border rounded-2xl p-6 shadow-md w-[600px]"
        >
          <Image
            src={recipe.image}
            alt={recipe.title}
            width={180}
            height={180}
            className="rounded-lg"
          />
          <div className="ml-4 flex-grow">
            <Link
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2 className="text-lg font-bold hover:underline">
                {recipe.title}
              </h2>
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
