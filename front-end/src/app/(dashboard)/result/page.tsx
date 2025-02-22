
import UrlWindow from "@/components/ui/UrlWindow"; // パスはプロジェクト構造に合わせる

const items = [
  {
    title: "簡単おうちでお店みたいな回鍋肉",
    image: "https://cookpad.com/jp/recipes/17662797/image.jpg",
    url: "https://cookpad.com/jp/recipes/17662797",
  },
  {
    title: "レンジで絶品！白菜と豚ロース肉の重ね蒸し",
    image: "https://mi-journey.jp/foodie/80782/image.jpg",
    url: "https://mi-journey.jp/foodie/80782/",
  },
  {
    title: "やみつき！キャベツと豚肉のうま塩炒め",
    image: "https://delishkitchen.tv/recipes/147726740259602726/image.jpg",
    url: "https://delishkitchen.tv/recipes/147726740259602726",
  },
];

export default function Home() {
  return (
    <div className="mt-16 flex flex-col gap-6 w-full justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">おすすめレシピ</h1>
      <UrlWindow recipes={items} />

      {/* もう一回ボタン */}
      <button className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl mb-12">
        もう一回
      </button>
    </div>
  );
}