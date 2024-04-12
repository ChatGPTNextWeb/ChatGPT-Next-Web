import { Fragment, useMemo } from "react";
import { ChatMessage, useChatStore } from "@/app/store/chat";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import Locale from "@/app/locales";

import styles from "./index.module.scss";
import {
  copyToClipboard,
  getMessageImages,
  getMessageTextContent,
  selectOrCopy,
} from "@/app/utils";
import { IconButton } from "@/app/components/button";
import { showPrompt, showToast } from "@/app/components/ui-lib";

import CopyIcon from "@/app/icons/copy.svg";
import ResetIcon from "@/app/icons/reload.svg";
import DeleteIcon from "@/app/icons/clear.svg";
import PinIcon from "@/app/icons/pin.svg";
import EditIcon from "@/app/icons/rename.svg";
import StopIcon from "@/app/icons/pause.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";

import { MultimodalContent } from "@/app/client/api";
import { Avatar } from "@/app/components/emoji";
import { MaskAvatar } from "@/app/components/mask";
import { useAppConfig } from "@/app/store/config";
import ChatAction from "./ChatAction";
import { ChatControllerPool } from "@/app/client/controller";
import ClearContextDivider from "./ClearContextDivider";
import dynamic from "next/dynamic";

export type RenderMessage = ChatMessage & { preview?: boolean };

export interface ChatMessagePanelProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  isMobileScreen: boolean;
  msgRenderIndex: number;
  userInput: string;
  context: any[];
  renderMessages: RenderMessage[];
  setAutoScroll?: (value: boolean) => void;
  setMsgRenderIndex?: (newIndex: number) => void;
  setHitBottom?: (value: boolean) => void;
  setUserInput?: (v: string) => void;
  setIsLoading?: (value: boolean) => void;
  setShowPromptModal?: (value: boolean) => void;
}

const Markdown = dynamic(
  async () => (await import("@/app/components/markdown")).Markdown,
  {
    loading: () => <LoadingIcon />,
  },
);

