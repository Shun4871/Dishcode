"use client"

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
  const [favorites, setFavorites] = useState<boolean[]>(Array(recipes.length).fill(false));

  const toggleFavorite = (index: number) => {
    setFavorites((prev) => prev.map((fav, i) => (i === index ? !fav : fav)));
  };

  return (
    <div className="space-y-4">
      {recipes.map((recipe, index) => (
        <div
          key={index}
          className="flex items-center border rounded-lg p-4 shadow-md space-x-4"
        >
          <Image
            src={recipe.image}
            alt={recipe.title}
            width={80}
            height={80}
            className="rounded-lg"
          />
          <div className="flex-grow">
            <Link href={recipe.url} target="_blank" rel="noopener noreferrer">
              <h2 className="text-lg font-bold">{recipe.title}</h2>
            </Link>
          </div>
          <button onClick={() => toggleFavorite(index)}>
            {favorites[index] ? "⭐" : "☆"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default UrlWindow;