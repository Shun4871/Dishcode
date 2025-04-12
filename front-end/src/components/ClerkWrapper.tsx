// src/components/ui/ClerkWrapper.tsx

"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.pk_test_cGlja2VkLWtvZGlhay0xOS5jbGVyay5hY2NvdW50cy5kZXYk;

  if (!publishableKey) {
    console.error("ClerkのpublishableKeyが設定されていません。");
    return <div>Clerkの設定エラー</div>;
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}