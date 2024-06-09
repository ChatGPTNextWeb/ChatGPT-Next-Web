import Locale from "@/app/locales";

import StopIcon from "@/app/icons/pause.svg";
import DeleteRequestIcon from "@/app/icons/deleteRequestIcon.svg";
import RetryRequestIcon from "@/app/icons/retryRequestIcon.svg";
import CopyRequestIcon from "@/app/icons/copyRequestIcon.svg";
import EditRequestIcon from "@/app/icons/editRequestIcon.svg";
import PinRequestIcon from "@/app/icons/pinRequestIcon.svg";
import { showPrompt, showToast } from "@/app/components/ui-lib";
import {
  copyToClipboard,
  getMessageImages,
  getMessageTextContent,
} from "@/app/utils";
import { MultimodalContent } from "@/app/client/api";
import { ChatMessage, useChatStore } from "@/app/store/chat";
import ActionsBar from "@/app/components/ActionsBar";
import { ChatControllerPool } from "@/app/client/controller";
import { RefObject } from "react";

export type RenderMessage = ChatMessage & { preview?: boolean };

export interface MessageActionsProps {
  message: RenderMessage;
  isUser: boolean;
  isContext: boolean;
  showActions?: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  className?: string;
  setIsLoading?: (value: boolean) => void;
  setShowPromptModal?: (value: boolean) => void;
}

const genActionsSchema = (
  message: RenderMessage,
  {
    onEdit,
    onCopy,
    onPinMessage,
    onDelete,
    onResend,
    onUserStop,
  }: Record<
    | "onEdit"
    | "onCopy"
    | "onPinMessage"
    | "onDelete"
    | "onResend"
    | "onUserStop",
    (message: RenderMessage) => void
  >,
) => {
  const className =
    " !p-1 hover:bg-chat-message-actions-btn-hovered !rounded-actions-bar-btn ";
  return [
    {
      id: "Edit",
      icons: <EditRequestIcon />,
      title: "Edit",
      className,
      onClick: () => onEdit(message),
    },
    {
      id: Locale.Chat.Actions.Copy,
      icons: <CopyRequestIcon />,
      title: Locale.Chat.Actions.Copy,
      className,
      onClick: () => onCopy(message),
    },
    {
      id: Locale.Chat.Actions.Pin,
      icons: <PinRequestIcon />,
      title: Locale.Chat.Actions.Pin,
      className,
      onClick: () => onPinMessage(message),
    },
    {
      id: Locale.Chat.Actions.Delete,
      icons: <DeleteRequestIcon />,
      title: Locale.Chat.Actions.Delete,
      className,
      onClick: () => onDelete(message),
    },
    {
      id: Locale.Chat.Actions.Retry,
      icons: <RetryRequestIcon />,
      title: Locale.Chat.Actions.Retry,
      className,
      onClick: () => onResend(message),
    },
    {
      id: Locale.Chat.Actions.Stop,
      icons: <StopIcon />,
      title: Locale.Chat.Actions.Stop,
      className,
      onClick: () => onUserStop(message),
    },
  ];
};

enum GroupType {
  "streaming" = "streaming",
  "isContext" = "isContext",
  "normal" = "normal",
}

const groupsTypes = {
  [GroupType.streaming]: [[Locale.Chat.Actions.Stop]],
  [GroupType.isContext]: [["Edit"]],
  [GroupType.normal]: [
    [
      Locale.Chat.Actions.Retry,
      "Edit",
      Locale.Chat.Actions.Copy,
      Locale.Chat.Actions.Pin,
      Locale.Chat.Actions.Delete,
    ],
  ],
};

