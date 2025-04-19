// components/TextSearch.tsx
"use client";

import React, { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface TextSearchProps {
  onSearch: (query: string) => void;
}

export function TextSearch({ onSearch }: TextSearchProps) {
  const [text, setText] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && text.trim()) {
      onSearch(text.trim());
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto mb-6">
      {/* テキスト入力 */}
      <input
        placeholder="料理名・食材でレシピを検索"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-full pl-10 pr-20 shadow-sm"
      />
      {/* 虫眼鏡アイコン */}
      <Image
        src="/search.svg"
        alt="検索"
        width={20}
        height={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
      />
      {/* 検索ボタン */}
      <Button
        variant="secondary"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 bg-[#DD9004] text-white"
        onClick={() => text.trim() && onSearch(text.trim())}
      >
        検索
      </Button>
    </div>
  );
}
