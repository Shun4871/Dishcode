// app/(dashboard)/result/page.tsx
import { Suspense } from "react";
import  ResultPageClient  from "./_components/ResultPageClient";
import  { Load } from "@/components/Load";
import { Flex } from "@/components/ui/flex";

export default function Page() {
  return (
    <Suspense fallback={<Flex className="flex-col gap-10 m-20">
      <Load />
    </Flex>}>
      <ResultPageClient />
    </Suspense>
  );
}
