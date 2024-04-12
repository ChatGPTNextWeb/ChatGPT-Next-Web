import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import { useMobileScreen } from "@/app/utils";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "@/app/locales";

import Search from "@/app/components/Search";
import { useMemo, useState } from "react";

interface Filter {
  assistantKeyword?: string;
}

export default function DiscoverAssistant() {
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();

  const [filter, setFilter] = useState<Filter>();

  const filteredAssistant = useMemo(() => {}, [filter]);

  return (
    <>
      <div className={styles["discover-assistant-container"]}>
        <div className={styles["discover-assistant-container-title"]}></div>
        <div className={styles["discover-assistant-container-subtitle"]}></div>
        <div className={styles["discover-assistant-container-search"]}>
          <Search
            value={filter?.assistantKeyword}
            onSearch={(keyword) => {
              setFilter((pre) => ({ ...pre, keyword }));
            }}
            placeholder={Locale.Discover.SearchPlaceholder}
          />
        </div>
      </div>
    </>
  );
}
