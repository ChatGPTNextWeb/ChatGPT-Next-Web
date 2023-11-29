import InputListItem from "./inputListItem/inputListItem";

type InputListProps = {
  values: Record<number, string>[];
  setValues: React.Dispatch<React.SetStateAction<Record<number, string>[]>>;
};

const InputList = ({ values, setValues }: InputListProps) => {
  function addValue(value: string) {
    const updatedValues: Record<number, string>[] = [
      ...values,
      { [values.length]: value },
    ];
    setValues(updatedValues);
  }

  function updateValue(index: number, newValue: string) {
    const updatedValues = [...values];
    updatedValues[index] = { [index]: newValue };
    setValues(updatedValues);
  }

  function deleteValue(index: number) {
    if (index > 0) {
      const updatedValues = [...values];
      updatedValues.splice(index, 1);
      setValues(updatedValues);
    }
  }

  return (
    <>
      {values.map((value, index) => {
        return (
          <InputListItem
            key={index}
            index={index}
            value={value[index]}
            updateValue={updateValue}
            deleteValue={deleteValue}
          />
        );
      })}
      <button type="button" onClick={() => addValue("")}>
        Legg til kompetanse
      </button>
    </>
  );
};

export default InputList;
