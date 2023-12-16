import styles from "./loading-dots.module.scss";

interface LoadingDotsProps {
  color?: string;
}

const LoadingDots = ({ color = "#000" }: LoadingDotsProps) => {
  return (
    <span className={styles.loading}>
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </span>
  );
};

export default LoadingDots;
