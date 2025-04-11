import type { Metadata } from "next";
import "../styles/globals.css";
import Header from "@/components/header";
import ClerkWrapper from "@/components/ClerkWrapper"; // 追加

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
    <ClerkWrapper>
      <html lang="ja">
        <body className="flex flex-col min-h-screen">
          <Header />
          <main className="my-16 flex-1">{children}</main>
        </body>
      </html>
    </ClerkWrapper>
  );
}