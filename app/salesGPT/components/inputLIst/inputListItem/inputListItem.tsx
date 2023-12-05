import { InputListValue } from "@/app/salesGPT/types";
import styles from "./inputListItem.module.scss";
import { IconButton } from "@/app/components/button";
import CloseIcon from "../../../../icons/close.svg";

type ListInputProps = {
  InputListValue: InputListValue;
  updateValue: Function;
  deleteValue: Function;
};

const ListInput = ({
  InputListValue,
  updateValue,
  deleteValue,
}: ListInputProps) => {
  return (
    <div className={styles["input-list-item"]}>
      <label className={styles["label-input"]} htmlFor="requirements">
        {InputListValue.index + 1}:
      </label>

      <input
        className={styles["input"]}
        type="text"
        id="requirements"
        placeholder={""}
        value={InputListValue.value}
        onChange={(e) => updateValue(InputListValue.index, e.target.value)}
      />

      <IconButton
        className={styles["button-remove"]}
        icon={<CloseIcon />}
        onClick={() => deleteValue(InputListValue.value)}
      />
    </div>
  );
};

export default ListInput;
