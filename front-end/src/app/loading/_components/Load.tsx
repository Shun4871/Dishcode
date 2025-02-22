"use client";
import React from "react";
import Image from "next/image";

export const Load = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      {/* #DD9004の角丸背景 */}
      <div className="bg-[#DD9004] rounded-2xl w-48 h-48 flex flex-col items-center justify-center relative">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* 鍋本体（位置を調整して先に表示） */}
          <Image
            src="/pot.svg"
            alt="鍋本体"
            width={80}
            height={50}
            className="absolute bottom-0 animate-[spinPot_1.2s_ease-in-out_infinite]"
          />
          {/* 鍋のふた（鍋本体にピッタリ合うよう位置修正） */}
          <Image
            src="/pot_lid.svg"
            alt="鍋のふた"
            width={60}
            height={20}
            className="absolute bottom-8 animate-[openLid_1.2s_ease-in-out_infinite]"
          />
        </div>
        {/* Loading... の文字 */}
        <p className="text-white text-lg font-bold mt-4">
          Loading<span className="inline-block animate-[dots_1.2s_steps(4)_infinite]"></span>
        </p>
      </div>
    </div>
  );
};
