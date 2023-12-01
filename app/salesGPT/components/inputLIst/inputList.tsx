import styles from "./inputList.module.scss";
import { IconButton } from "@/app/components/button";
import AddIcon from "../../../icons/add.svg";
import { useEffect } from "react";
import { InputListValue } from "../../types";
import InputListItem from "./inputListItem/inputListItem";

type InputListProps = {
  inputListValues: InputListValue[];
  setInputListValues: React.Dispatch<React.SetStateAction<InputListValue[]>>;
};

const InputList = ({ inputListValues, setInputListValues }: InputListProps) => {
  function addValue(value: string) {
    const updatedValues: InputListValue[] = [
      ...inputListValues,
      { index: inputListValues.length, value },
    ];
    setInputListValues(updatedValues);
  }

  function updateValue(index: number, newValue: string) {
    const updatedValues = [...inputListValues];
    updatedValues[index] = { index, value: newValue };
    setInputListValues(updatedValues);
  }

  function deleteValue(valueToDelete: string) {
    let updatedValues: InputListValue[] = [];
    inputListValues.map((value) => {
      if (value.value !== valueToDelete) {
        updatedValues.push(value);
      }
    });
    updateIndex(updatedValues);
  }

  function updateIndex(listToUpdate: InputListValue[]) {
    let updatedIndexValues: InputListValue[] = [];
    listToUpdate.map((inputListValue, index) => {
      updatedIndexValues.push({ index: index, value: inputListValue.value });
    });
    setInputListValues(updatedIndexValues);
  }

  return (
    <>
      {inputListValues.map((inputListValue) => {
        return (
          <InputListItem
            key={inputListValue.index}
            updateValue={updateValue}
            deleteValue={deleteValue}
            InputListValue={inputListValue}
          />
        );
      })}
      <IconButton
        className={styles["button-add"]}
        text={""}
        icon={<AddIcon />}
        onClick={() => addValue("")}
      />
    </>
  );
};

export default InputList;
