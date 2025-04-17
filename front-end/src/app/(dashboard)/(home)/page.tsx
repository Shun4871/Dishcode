"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { KitchenStack, Kitchen } from "./_components/KitchenStack";
import { SearchTab } from "./_components/SearchTab";
import { Flex } from "@/components/ui/flex";
import { Load } from "@/components/Load";

const initialState: Kitchen = {
  people: 1,
  oven: false,
  hotplate: false,
  mixer: false,
  time: 15,
  toaster: false,
  pressurecooker: false,
};

export default function Page() {
  const { getToken } = useAuth();
  const [kitchenState, setKitchenState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleItemSelect = async (itemDisplay: string) => {
    setLoading(true);
    try {
      // 1. Clerk のトークンを取得
      const token = await getToken();
      if (!token) throw new Error("認証トークンが取得できませんでした");

      // 2. クエリパラメータを組み立て
      const requestData = {
        ...kitchenState,
        selected: itemDisplay, // エンコードは fetch URLSearchParams 側で行う
      };
      const params = new URLSearchParams();
      Object.entries(requestData).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          params.append(key, value ? "true" : "false");
        } else {
          params.append(key, String(value));
        }
      });

      // 3. API コール（Authorization ヘッダーに Bearer token）
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/recipe?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`検索API エラー: ${res.status}`);
      }

      // 4. レスポンスを取得してリダイレクト
      const data = await res.json() as Record<string, string>;
      const resultParams = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        resultParams.append(key, value);
      });
      router.push(`/result?${resultParams.toString()}`);
    } catch (error) {
      console.error("Fetch error:", error);
      // 必要に応じてユーザー向けのエラーハンドリングを入れてください
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex className="flex-col gap-10 m-20">
      {loading && <Load />}
      <KitchenStack
        kitchenState={kitchenState}
        setKitchenState={setKitchenState}
      />
      <SearchTab onItemSelect={handleItemSelect} />
    </Flex>
  );
}
