import PasswordVisible from "@/app/icons/passwordVisible.svg";
import PasswordInvisible from "@/app/icons/passwordInvisible.svg";
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import List, { ListContext } from "@/app/components/List";

export interface CommonInputProps
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "onChange" | "type" | "value"
  > {
  className?: string;
}

export interface NumberInputProps {
  onChange?: (v: number) => void;
  type?: "number";
  value?: number;
}

export interface TextInputProps {
  onChange?: (v: string) => void;
  type?: "text" | "password";
  value?: string;
}

export interface InputProps {
  onChange?: ((v: string) => void) | ((v: number) => void);
  type?: "text" | "password" | "number";
  value?: string | number;
}

export default function Input(
  props: CommonInputProps & NumberInputProps,
): JSX.Element;
export default function Input(
  props: CommonInputProps & TextInputProps,
): JSX.Element;
export default function Input(props: CommonInputProps & InputProps) {
  const { value, type = "text", onChange, className, ...rest } = props;
  const [show, setShow] = useState(false);

  const { inputClassName } = useContext(ListContext);

  const internalType = (show && "text") || type;

  const { update, handleValidate } = useContext(List.ListContext);

  useLayoutEffect(() => {
    update?.({ type: "input" });
  }, []);

  useLayoutEffect(() => {
    handleValidate?.(value);
  }, [value]);

  return (
    <div
      className={` group/input w-[100%] rounded-chat-input bg-input transition-colors duration-300 ease-in-out flex gap-3 items-center px-3 py-2 ${className} hover:bg-select-hover ${inputClassName}`}
    >
      <input
        {...rest}
        className=" overflow-hidden text-text-input text-sm-title leading-input outline-none flex-1 group-hover/input:bg-input-input-ele-hover"
        type={internalType}
        value={value}
        onChange={(e) => {
          if (type === "number") {
            const v = e.currentTarget.valueAsNumber;
            (onChange as NumberInputProps["onChange"])?.(v);
          } else {
            const v = e.currentTarget.value;
            (onChange as TextInputProps["onChange"])?.(v);
          }
        }}
      />
      {type == "password" && (
        <div className=" cursor-pointer" onClick={() => setShow((pre) => !pre)}>
          {show ? <PasswordVisible /> : <PasswordInvisible />}
        </div>
      )}
    </div>
  );
}
