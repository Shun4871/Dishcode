"use client";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



const kitchenOptions = [
  // { label: "圧力鍋", type: "switch" , value :"pressurecooker"},
  { label: "オーブン", type: "switch" , value :"oven"},
  { label: "ホットプレート", type: "switch", value :"hotplate" },
  // { label: "ミキサー", type: "switch" , value :"mixer"},
  { label: "希望所要時間", type: "select", value:"time",
    options: [
      { value: "15", label: "15分以内" },
      { value: "30", label: "30分以内" },
      { value: "60", label: "60分以内" },
      { value: "90", label: "90分以上" }
    ] },
  { label: "トースター", type: "switch" , value :"toaster"},
  { label: "何人暮らし", type: "select", value:"people",
    options: [
      { value: "1", label: "1人" },
      { value: "2", label: "2人" },
      { value: "3", label: "3人" },
      { value: "4", label: "4人以上" }
    ] },
  
];

interface KitchenStackProps {
  kitchenState: Kitchen;
  setKitchenState: (updatedState: Kitchen) => void;
}

export type Kitchen = {
  people: number;
  oven: boolean;
  hotplate: boolean;
  time: number;
}

export function KitchenStack({ kitchenState, setKitchenState }: KitchenStackProps) {
  const handleChange = (label: string, value: any) => {
    const updatedState = { ...kitchenState, [label]: value };
    console.log(updatedState);
    setKitchenState(updatedState);
  };

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-2xl shadow w-full max-w-3xl mx-auto">
      {kitchenOptions.map(({ label, type, options, value }) => (
        <div key={label} className="flex items-center justify-between space-x-4">
          <span className="font-bold">{label}</span>
          {type === "select" ? (
            <Select
              onValueChange={(selected) => {
                console.log(selected);
                handleChange(value, Number(selected));
              }}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                {options?.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Switch
              checked={kitchenState[value as keyof Kitchen] as boolean}
              onCheckedChange={(checked) => handleChange(value, checked)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
