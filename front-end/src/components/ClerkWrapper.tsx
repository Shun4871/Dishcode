"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error("ClerkのpublishableKeyが設定されていません。");
    return <div>Clerkの設定エラー</div>;
  }

  return (
    <ClerkProvider
    clerkJSUrl="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5.61.0/dist/clerk.browser.js"
    publishableKey={publishableKey} >
      {children}
    </ClerkProvider>
  );
}