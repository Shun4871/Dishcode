import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const kitchenOptions = [
  { label: "何人暮らし", type: "select", options: [
      { value: "1", label: "1人" },
      { value: "2", label: "2人" },
      { value: "3", label: "3人" },
      { value: "4", label: "4人以上" }
    ] },
  { label: "オーブン", type: "switch" },
  { label: "ホットプレート", type: "switch" },
  { label: "ミキサー", type: "switch" },
  { label: "希望所要時間", type: "select", options: [
      { value: "15", label: "15分以内" },
      { value: "30", label: "30分以内" },
      { value: "60", label: "60分以内" },
      { value: "90", label: "90分以上" }
    ] },
  { label: "トースター", type: "switch" },
  { label: "圧力鍋", type: "switch" }
];

export function KitchenStack() {
  return (
    <div className="grid grid-cols-2 gap-8 p-6 border rounded-2xl shadow">
      {kitchenOptions.map(({ label, type, options }) => (
        <div key={label} className="flex items-center justify-between space-y-4">
          <span className="font-bold">{label}</span>
          {type === "select" ? (
            <Select>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                {options?.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Switch />
          )}
        </div>
      ))}
    </div>
  );
}
