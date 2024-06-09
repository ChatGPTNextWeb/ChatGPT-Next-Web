import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { autoGrowTextArea } from "../utils";
import { useAppConfig } from "../store";

export default function useRows({
  inputRef,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const [inputRows, setInputRows] = useState(2);
  const config = useAppConfig();
  const { isMobileScreen } = config;

  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        20,
        Math.max(2 + (isMobileScreen ? -1 : 1), rows),
      );
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  useEffect(() => {
    measure();
  }, [isMobileScreen]);

  return {
    inputRows,
    measure,
  };
}
