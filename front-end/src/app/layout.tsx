import type { Metadata } from "next";
import "../styles/globals.css";
import Header from "@/components/header";
import ClerkWrapper from "@/components/ClerkWrapper";

export const metadata: Metadata = {
  title: "Dhiscode",
  description: "数ある料理サイトからあなたに合うレシピをチョイス！",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
      
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