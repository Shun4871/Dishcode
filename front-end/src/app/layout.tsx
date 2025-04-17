import type { Metadata } from "next";
import "../styles/globals.css";
import Header from "@/components/header";
import ClerkWrapper from "@/components/ClerkWrapper";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Dhiscode",
  description: "数ある料理サイトからあなたに合うレシピをチョイス！",
  icons:[
    { rel: "icon", url: "/favicons/favicon.ico" },
    { rel: "apple-touch-icon", url: "/favicons/apple-touch-icon.png" },
    { rel: "icon", url: "/favicons/favicon.svg" },
    { rel: "icon", url: "/favicons/favicon-32x32.png", sizes: "32x32" },
    { rel: "icon", url: "/favicons/favicon-16x16.png", sizes: "16x16" },
    { rel: "manifest", url: "/favicons/site.webmanifest" },
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicons/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
      </head>

      <body className="flex flex-col min-h-screen">
        <ClerkWrapper>
          <Header />
          <main className="my-16 flex-1">{children}</main>
        </ClerkWrapper>
        <CookieConsent />
      </body>
    </html>
  );
}