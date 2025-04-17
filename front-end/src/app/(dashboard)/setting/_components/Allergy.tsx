// components/Allergy.tsx
"use client";

import { FC, useState } from "react";
import { Switch } from "@/components/ui/switch";

interface Category {
  key: string;
  label: string;
  items: string[];
  color: string;
}

const allergyCategories: Category[] = [
  {
    key: "special",
    label: "特定原材料８品目",
    items: ["卵", "乳", "小麦", "そば", "落花生", "えび", "かに", "そら豆"],
    color: "#CCFFCC",
  },
  {
    key: "dairy",
    label: "乳製品",
    items: ["牛乳", "ヨーグルト", "チーズ", "バター"],
    color: "#FFF2CC",
  },
  {
    key: "seafood",
    label: "魚介",
    items: ["いか", "たこ", "えび", "かに"],
    color: "#CCE5FF",
  },
  {
    key: "meat",
    label: "肉類",
    items: ["豚肉", "鶏肉", "牛肉", "羊肉"],
    color: "#FFCCCC",
  },
];

const Allergy: FC = () => {
  // カテゴリの開閉状態
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  // 各スイッチのON/OFF状態
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleChange = (itemKey: string, checked: boolean) => {
    setCheckedMap((prev) => ({ ...prev, [itemKey]: checked }));
  };

  return (
    <div>
      {allergyCategories.map((cat) => (
        <div
          key={cat.key}
          style={{
            marginBottom: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: cat.color,
            padding: "0.5rem",
          }}
        >
          {/* カテゴリ見出し */}
          <div
            onClick={() => toggle(cat.key)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <strong style={{ padding: "0.25rem 0.5rem", borderRadius: "2px" }}>
              {cat.label}
            </strong>
            <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>
              {openMap[cat.key] ? "▾" : "▸"}
            </span>
          </div>

          {/* 非表示でもDOMを残してスイッチ状態を保持 */}
          <ul
            style={{
              display: openMap[cat.key] ? "flex" : "none",
              marginTop: "1rem",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              alignItems: "center",
              listStyle: "none",
              padding: 0,
              gap: "1rem", // アイテム間隔
            }}
          >
            {cat.items.map((item) => {
              const itemKey = `${cat.key}-${item}`;
              return (
                <li
                  key={itemKey}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>{item}</span>
                  <Switch
                    checked={checkedMap[itemKey] ?? false}
                    onCheckedChange={(checked) =>
                      handleChange(itemKey, checked)
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Allergy;