export default function ChatMessagePanel(props: ChatMessagePanelProps) {
  const {
    scrollRef,
    inputRef,
    setAutoScroll,
    setMsgRenderIndex,
    isMobileScreen,
    msgRenderIndex,
    setHitBottom,
    setUserInput,
    userInput,
    context,
    renderMessages,
    setIsLoading,
    setShowPromptModal,
  } = props;

  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const config = useAppConfig();
  const fontSize = config.fontSize;

  const onChatBodyScroll = (e: HTMLElement) => {
    const bottomHeight = e.scrollTop + e.clientHeight;
    const edgeThreshold = e.clientHeight;

    const isTouchTopEdge = e.scrollTop <= edgeThreshold;
    const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
    const isHitBottom =
      bottomHeight >= e.scrollHeight - (isMobileScreen ? 4 : 10);

    const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
    const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

    if (isTouchTopEdge && !isTouchBottomEdge) {
      setMsgRenderIndex?.(prevPageMsgIndex);
    } else if (isTouchBottomEdge) {
      setMsgRenderIndex?.(nextPageMsgIndex);
    }

    setHitBottom?.(isHitBottom);
    setAutoScroll?.(isHitBottom);
  };

  const onRightClick = (e: any, message: ChatMessage) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, getMessageTextContent(message))) {
      if (userInput.length === 0) {
        setUserInput?.(getMessageTextContent(message));
      }

      e.preventDefault();
    }
  };

  const deleteMessage = (msgId?: string) => {
    chatStore.updateCurrentSession(
      (session) =>
        (session.messages = session.messages.filter((m) => m.id !== msgId)),
    );
  };

  const onDelete = (msgId: string) => {
    deleteMessage(msgId);
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

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! + context.length - msgRenderIndex
      : -1;

  const messages = useMemo(() => {
    const endRenderIndex = Math.min(
      msgRenderIndex + 3 * CHAT_PAGE_SIZE,
      renderMessages.length,
    );
    return renderMessages.slice(msgRenderIndex, endRenderIndex);
  }, [msgRenderIndex, renderMessages]);

  // stop response
  const onUserStop = (messageId: string) => {
    ChatControllerPool.stop(session.id, messageId);
  };

  return (
    <div
      className={styles["chat-body"]}
      ref={scrollRef}
      onScroll={(e) => onChatBodyScroll(e.currentTarget)}
      onMouseDown={() => inputRef.current?.blur()}
      onTouchStart={() => {
        inputRef.current?.blur();
        setAutoScroll?.(false);
      }}
    >
      {messages.map((message, i) => {
        const isUser = message.role === "user";
        const isContext = i < context.length;
        const showActions =
          i > 0 &&
          !(message.preview || message.content.length === 0) &&
          !isContext;
        const showTyping = message.preview || message.streaming;

        const shouldShowClearContextDivider = i === clearContextIndex - 1;

        return (
          <Fragment key={message.id}>
            <div
              className={
                isUser ? styles["chat-message-user"] : styles["chat-message"]
              }
            >
              <div className={styles["chat-message-container"]}>
                <div className={styles["chat-message-header"]}>
                  <div className={styles["chat-message-avatar"]}>
                    <div className={styles["chat-message-edit"]}>
                      <IconButton
                        icon={<EditIcon />}
                        onClick={async () => {
                          const newMessage = await showPrompt(
                            Locale.Chat.Actions.Edit,
                            getMessageTextContent(message),
                            10,
                          );
                          let newContent: string | MultimodalContent[] =
                            newMessage;
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
                        }}
                      ></IconButton>
                    </div>
                    {isUser ? (
                      <Avatar avatar={config.avatar} />
                    ) : (
                      <>
                        {["system"].includes(message.role) ? (
                          <Avatar avatar="2699-fe0f" />
                        ) : (
                          <MaskAvatar
                            avatar={session.mask.avatar}
                            model={
                              message.model || session.mask.modelConfig.model
                            }
                          />
                        )}
                      </>
                    )}
                  </div>

                  {showActions && (
                    <div className={styles["chat-message-actions"]}>
                      <div className={styles["chat-input-actions"]}>
                        {message.streaming ? (
                          <ChatAction
                            text={Locale.Chat.Actions.Stop}
                            icon={<StopIcon />}
                            onClick={() => onUserStop(message.id ?? i)}
                          />
                        ) : (
                          <>
                            <ChatAction
                              text={Locale.Chat.Actions.Retry}
                              icon={<ResetIcon />}
                              onClick={() => onResend(message)}
                            />

                            <ChatAction
                              text={Locale.Chat.Actions.Delete}
                              icon={<DeleteIcon />}
                              onClick={() => onDelete(message.id ?? i)}
                            />

                            <ChatAction
                              text={Locale.Chat.Actions.Pin}
                              icon={<PinIcon />}
                              onClick={() => onPinMessage(message)}
                            />
                            <ChatAction
                              text={Locale.Chat.Actions.Copy}
                              icon={<CopyIcon />}
                              onClick={() =>
                                copyToClipboard(getMessageTextContent(message))
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {showTyping && (
                  <div className={styles["chat-message-status"]}>
                    {Locale.Chat.Typing}
                  </div>
                )}
                <div className={styles["chat-message-item"]}>
                  <Markdown
                    content={getMessageTextContent(message)}
                    loading={
                      (message.preview || message.streaming) &&
                      message.content.length === 0 &&
                      !isUser
                    }
                    onContextMenu={(e) => onRightClick(e, message)}
                    onDoubleClickCapture={() => {
                      if (!isMobileScreen) return;
                      setUserInput?.(getMessageTextContent(message));
                    }}
                    fontSize={fontSize}
                    parentRef={scrollRef}
                    defaultShow={i >= messages.length - 6}
                  />
                  {getMessageImages(message).length == 1 && (
                    <img
                      className={styles["chat-message-item-image"]}
                      src={getMessageImages(message)[0]}
                      alt=""
                    />
                  )}
                  {getMessageImages(message).length > 1 && (
                    <div
                      className={styles["chat-message-item-images"]}
                      style={
                        {
                          "--image-count": getMessageImages(message).length,
                        } as React.CSSProperties
                      }
                    >
                      {getMessageImages(message).map((image, index) => {
                        return (
                          <img
                            className={styles["chat-message-item-image-multi"]}
                            key={index}
                            src={image}
                            alt=""
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={styles["chat-message-action-date"]}>
                  {isContext
                    ? Locale.Chat.IsContext
                    : message.date.toLocaleString()}
                </div>
              </div>
            </div>
            {shouldShowClearContextDivider && <ClearContextDivider />}
          </Fragment>
        );
      })}
    </div>
  );
}
