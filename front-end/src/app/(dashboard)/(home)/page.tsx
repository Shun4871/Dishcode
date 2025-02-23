"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
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
  const [kitchenState, setKitchenState] = useState(initialState);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleItemSelect = async (itemDisplay: string) => {
    const updatedRequestData = {
      ...kitchenState,
      selected: itemDisplay, // ここでエンコードは不要（URLSearchParamsが自動でやってくれる）
    };
  
    const params = new URLSearchParams();
    Object.entries(updatedRequestData).forEach(([key, value]) => {
      params.append(key, String(value)); // value を文字列にして key=value 形式を確保
    });
  
    console.log("GET Request Params:", params.toString());
  
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/recipe?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Response:", data);

      // レスポンスオブジェクト（例: { url1: "htt~", url2: "htt~", url3: "htt~" }）をクエリパラメータに変換
      const resultParams = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        resultParams.append(key, String(value));
      });

      // /result? にリダイレクト
      router.push(`/result?${resultParams.toString()}`);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <Flex className="flex-col gap-10 m-20">
      {loading && <Load />}
      <KitchenStack kitchenState={kitchenState} setKitchenState={setKitchenState} />
      {/* <SearchTab onItemSelect={(itemDisplay) => handleItemSelect(itemDisplay)} /> */}
      <SearchTab onItemSelect={handleItemSelect} />
    </Flex>
  );
}
