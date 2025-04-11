"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((data) => setKey(data.clerkPublishableKey))
      .catch((err) => {
        console.error("Clerkのキーの読み込みに失敗", err);
      });
  }, []);

  if (!key) return null; // ローディング画面でも可

  return <ClerkProvider publishableKey={key}>{children}</ClerkProvider>;
}