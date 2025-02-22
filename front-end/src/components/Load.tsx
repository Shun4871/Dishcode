"use client";
import React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";


export const Load = () => {
  const [dotCount, setDotCount] = useState(1);
  const [increasing, setIncreasing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => {
        if (increasing) {
          if (prev >= 3) {
            setIncreasing(false); // 3つになったら減らすモードに切り替え
            return 2;
          }
          return prev + 1;
        } else {
          if (prev <= 1) {
            setIncreasing(true); // 1つになったら増やすモードに戻る
            return 2;
          }
          return prev - 1;
        }
      });
    }, 400); // 0.4秒ごとに変化

    return () => clearInterval(interval);
  }, [increasing]);

  const dots = ".".repeat(dotCount); // ドットの数を制御

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      {/* #DD9004の角丸背景 */}
      <div className="bg-[#DD9004] rounded-2xl w-48 h-48 flex flex-col items-center justify-center relative">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* 鍋本体 */}
          <Image
            src="/pot.svg"
            alt="鍋本体"
            width={80}
            height={50}
            className="absolute bottom-0 animate-[spinPot_1.2s_ease-in-out_infinite]"
          />
          {/* 鍋のふた */}
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
          Loading<span className="text-sm">{dots}</span>
        </p>
      </div>
    </div>
  );
};
