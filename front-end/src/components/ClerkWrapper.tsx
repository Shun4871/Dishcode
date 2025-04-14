"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error("ClerkのpublishableKeyが設定されていません。");
    return (
      <div>
        <p>Clerkの設定エラー-</p>
        <p>
          {`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY が設定されていません。
受け取った値: ${publishableKey}`}
        </p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}