export default function MessageActions(props: MessageActionsProps) {
  const {
    className,
    message,
    isUser,
    isContext,
    showActions = true,
    setIsLoading,
    inputRef,
    setShowPromptModal,
  } = props;

  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  const deleteMessage = (msgId?: string) => {
    chatStore.updateCurrentSession(
      (session) =>
        (session.messages = session.messages.filter((m) => m.id !== msgId)),
    );
  };

  const onDelete = (message: ChatMessage) => {
    deleteMessage(message.id);
  };

  const onResend = (message: ChatMessage) => {
    // when it is resending a message
    // 1. for a user's message, find the next bot response
    // 2. for a bot's message, find the last user's input
    // 3. delete original user input and bot's message
    // 4. resend the user's input

    const resendingIndex = session.messages.findIndex(
      (m) => m.id === message.id,
    );

    if (resendingIndex < 0 || resendingIndex >= session.messages.length) {
      console.error("[Chat] failed to find resending message", message);
      return;
    }

    let userMessage: ChatMessage | undefined;
    let botMessage: ChatMessage | undefined;

    if (message.role === "assistant") {
      // if it is resending a bot's message, find the user input for it
      botMessage = message;
      for (let i = resendingIndex; i >= 0; i -= 1) {
        if (session.messages[i].role === "user") {
          userMessage = session.messages[i];
          break;
        }
      }
    } else if (message.role === "user") {
      // if it is resending a user's input, find the bot's response
      userMessage = message;
      for (let i = resendingIndex; i < session.messages.length; i += 1) {
        if (session.messages[i].role === "assistant") {
          botMessage = session.messages[i];
          break;
        }
      }
    }

    if (userMessage === undefined) {
      console.error("[Chat] failed to resend", message);
      return;
    }

    // delete the original messages
    deleteMessage(userMessage.id);
    deleteMessage(botMessage?.id);

    // resend the message
    setIsLoading?.(true);
    const textContent = getMessageTextContent(userMessage);
    const images = getMessageImages(userMessage);
    chatStore
      .onUserInput(textContent, images)
      .then(() => setIsLoading?.(false));
    inputRef.current?.focus();
  };

  const onPinMessage = (message: ChatMessage) => {
    chatStore.updateCurrentSession((session) =>
      session.mask.context.push(message),
    );

    showToast(Locale.Chat.Actions.PinToastContent, {
      text: Locale.Chat.Actions.PinToastAction,
      onClick: () => {
        setShowPromptModal?.(true);
      },
    });
  };

  // stop response
  const onUserStop = (message: ChatMessage) => {
    ChatControllerPool.stop(session.id, message.id);
  };

  const onEdit = async () => {
    const newMessage = await showPrompt(
      Locale.Chat.Actions.Edit,
      getMessageTextContent(message),
      10,
    );
    let newContent: string | MultimodalContent[] = newMessage;
    const images = getMessageImages(message);
    if (images.length > 0) {
      newContent = [{ type: "text", text: newMessage }];
      for (let i = 0; i < images.length; i++) {
        newContent.push({
          type: "image_url",
          image_url: {
            url: images[i],
          },
        });
      }
    }
    chatStore.updateCurrentSession((session) => {
      const m = session.mask.context
        .concat(session.messages)
        .find((m) => m.id === message.id);
      if (m) {
        m.content = newContent;
      }
    });
  };

  const onCopy = () => copyToClipboard(getMessageTextContent(message));

  const groupsType = [
    message.streaming && GroupType.streaming,
    isContext && GroupType.isContext,
    GroupType.normal,
  ].find((i) => i) as GroupType;

  return (
    showActions && (
      <div
        className={`
          absolute z-10 w-[100%]
          ${isUser ? "right-0" : "left-0"} 
          transition-all duration-300 
          opacity-0
          pointer-events-none
          group-hover:opacity-100 
          group-hover:pointer-events-auto
          ${className}
        `}
      >
        <ActionsBar
          actionsSchema={genActionsSchema(message, {
            onCopy,
            onDelete,
            onPinMessage,
            onEdit,
            onResend,
            onUserStop,
          })}
          groups={groupsTypes[groupsType]}
          className={`
            float-right flex flex-row gap-1  p-1
            bg-chat-message-actions 
            rounded-md 
            shadow-message-actions-bar 
            dark:bg-none
          `}
        />
      </div>
    )
  );
}
