"use client";
import {
  DatePicker,
  DateRangePickerItem,
  DatePickerValue,
} from "@tremor/react";
import { da, es, zhCN } from "date-fns/locale";

export default function DateRangePickerSpanish() {
  // const [value, setValue] = useState<DateRangePickerValue>({
  //     from: new Date(2023, 1, 1),
  //     to: new Date(),
  // });

  const currentDate: DatePickerValue = new Date();

  return (
    <DatePicker
      className="max-w-sm mx-auto justify-center"
      // value={dataRange}
      locale={zhCN}
      defaultValue={new Date()}
      // minDate={new Date(2023, 1, 1)}
      maxDate={new Date()}
    />
  );
}
