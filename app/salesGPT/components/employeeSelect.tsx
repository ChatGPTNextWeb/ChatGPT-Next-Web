import Select, {
  StylesConfig,
  type DropdownIndicatorProps,
  components,
} from "react-select";
import { EmployeeItem, EmployeeOption } from "../types";
import { useState } from "react";
import Locale from "../../locales";
import SearchIcon from "../../icons/search.svg";
import { selectTheme } from "./selectTheme";

interface SelectProps {
  employees: EmployeeItem[];
  selectedEmployee: EmployeeItem | undefined;
  handleSelectEmployee: (newValue: EmployeeItem | undefined) => void;
  handleClear: () => void;
}

const SearchIndicator = ({
  ...props
}: DropdownIndicatorProps<EmployeeOption>) => {
  return (
    <components.DropdownIndicator {...props}>
      <SearchIcon />
    </components.DropdownIndicator>
  );
};

const selectStyles: StylesConfig<EmployeeOption> = {
  placeholder: (styles) => ({
    ...styles,
    color: "var(--variant-secondary-4-d-2)",
    fontSize: "1rem",
    fontWeight: "400",
  }),
  indicatorSeparator: () => ({ display: "hidden" }),
  control: (styles) => ({
    ...styles,
    borderRadius: "0.7rem",
    borderColor: "var(--white)",
    padding: ".4rem",
  }),
  option: (styles) => ({
    ...styles,
    color: "var(--variant-black)",
  }),
};

function EmployeeSelect({
  employees,
  selectedEmployee,
  handleSelectEmployee,
  handleClear,
}: SelectProps) {
  const initialValue = selectedEmployee
    ? { label: selectedEmployee?.name ?? "", value: selectedEmployee }
    : null;
  const [selectedOption, setSelectEmployee] = useState<EmployeeOption | null>(
    initialValue,
  );

  const options: EmployeeOption[] = employees.map((emp: EmployeeItem) => ({
    value: emp,
    label: emp.name,
  }));

  function onChange(newValue: EmployeeOption): void {
    setSelectEmployee(newValue);
    handleSelectEmployee(newValue?.value);
    if (newValue == null) {
      handleClear();
    }
  }

  const placeholder = Locale.SalesGPT.SelectPlaceholder ?? "Choose employee";

  return (
    <Select
      options={options}
      isSearchable={true}
      value={selectedOption}
      // @ts-ignore
      onChange={onChange}
      id="choose-employee"
      placeholder={placeholder}
      isClearable={true}
      theme={selectTheme}
      styles={selectStyles}
      components={{
        DropdownIndicator: SearchIndicator,
      }}
    />
  );
}

export default EmployeeSelect;
