import type { Metadata } from "next";
import "../styles/globals.css";
import Header from "@/components/header";
import ClerkWrapper from "@/components/ClerkWrapper";

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
    <html lang="ja">
      <body className="flex flex-col min-h-screen">
        <ClerkWrapper>
          <Header />
          <main className="my-16 flex-1">{children}</main>
        </ClerkWrapper>
      </body>
    </html>
  );
}