// app/(dashboard)/result/page.tsx
import { Suspense } from "react";
import { ResultPageClient } from "./_components/ResultPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ResultPageClient />
    </Suspense>
  );
}
