"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("ClerkのpublishableKeyが設定されていません。");
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}