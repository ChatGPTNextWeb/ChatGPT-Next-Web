import Locale from "../../../../locales";

type ListInputProps = {
  index: number;
  value: string;
  updateValue: Function;
  deleteValue: Function;
};

const ListInput = ({
  index,
  value,
  updateValue,
  deleteValue,
}: ListInputProps) => {
  return (
    <div>
      <input
        type="text"
        id="requirements"
        // className={styles["text-input"]}
        placeholder={Locale.SalesGPT.RequirementsPlaceholder}
        value={value}
        onChange={(e) => updateValue(index, e.target.value)}
      />
      <button type="button" onClick={() => deleteValue(index)}>
        X
      </button>
    </div>
  );
};

export default ListInput;
