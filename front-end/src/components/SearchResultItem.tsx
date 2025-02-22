/*"use client";
import React, { useState } from "react";
import Image from "next/image";

type SearchResultItemProps = {
  img?: string;
  description?: string;
  title: string;
  summary: string;
  like: boolean;
};

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  img,
  description,
  title,
  summary,
  like,
}) => {
  const [isLiked, setIsLiked] = useState(like);

  const handleLike = () => {
    setIsLiked((prevLike) => !prevLike);
  };

  return (
    <div className="relative flex w-1/2 max-w-[1000px] min-w-[500px] border-4 items-center rounded-2xl p-4">
      <div className="flex w-36 h-32 rounded-2xl bg-gray-300 items-center justify-center">
        {img ? (
          <div className="relative h-full w-full">
            <Image
              src={img}
              alt={description || "image"}
              width={200}
              height={200}
              className="h-full object-cover rounded-2xl"
            />
            <p className="absolute bottom-0 left-0 m-1 text-white text-sm">
              {description}
            </p>
          </div>
        ) : (
          <p>no image</p>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full pl-8">
        <h2 className="text-4xl font-bold">{title}</h2>
        <h3 className="text-xl">{summary}</h3>
      </div>

      <div
        className="absolute bottom-4 right-4 cursor-pointer"
        onClick={handleLike}
      >
        <Image
          src={isLiked ? "/like-star.svg" : "/not-like-star.svg"}
          alt="like icon"
          width={40}
          height={40}
        />
      </div>
    </div>
  );
};

export default SearchResultItem;
*/