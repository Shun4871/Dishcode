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
    <div className="fixed inset-0 z-[10000] bg-black bg-opacity-40 flex items-center justify-center">
      {/* #DD9004の角丸背景 */}
      <div className="bg-[#DD9004] rounded-2xl w-60 h-60 flex flex-col items-center justify-center relative">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* 鍋本体 */}
          <Image
            src="/pot.svg"
            alt="鍋本体"
            width={100}
            height={63}
            className="absolute bottom-0 animate-[spinPot_1.2s_ease-in-out_infinite]"
          />
          {/* 鍋のふた */}
          <Image
            src="/pot_lid.svg"
            alt="鍋のふた"
            width={75}
            height={25}
            className="absolute bottom-9 animate-[openLid_1.2s_ease-in-out_infinite]"
          />
        </div>
        {/* Loading... の文字 */}
        <p className="text-white text-10 font-bold mt-4 ">
          Loading<span className="text-sm">{dots}</span>
        </p>
      </div>
    </div>
  );
};
