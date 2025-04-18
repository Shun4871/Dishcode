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
  oven: true,
  hotplate: false,
  time: 15,
};

export default function Page() {
  const { isSignedIn, getToken } = useAuth();
  const [kitchenState, setKitchenState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleItemSelect = async (itemDisplay: string) => {
    setLoading(true);
    try {
      // 1. クエリパラメータを構築
      const requestData = {
        ...kitchenState,
        selected: itemDisplay,
      };
      const params = new URLSearchParams();
      Object.entries(requestData).forEach(([key, value]) => {
        params.append(key, String(value));
      });

      console.log("🔍 送信リクエスト内容:", {
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/recipe?${params.toString()}`,
        headers: isSignedIn ? { Authorization: "Bearer ***", "Content-Type": "application/json" } : { "Content-Type": "application/json" },
        requestData,
      });

      // 2. ヘッダーを準備（未ログイン時は Authorization ヘッダーを付けない）
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      // 3. API コール
      const res = await fetch(
    
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/recipe?${params.toString()}`,
        {
          method: "GET",
          headers,
        }
      );
      if (!res.ok) {
        throw new Error(`検索API エラー: ${res.status}`);
      }

      // 4. レスポンスを読み込んでリダイレクト
      const data = (await res.json()) as Record<string, string>;
      const resultParams = new URLSearchParams();
      Object.entries(data).forEach(([k, v]) => {
        resultParams.append(k, v);
      });
      router.push(`/result?${resultParams.toString()}`);
    } catch (error) {
      console.error("Fetch error:", error);
      // 必要なら UI にエラー表示を追加してください
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
