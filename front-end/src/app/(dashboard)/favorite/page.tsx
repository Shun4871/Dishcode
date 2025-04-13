import { UrlWindow } from "@/components/ui/urlWindow";


export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500">ログインしてください。</p>
      </div>
    );
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorite/${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500">お気に入りの取得に失敗しました。</p>
      </div>
    );
  }

  const items = await res.json();

  return (
    <div className="mt-16 flex flex-col gap-6 w-full justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">お気に入りレシピ</h1>
      <UrlWindow recipes={items} />
      <button className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl mb-12">
        もう一回
      </button>
    </div>
  );
}
