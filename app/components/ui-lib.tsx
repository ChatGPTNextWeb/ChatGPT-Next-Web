import styles from "./ui-lib.module.css";

export function Popover(props: {
  children: JSX.Element;
  content: JSX.Element;
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className={styles.popover}>
      {props.children}
      {props.open && (
        <div className={styles["popover-content"]}>
          <div className={styles["popover-mask"]} onClick={props.onClose}></div>
          {props.content}
        </div>
      )}
    </div>
  );
}

export function Card(props: { children: JSX.Element[]; className?: string }) {
  return (
    <div className={styles.card + " " + props.className}>{props.children}</div>
  );
}

export function ListItem(props: { children: JSX.Element[] }) {
  if (props.children.length > 2) {
    throw Error("Only Support Two Children");
  }

  return <div className={styles["list-item"]}>{props.children}</div>;
}

export function List(props: { children: JSX.Element[] }) {
  return <div className={styles.list}>{props.children}</div>;
}
