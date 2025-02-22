"use client";


import { useState } from "react";
import { KitchenStack, Kitchen } from "./_components/KitchenStack";
import { SearchTab } from "./_components/SearchTab";
import { Flex } from "@/components/ui/flex";

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

  const handleItemSelect = async (itemDisplay: string) => {
    const updatedRequestData = {
      ...kitchenState, // KitchenStack の情報を含める
      selected: encodeURIComponent(itemDisplay), // 日本語をエンコード
    };
  
    const params = new URLSearchParams();
    Object.entries(updatedRequestData).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        params.append(key, value ? "true" : "false"); // boolean を適切に変換
      } else {
        params.append(key, String(value)); // 文字列として追加
      }
    });
  
    console.log("GET Request Params:", params.toString());
  
    try {
      const res = await fetch(`http://localhost:8000/recipe?${params.toString()}`, {
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
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  
  

  return (
    <Flex className="flex-col gap-10 m-20">
      <KitchenStack kitchenState={kitchenState} setKitchenState={setKitchenState} />
      {/* <SearchTab onItemSelect={(itemDisplay) => handleItemSelect(itemDisplay)} /> */}
      <SearchTab onItemSelect={handleItemSelect} />
    </Flex>
  );
}
