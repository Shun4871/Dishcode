'use client';

import type { NextPage } from 'next';
import Allergy from '@/app/(dashboard)/setting/_components/Allergy';
import { Button } from '@/components/ui/button';
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Flex } from '@/components/ui/flex';

const AllergiesPage: NextPage = () => {
  const { isSignedIn } = useUser(); // useUser() を関数の中で呼び出す

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 className="font-black pt-8 pb-10 text-2xl">アレルギー項目</h1>
      <Allergy />
      
      <Flex>
        {isSignedIn && (
          <SignOutButton>
            <button className="bg-red-500 text-white p-2 rounded m-4">
              ログアウト
            </button>
          </SignOutButton>
        )}
        <Button className='m-4'>保存</Button>
    </Flex>
    </div>
  );
};

export default AllergiesPage;
