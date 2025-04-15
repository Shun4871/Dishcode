import { SignIn } from '@clerk/nextjs'

export const runtime = 'edge';


export default function Page() {
  console.log("sign-in ページが表示されようとしています");
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn />
    </div>
  )
}