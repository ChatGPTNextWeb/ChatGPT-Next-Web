import * as RadixSwitch from "@radix-ui/react-switch";
import { useContext } from "react";
import List from "../List";

interface SwitchProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export default function Switch(props: SwitchProps) {
  const { value, onChange } = props;

  const { switchClassName = "" } = useContext(List.ListContext);
  return (
    <RadixSwitch.Root
      checked={value}
      onCheckedChange={onChange}
      className={` flex w-switch h-switch bg-gray-200 p-0.5 box-content rounded-md ${switchClassName} ${
        value ? "bg-switch-checked justify-end" : "bg-gray-200 justify-start"
      }`}
    >
      <RadixSwitch.Thumb
        className={` bg-white block w-4 h-4 drop-shadow-sm rounded-md`}
      />
    </RadixSwitch.Root>
  );
}
