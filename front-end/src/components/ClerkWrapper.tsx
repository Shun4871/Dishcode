"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const frontendApi = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API;

  if (!publishableKey) {
    console.error("ClerkのpublishableKeyが設定されていません。");
    return <div>Clerkの設定エラー</div>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} >
      {children}
    </ClerkProvider>
  );
}