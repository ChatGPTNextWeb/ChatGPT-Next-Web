import { InputListValue } from "@/app/salesGPT/types";
import Locale from "../../../../locales";
import styles from "./inputListItem.module.scss";

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
      <button
        className={styles["button-remove"]}
        type="button"
        onClick={() => deleteValue(InputListValue.value)}
      >
        X
      </button>
    </div>
  );
};

export default ListInput;
