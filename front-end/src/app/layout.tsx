import type { Metadata } from "next";
import "../styles/globals.css";
import Header from "@/components/header";
import ClerkWrapper from "@/components/ClerkWrapper";

export const metadata: Metadata = {
  title: "Dhiscode",
  description: "数ある料理サイトからあなたに合うレシピをチョイス！",
  icons: {
    icon: "/favicon/favicon.svg",
    shortcut: "/favcon/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" href="/favicon/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon/favicon-16x16.png" sizes="16x16" />
      </head>

      <body className="flex flex-col min-h-screen">
        <ClerkWrapper>
          <Header />
          <main className="my-16 flex-1">{children}</main>
        </ClerkWrapper>
      </body>
    </html>
  );
}