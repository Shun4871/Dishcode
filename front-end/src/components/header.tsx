"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs"; // SignOutButtonをインポート
import Menu from "./Menu";
import { Input } from "postcss";


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useUser(); // ログイン状態を取得


  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="bg-[#DD9004] text-white h-16 fixed top-0 left-0 w-full flex items-center">
      <div className="max-w-6xl w-full mx-auto px-6 flex items-center justify-center gap-8">
        {/* ロゴ */}
        <div className="flex gap-2">
          <Image
            src="/logo.svg"
            alt="logo"
            width={40}
            height={40}
            className="h-8 w-auto"
          />

          <Link href="/" className="text-2xl font-bold">
            Dishcode
          </Link>
        </div>

        <div className="flex-1 max-w-md relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Image src="/search.svg" alt="search icon" width={20} height={20} />
          </div>

          <input
            type="text"
            placeholder="料理名・食材でレシピを検索"
            className="w-full h-10 px-10 pl-10 rounded-full text-black"
          />
        </div>
      
        {/* メニューボタン */}
        <div className="bg-white rounded-lg p-1 relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="h-8 w-10">
            <Image src="/menu.svg" alt="menu" width={40} height={40} />
          </button>
        </div>

        {/* ログアウトボタン */}
        {isSignedIn && (
          <SignOutButton>
            <button className="bg-red-500 text-white p-2 rounded">
              ログアウト
            </button>
          </SignOutButton>
        )}

        {/* メニューコンポーネント */}
         <Menu isOpen={menuOpen} closeMenu={closeMenu} />   
     </div>
    </header>
  );
};

export default Header;
