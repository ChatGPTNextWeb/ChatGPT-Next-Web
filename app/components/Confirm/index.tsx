import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import Warning from "@/app/icons/warning.svg";
import Btn from "@/app/components/Btn";

interface ConfirmProps {
  onOk?: () => Promise<void> | void;
  onCancel?: () => void;
  okText: string;
  cancelText: string;
  content: React.ReactNode;
  title: React.ReactNode;
  visible?: boolean;
}

const baseZIndex = 150;

const Confirm = (props: ConfirmProps) => {
  const { visible, onOk, onCancel, okText, cancelText, content, title } = props;

  const [open, setOpen] = useState(false);

  const mergeOpen = visible ?? open;

  return (
    <AlertDialog.Root open={mergeOpen} onOpenChange={setOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="bg-confirm-mask fixed inset-0 animate-mask "
          style={{ zIndex: baseZIndex - 1 }}
        />
        <AlertDialog.Content
          className={`
                    fixed inset-0 flex flex-col item-start top-0 left-[50vw] translate-x-[-50%] 
                `}
          style={{ zIndex: baseZIndex - 1 }}
        >
          <div className="flex-1">&nbsp;</div>
          <div
            className={`flex flex-col          
                     bg-confirm-panel text-confirm-mask          
                     md:p-6 md:w-confirm md:gap-6 md:rounded-lg 
                `}
          >
            <AlertDialog.Title
              className={`
                        flex items-center justify-start gap-3 font-common
                        md:text-chat-header-title md:font-bold md:leading-5
                    `}
            >
              <Warning />
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description
              className={`
                        font-common font-normal
                        md:text-sm-title md:leading-[158%]
                    `}
            >
              {content}
            </AlertDialog.Description>
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <AlertDialog.Cancel asChild>
                <Btn
                  className={`
                                    md:px-4 md:py-2.5 bg-delete-chat-cancel-btn  border border-delete-chat-cancel-btn text-text-delete-chat-cancel-btn rounded-md
                                `}
                  onClick={() => {
                    setOpen(false);
                    onCancel?.();
                  }}
                  text={cancelText}
                />
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Btn
                  className={`
                                    md:px-4 md:py-2.5 bg-delete-chat-ok-btn text-text-delete-chat-ok-btn rounded-md
                                `}
                  onClick={() => {
                    const toDo = onOk?.();
                    if (toDo instanceof Promise) {
                      toDo.then(() => {
                        setOpen(false);
                      });
                    } else {
                      setOpen(false);
                    }
                  }}
                  text={okText}
                />
              </AlertDialog.Action>
            </div>
          </div>
          <div className="flex-1">&nbsp;</div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

const div = document.createElement("div");
div.id = "confirm-root";
div.style.height = "0px";
document.body.appendChild(div);

const show = (props: Omit<ConfirmProps, "visible" | "onCancel" | "onOk">) => {
  const root = createRoot(div);
  const closeModal = () => {
    root.unmount();
  };

  return new Promise<boolean>((resolve) => {
    root.render(
      <Confirm
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

Confirm.show = show;

export default Confirm;
