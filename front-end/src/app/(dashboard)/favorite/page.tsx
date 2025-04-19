"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { UrlWindow, Recipe } from "@/components/ui/urlWindow";
import Link from "next/link";
import { Load } from "@/components/Load";
import { Flex } from "@/components/ui/flex";

export default function FavoritePage() {
  const { userId, getToken } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/favorites`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("お気に入り取得失敗:", res.statusText);
        return;
      }

      const data = await res.json();
      setFavorites(data);
      setLoading(false);
    };

    fetchFavorites();
  }, [userId, getToken]);

  if (!userId) {
    return (
      <Flex className="flex-col gap-10 m-20">
        <Load />
      </Flex>
    )
  }

  if (loading) {
    return (
      <Flex className="flex-col gap-10 m-20">
        <Load />
      </Flex>
    )
  }

  return (
    <div className="mt-16 flex flex-col gap-6 w-full justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">お気に入りレシピ一覧</h1>
      <UrlWindow recipes={favorites} />
      <Link href="/">
        <button className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl mb-12">
          ホームに戻る
        </button>
      </Link>
    </div>
  );
}
