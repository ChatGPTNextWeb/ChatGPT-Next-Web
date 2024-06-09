import { useState } from "react";
import { useChatStore } from "@/app/store/chat";
import { List, ListItem, Modal } from "@/app/components/ui-lib";

import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import { ContextPrompts } from "@/app/components/mask";

import CancelIcon from "@/app/icons/cancel.svg";
import ConfirmIcon from "@/app/icons/confirm.svg";
import Input from "@/app/components/Input";

export function EditMessageModal(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const [messages, setMessages] = useState(session.messages.slice());

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Chat.EditMessage.Title}
        onClose={props.onClose}
        actions={[
          <IconButton
            text={Locale.UI.Cancel}
            icon={<CancelIcon />}
            key="cancel"
            onClick={() => {
              props.onClose();
            }}
          />,
          <IconButton
            type="primary"
            text={Locale.UI.Confirm}
            icon={<ConfirmIcon />}
            key="ok"
            onClick={() => {
              chatStore.updateCurrentSession(
                (session) => (session.messages = messages),
              );
              props.onClose();
            }}
          />,
        ]}
        // className="!bg-modal-mask"
      >
        <List>
          <ListItem
            title={Locale.Chat.EditMessage.Topic.Title}
            subTitle={Locale.Chat.EditMessage.Topic.SubTitle}
          >
            <Input
              type="text"
              value={session.topic}
              onChange={(e) =>
                chatStore.updateCurrentSession(
                  (session) => (session.topic = e || ""),
                )
              }
              className=" text-center"
            ></Input>
          </ListItem>
        </List>
        <ContextPrompts
          context={messages}
          updateContext={(updater) => {
            const newMessages = messages.slice();
            updater(newMessages);
            setMessages(newMessages);
          }}
        />
      </Modal>
    </div>
  );
}
