import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";

const ingredientCategories = [
  { title: "お肉のおかず", items: ["豚肉", "鶏肉", "牛肉", "ひき肉", "加工肉"] },
  { title: "野菜のおかず", items: ["春の旬野菜", "夏の旬野菜", "秋冬の旬野菜", "よく使う野菜", "きのこ", "豆類", "香味野菜", "その他の野菜"] },
  { title: "魚介のおかず", items: ["鮭・サーモン", "サバ", "サンマ", "イワシ", "ブリ", "マグロ", "えび", "アジ", "イカ", "たこ", "いくら", "たらこ", "明太子", "貝類", "ツナ缶", "サバ缶", "しらす", "はんぺん", "その他の魚介"] },
  { title: "その他の材料のおかず", items: ["海藻", "チーズ", "こんにゃく", "春雨"] }
];

const recipeCategories = [
  { title: "主菜", items: ["スープ・汁物・シチュー", "卵料理", "ごはんもの", "肉料理", "鍋料理", "麺類", "野菜料理", "魚介料理"] },
  { title: "副菜・軽食", items: ["お菓子", "サラダ", "パン", "飲み物", "漬物", "調味料"] },
  { title: "その他", items: ["パイ・キッシュ", "グラタン・ドリア・ラザニア", "コロッケ", "粉物", "餅", "中華まん", "餃子・シュウマイ・春巻き", "天ぷら・かき揚げ"] }
];

export function SearchTab() {
    return (
      <Tabs defaultValue="ingredients" className="p-6 border rounded-2xl shadow">
        <TabsList className="mb-6">
          <TabsTrigger value="ingredients" className="font-bold">材料から探す</TabsTrigger>
          <TabsTrigger value="recipes" className="font-bold">料理名から探す</TabsTrigger>
        </TabsList>
  
        <div className="min-h-[400px]">
          <TabsContent value="ingredients" className="h-full">
            <div className="grid grid-cols-2 gap-8">
              {ingredientCategories.map(({ title, items }) => (
                <div key={title} className="mb-4">
                  <h3 className="font-bold mb-2">{title}</h3>
                  <ul className="grid grid-cols-3 gap-2">
                    {items.map(item => (
                      <li key={item} className="flex items-center space-x-1">
                        <ChevronRight size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>
  
          <TabsContent value="recipes" className="h-full">
            <div className="grid grid-cols-2 gap-8">
              {recipeCategories.map(({ title, items }) => (
                <div key={title} className="mb-4">
                  <h3 className="font-bold mb-2">{title}</h3>
                  <ul className="grid grid-cols-3 gap-2">
                    {items.map(item => (
                      <li key={item} className="flex items-center space-x-1">
                        <ChevronRight size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    );
  }
  
