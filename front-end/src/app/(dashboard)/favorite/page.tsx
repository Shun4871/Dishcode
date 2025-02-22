import UrlWindow from "@/components/ui/UrlWindow"; // パスはプロジェクト構造に合わせる

const recipeData = [
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
      <h1 className="text-2xl font-bold mb-4">お気に入りレシピ</h1>
      <UrlWindow recipes={recipeData} />
    </div>
  );
}