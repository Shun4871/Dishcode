"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { TextSearch } from "./TextSearch";


// カテゴリデータ定義
const ingredientCategories = [
  { title: "お肉のおかず", items: [
      { display: "豚肉", value: "pork" },
      { display: "鶏肉", value: "chicken" },
      { display: "牛肉", value: "beef" },
      { display: "ひき肉", value: "minced" },
    ]
  },
  { title: "野菜のおかず", items: [
      { display: "春の旬野菜", value: "springvegetables" },
      { display: "夏の旬野菜", value: "summervgetables" },
      { display: "秋冬の旬野菜", value: "autumnwintervegetables" },
      { display: "よく使う野菜", value: "commonvegetables" },
      { display: "もやし", value: "bean_sprouts" },
      { display: "きのこ", value: "mushrooms" },
      { display: "豆類", value: "beans" },
      { display: "香味野菜", value: "aromaticvegetables" },
      { display: "その他の野菜", value: "othervegetables" },
    ]
  },
  { title: "魚介のおかず", items: [
      { display: "鮭・サーモン", value: "salmon" },
      { display: "サバ", value: "mackerel" },
      { display: "サンマ", value: "saury" },
      { display: "イワシ", value: "sardine" },
      { display: "ブリ", value: "yellowtail" },
      { display: "マグロ", value: "tuna" },
      { display: "えび", value: "shrimp" },
      { display: "アジ", value: "horse-mackerel" },
      { display: "イカ", value: "squid" },
      { display: "たこ", value: "octopus" },
      { display: "いくら", value: "salmonroe" },
      { display: "たらこ", value: "codroe" },
      { display: "明太子", value: "mentaiko" },
      { display: "貝類", value: "shellfish" },
      { display: "ツナ缶", value: "cannedtuna" },
      { display: "サバ缶", value: "cannedmackerel" },
      { display: "しらす", value: "whitebait" },
      { display: "はんぺん", value: "fishcake" },
      { display: "その他の魚介", value: "otherseafood" },
    ]
  },
  { title: "その他の材料のおかず", items: [
      { display: "海藻", value: "seaweed" },
      { display: "チーズ", value: "cheese" },
      { display: "こんにゃく", value: "konjac" },
      { display: "春雨", value: "harusame" },
    ]
  }
];

const recipeCategories = [
  { title: "主菜", items: [
      { display: "スープ・汁物・シチュー", value: "soup_stew" },
      { display: "卵料理", value: "egg_dish" },
      { display: "ごはんもの", value: "rice_dish" },
      { display: "肉料理", value: "meat_dish" },
      { display: "鍋料理", value: "hotpot" },
      { display: "麺類", value: "noodle_dish" },
      { display: "野菜料理", value: "vegetable_dish" },
      { display: "魚介料理", value: "seafood_dish" },
      { display: "回鍋肉", value: "sweet_sour_pork" },
    ]
  },
  { title: "副菜・軽食", items: [
      { display: "お菓子", value: "sweets" },
      { display: "サラダ", value: "salad" },
      { display: "パン", value: "bread" },
      { display: "飲み物", value: "drink" },
      { display: "漬物", value: "pickles" },
      { display: "調味料", value: "seasoning" },
    ]
  },
  { title: "その他", items: [
      { display: "パイ・キッシュ", value: "pie_quiche" },
      { display: "グラタン・ドリア・ラザニア", value: "gratin_doria_lasagna" },
      { display: "コロッケ", value: "croquette" },
      { display: "粉物", value: "flour_dish" },
      { display: "餅", value: "mochi" },
      { display: "中華まん", value: "chinese_bun" },
      { display: "餃子・シュウマイ・春巻き", value: "dumplings" },
      { display: "天ぷら・かき揚げ", value: "tempura" },
    ]
  }
];

type SearchTabProps = { onItemSelect: (display: string) => void };

export function SearchTab({ onItemSelect }: SearchTabProps) {
  return (
    <Tabs defaultValue="text" className="w-full max-w-5xl mx-auto">
      {/* タブヘッダー */}
      <TabsList className="flex whitespace-nowrap overflow-x-auto border-b border-gray-200 bg-gray-100">
        <TabsTrigger
          value="text"
          className="px-4 py-2 text-sm font-medium whitespace-nowrap first:rounded-t-lg border-b-2 border-transparent data-[state=active]:border-b-4 data-[state=active]:border-yellow-400 data-[state=active]:bg-white data-[state=active]:text-black"
        >
          テキスト検索
        </TabsTrigger>
        <TabsTrigger
          value="ingredients"
          className="px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-b-4 data-[state=active]:border-yellow-400 data-[state=active]:bg-white data-[state=active]:text-black"
        >
          材料から探す
        </TabsTrigger>
        <TabsTrigger
          value="recipes"
          className="px-4 py-2 text-sm font-medium whitespace-nowrap last:rounded-t-lg border-b-2 border-transparent data-[state=active]:border-b-4 data-[state=active]:border-yellow-400 data-[state=active]:bg-white data-[state=active]:text-black"
        >
          料理名から探す
        </TabsTrigger>
      </TabsList>

      {/* コンテンツ */}
      <div className="border-x border-b border-gray-200 rounded-b-lg bg-white">
        <TabsContent value="text" className="p-4">
          <TextSearch onSearch={onItemSelect} />
        </TabsContent>
        <TabsContent value="ingredients" className="p-4">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
            {ingredientCategories.map(({ title, items }) => (
              <div key={title}>
                <h3 className="font-bold mb-2">{title}</h3>
                <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {items.map(item => (
                    <li
                      key={item.value}
                      className="flex items-center space-x-1 cursor-pointer hover:underline"
                      onClick={() => onItemSelect(item.display)}
                    >
                      <ChevronRight size={16} />
                      <span>{item.display}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recipes" className="p-4">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
            {recipeCategories.map(({ title, items }) => (
              <div key={title}>
                <h3 className="font-bold mb-2">{title}</h3>
                <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {items.map(item => (
                    <li
                      key={item.value}
                      className="flex items-center space-x-1 cursor-pointer hover:underline"
                      onClick={() => onItemSelect(item.display)}
                    >
                      <ChevronRight size={16} />
                      <span>{item.display}</span>
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
