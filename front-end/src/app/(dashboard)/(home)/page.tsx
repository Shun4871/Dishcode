import { SearchTab } from "./_components/SearchTab";
import { KitchenStack} from "./_components/KitchenStack";

import { Flex } from "@/components/ui/flex";

export default function Page() {
  return (
    <Flex className="flex-col gap-10 m-20">
        <KitchenStack />
        <SearchTab />
    </Flex>
  );
}

