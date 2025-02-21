import SearchResultItem from "@/components/SearchResultItem";

const items = [
  {
    img: "/sample-image.jpg",
    description: "料理１のディスクリプション",
    title: "料理１のタイトル",
    summary: "料理１の要約がここにいい感じに",
    like: true,
  },
  {
    img: "/sample-image.jpg",
    description: "料理２のディスクリプション",
    title: "料理２のタイトル",
    summary: "料理２の要約がここにいい感じに",
    like: false,
  },
  {
    img: "/sample-image.jpg",
    description: "料理３のディスクリプション",
    title: "料理３のタイトル",
    summary: "料理３の要約がここにいい感じに",
    like: false,
  },
];

export default async function Home({
  searchParams,
}: any) {
  const data = await searchParams
  console.log(data);
  return (
    <div className="flex flex-col gap-6 h-screen w-full justify-center items-center">
      {items.map((item, index) => (
        <SearchResultItem
          key={index}
          img={item.img}
          description={item.description}
          title={item.title}
          summary={item.summary}
          like={item.like}
        />
      ))}
      <button className="w-60 h-20 bg-[#DD9004] text-3xl text-white rounded-2xl">
        もう一回
      </button>
    </div>
  );
}
