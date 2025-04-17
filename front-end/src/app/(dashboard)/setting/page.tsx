// psetting/page.tsx
import type { NextPage } from 'next';
import Allergy from '@/app/(dashboard)/setting/_components/Allergy';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
const AllergiesPage: NextPage = () => (
  <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
    <h1 className ="font-black pt-8 pb-10 text-2xl">アレルギー項目</h1>
    <Allergy />
    <Flex>
    <Button>
      保存
    </Button>
    </Flex>
  </div>
);

export default AllergiesPage;  