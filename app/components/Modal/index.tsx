import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import Btn, { BtnProps } from "@/app/components/Btn";

import Warning from "@/app/icons/warning.svg";
import Close from "@/app/icons/closeIcon.svg";

export interface ModalProps {
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  okBtnProps?: BtnProps;
  cancelBtnProps?: BtnProps;
  content?: React.ReactNode;
  title?: React.ReactNode;
  visible?: boolean;
  noFooter?: boolean;
  noHeader?: boolean;
  isMobile?: boolean;
  closeble?: boolean;
  type?: "modal" | "bottom-drawer";
  headerBordered?: boolean;
}

export interface WarnProps
  extends Omit<
    ModalProps,
    | "closeble"
    | "isMobile"
    | "noHeader"
    | "noFooter"
    | "onOk"
    | "okBtnProps"
    | "cancelBtnProps"
  > {
  onOk?: () => Promise<void> | void;
}

const baseZIndex = 150;

const Modal = (props: ModalProps) => {
  const {
    onOk,
    onCancel,
    okText,
    cancelText,
    content,
    title,
    visible,
    noFooter,
    noHeader,
    closeble = true,
    okBtnProps,
    cancelBtnProps,
    type = "modal",
    headerBordered,
  } = props;

  const [open, setOpen] = useState(false);

  const mergeOpen = visible ?? open;

  const handleClose = () => {
    setOpen(false);
    onCancel?.();
  };

  let layoutClassName = "";
  let panelClassName = "";
  let titleClassName = "";
  let footerClassName = "";

  switch (type) {
    case "bottom-drawer":
      layoutClassName =
        "fixed inset-0 flex flex-col item-start top-0 left-[50vw] translate-x-[-50%] md:";
      panelClassName = "";
      titleClassName = "";
      footerClassName = "";
      break;
    case "modal":
    default:
      layoutClassName =
        "fixed inset-0 flex flex-col item-start top-0 left-[50vw] translate-x-[-50%] max-sm:w-modal-modal-type-mobile";
      panelClassName = "rounded-lg px-6 sm:w-modal-modal-type";
      titleClassName = "py-6 max-sm:pb-3";
      footerClassName = "py-6";
  }
  const btnCommonClass = "px-4 py-2.5 rounded-md max-sm:flex-1";
  const { className: okBtnClass } = okBtnProps || {};
  const { className: cancelBtnClass } = cancelBtnProps || {};

  return (
    <AlertDialog.Root open={mergeOpen} onOpenChange={setOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="bg-modal-mask fixed inset-0 animate-mask "
          style={{ zIndex: baseZIndex - 1 }}
        />
        <AlertDialog.Content
          className={`
            ${layoutClassName}
          `}
          style={{ zIndex: baseZIndex - 1 }}
        >
          <div className="flex-1">&nbsp;</div>
          <div
            className={`flex flex-col          
              bg-moda-panel text-modal-mask    
              ${headerBordered ? " border-b border-modal-header-bottom" : ""}
              ${panelClassName}
            `}
          >
            {!noHeader && (
              <AlertDialog.Title
                className={`
                      flex items-center justify-between gap-3 font-common
                      md:text-chat-header-title md:font-bold md:leading-5
                      ${titleClassName}
                  `}
              >
                <div className="flex gap-3 justify-start flex-1 items-center">
                  {title}
                </div>
                {closeble && (
                  <div
                    className="items-center"
                    onClick={() => {
                      handleClose();
                    }}
                  >
                    <Close />
                  </div>
                )}
              </AlertDialog.Title>
            )}
            {content}
            {!noFooter && (
              <div
                className={`
                  flex gap-3 sm:justify-end max-sm:justify-between
                  ${footerClassName}
                  `}
              >
                <AlertDialog.Cancel asChild>
                  <Btn
                    {...cancelBtnProps}
                    onClick={() => handleClose()}
                    text={cancelText}
                    className={`${btnCommonClass} ${cancelBtnClass}`}
                  />
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Btn
                    {...okBtnProps}
                    onClick={() => {
                      setOpen(false);
                      onOk?.();
                    }}
                    text={okText}
                    className={`${btnCommonClass} ${okBtnClass}`}
                  />
                </AlertDialog.Action>
              </div>
            )}
          </div>
          <div className="flex-1">&nbsp;</div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export const Warn = ({
  title,
  onOk,
  visible,
  content,
  ...props
}: WarnProps) => {
  const [internalVisible, setVisible] = useState(visible);

  return (
    <Modal
      {...props}
      title={
        <>
          <Warning />
          {title}
        </>
      }
      content={
        <AlertDialog.Description
          className={`
                    font-common font-normal
                    md:text-sm-title md:leading-[158%]
                `}
        >
          {content}
        </AlertDialog.Description>
      }
      closeble={false}
      onOk={() => {
        const toDo = onOk?.();
        if (toDo instanceof Promise) {
          toDo.then(() => {
            setVisible(false);
          });
        } else {
          setVisible(false);
        }
      }}
      visible={internalVisible}
      okBtnProps={{
        className: `bg-delete-chat-ok-btn text-text-delete-chat-ok-btn `,
      }}
      cancelBtnProps={{
        className: `bg-delete-chat-cancel-btn  border border-delete-chat-cancel-btn text-text-delete-chat-cancel-btn`,
      }}
    />
  );
};

const div = document.createElement("div");
div.id = "confirm-root";
div.style.height = "0px";
document.body.appendChild(div);

Modal.warn = (props: Omit<WarnProps, "visible" | "onCancel" | "onOk">) => {
  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
  };

  return new Promise<boolean>((resolve) => {
    root.render(
      <Warn
        {...props}
        visible={true}
        onCancel={() => {
          closeModal();
          resolve(false);
        }}
        onOk={() => {
          closeModal();
          resolve(true);
        }}
      />,
    );
  });
};

const Trigger = (props: ModalProps) => {
  return <></>;
};

Modal.Trigger = Trigger;

export default Modal;
