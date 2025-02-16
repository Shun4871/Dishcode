import { SearchTab } from "./_components/SearchTab";
import { KitchenStack} from "./_components/KitchenStack";

import { Flex } from "@/components/ui/flex";

export default function Page() {
  return (
    <Flex>
        <KitchenStack />
        <SearchTab />
    </Flex>
  );
}

