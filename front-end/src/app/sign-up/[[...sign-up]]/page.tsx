import { SignUp } from '@clerk/nextjs'

export const runtime = 'edge';


export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp  />
    </div>
  )
}