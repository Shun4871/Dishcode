"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export default function ClerkWrapper({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error("ClerkのpublishableKeyが設定されていません。");
    return <div>Clerkの設定エラー</div>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}