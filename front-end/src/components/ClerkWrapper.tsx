"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const [publishableKey, setKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((data) => {
        if (!data.clerkPublishableKey) {
          throw new Error("config.json に clerkPublishableKey が見つかりません");
        }
        setKey(data.clerkPublishableKey);
      })
      .catch((err) => {
        console.error("config.json 読み込みエラー: ", err);
      });
  }, []);

  if (!publishableKey) {
    return <div>Loading Clerk...</div>;
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}