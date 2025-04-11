import type { Metadata } from "next";
import "../styles/globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Dhiscode",
  description: "数ある料理サイトからあなたに合うレシピをチョイス！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className="flex flex-col min-h-screen">
          {/* ヘッダー */}
          <Header />

          {/* ヘッダーの高さ分余白を確保 */}
          <main className="my-16 flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
} 