"use client";
import { useState } from "react";
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
  const { userId, getToken } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<boolean[]>(Array(recipes.length).fill(false));

  const toggleFavorite = async (index: number) => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    // Obtain the Clerk token
    const token = await getToken();

    const newFavorites = [...favorites];
    const recipe = recipes[index];

    try {
      if (newFavorites[index]) {
        // Remove favorite: DELETE /api/favorite
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/favorite`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Added Clerk token
          },
          body: JSON.stringify({ recipeURL: recipe.url }),
        });
        if (!res.ok) throw new Error("削除失敗");
        newFavorites[index] = false;
      } else {
        // Add favorite: POST /api/favorite
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/favorite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Added Clerk token
          },
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
