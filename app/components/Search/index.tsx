import styles from "./index.module.scss";
import SearchIcon from "@/app/icons/search.svg";

export interface SearchProps {
  value?: string;
  onSearch?: (v: string) => void;
  placeholder?: string;
}

const Search = (props: SearchProps) => {
  const { placeholder = "", value, onSearch } = props;
  return (
    <div className={styles["search"]}>
      <div className={styles["icon"]}>
        <SearchIcon />
      </div>
      <input
        className={styles["input"]}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          e.preventDefault();
          onSearch?.(e.target.value);
        }}
      />
    </div>
  );
};

export default Search;
