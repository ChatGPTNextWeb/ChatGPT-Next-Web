import styles from "./ui-lib.module.scss";
import LoadingIcon from "../icons/three-dots.svg";
import CloseIcon from "../icons/close.svg";
import { createRoot } from 'react-dom/client'

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

export function Loading() {
  return <div style={{
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}><LoadingIcon /></div>
}

interface ModalProps {
  title: string,
  children?: JSX.Element,
  actions?: JSX.Element[],
  onClose?: () => void,
}
export function Modal(props: ModalProps) {
  return <div className={styles['modal-container']}>
    <div className={styles['modal-header']}>
      <div className={styles['modal-title']}>{props.title}</div>

      <div className={styles['modal-close-btn']} onClick={props.onClose}>
        <CloseIcon />
      </div>
    </div>

    <div className={styles['modal-content']}>{props.children}</div>

    <div className={styles['modal-footer']}>
      <div className={styles['modal-actions']}>
        {props.actions?.map((action, i) => <div key={i} className={styles['modal-action']}>{action}</div>)}
      </div>
    </div>
  </div>
}

export function showModal(props: ModalProps) {
  const div = document.createElement('div')
  div.className = "modal-mask";
  document.body.appendChild(div)

  const root = createRoot(div)
  root.render(<Modal {...props} onClose={() => {
    props.onClose?.();
    root.unmount();
    div.remove();
  }}></Modal>)
}