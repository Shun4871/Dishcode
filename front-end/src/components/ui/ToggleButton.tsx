// components/ToggleButton.tsx
import { useState } from "react";

type ToggleButtonProps = {
  onChange?: (value: boolean) => void;
  defaultValue?: boolean;
};

export default function ToggleButton({
  onChange,
  defaultValue = false,
}: ToggleButtonProps) {
  const [isOn, setIsOn] = useState(defaultValue);

  const toggle = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onChange?.(newValue);
  };

  return (
    <div
      className={`flex items-center justify-between w-24 h-12 rounded-full border-2 ${
        isOn ? "bg-blue-500" : "bg-gray-300"
      } cursor-pointer transition-colors duration-300`}
      onClick={toggle}
    >
      <div
        className={`w-1/2 h-full flex items-center justify-center font-bold ${
          isOn ? "text-white" : "text-gray-700"
        }`}
      >
        True
      </div>
      <div
        className={`w-1/2 h-full flex items-center justify-center font-bold ${
          !isOn ? "text-white" : "text-gray-700"
        }`}
      >
        False
      </div>
    </div>
  );
}
