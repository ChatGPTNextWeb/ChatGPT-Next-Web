import { Fragment, useMemo } from "react";
import { ChatMessage, useChatStore } from "@/app/store/chat";
import { CHAT_PAGE_SIZE } from "@/app/constant";
import Locale from "@/app/locales";

import { getMessageTextContent, selectOrCopy } from "@/app/utils";

import LoadingIcon from "@/app/icons/three-dots.svg";

import { Avatar } from "@/app/components/emoji";
import { MaskAvatar } from "@/app/components/mask";
import { useAppConfig } from "@/app/store/config";
import ClearContextDivider from "./ClearContextDivider";
import dynamic from "next/dynamic";
import useRelativePosition, {
  Orientation,
} from "@/app/hooks/useRelativePosition";
import MessageActions, { RenderMessage } from "./MessageActions";
import Imgs from "@/app/components/Imgs";

export type { RenderMessage };

export interface ChatMessagePanelProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  isMobileScreen: boolean;
  msgRenderIndex: number;
  userInput: string;
  context: any[];
  renderMessages: RenderMessage[];
  scrollDomToBottom: () => void;
  setAutoScroll?: (value: boolean) => void;
  setMsgRenderIndex?: (newIndex: number) => void;
  setHitBottom?: (value: boolean) => void;
  setUserInput?: (v: string) => void;
  setIsLoading?: (value: boolean) => void;
  setShowPromptModal?: (value: boolean) => void;
}

let MarkdownLoadedCallback: () => void;

const Markdown = dynamic(
  async () => {
    const bundle = await import("@/app/components/markdown");

    if (MarkdownLoadedCallback) {
      MarkdownLoadedCallback();
    }
    return bundle.Markdown;
  },
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
    scrollDomToBottom,
  } = props;

  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const config = useAppConfig();
  const fontSize = config.fontSize;

  const { position, getRelativePosition } = useRelativePosition({
    containerRef: scrollRef,
    delay: 0,
    offsetDistance: 20,
  });

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! + context.length - msgRenderIndex
      : -1;

  if (!MarkdownLoadedCallback) {
    MarkdownLoadedCallback = () => {
      window.setTimeout(scrollDomToBottom, 100);
    };
  }

  const messages = useMemo(() => {
    const endRenderIndex = Math.min(
      msgRenderIndex + 3 * CHAT_PAGE_SIZE,
      renderMessages.length,
    );
    return renderMessages.slice(msgRenderIndex, endRenderIndex);
  }, [msgRenderIndex, renderMessages]);

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

  return (
    <div
      className={`pt-[80px] relative flex-1 overscroll-y-none overflow-y-auto overflow-x-hidden px-3 pb-6 md:bg-chat-panel-message bg-chat-panel-message-mobile`}
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

        const shouldShowClearContextDivider = i === clearContextIndex - 1;

        const actionsBarPosition =
          position?.id === message.id &&
          position?.poi.overlapPositions[Orientation.bottom]
            ? "bottom-[calc(100%-0.25rem)]"
            : "top-[calc(100%-0.25rem)]";

        return (
          <Fragment key={message.id}>
            <div
              className={`flex mt-6 gap-2 ${isUser ? "flex-row-reverse" : ""}`}
            >
              <div className={`relative flex-0`}>
                {isUser ? (
                  <Avatar avatar={config.avatar} />
                ) : (
                  <>
                    {["system"].includes(message.role) ? (
                      <Avatar avatar="2699-fe0f" />
                    ) : (
                      <MaskAvatar
                        avatar={session.mask.avatar}
                        model={message.model || session.mask.modelConfig.model}
                      />
                    )}
                  </>
                )}
              </div>
              <div
                className={`group relative flex ${
                  isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={` pointer-events-none  text-text-chat-message-date text-right font-common whitespace-nowrap transition-all duration-500 text-sm absolute z-1 ${
                    isUser ? "right-0" : "left-0"
                  } bottom-[100%] hidden group-hover:block`}
                >
                  {isContext
                    ? Locale.Chat.IsContext
                    : message.date.toLocaleString()}
                </div>
                <div
                  className={`transition-all duration-300 select-text break-words font-common text-sm-title ${
                    isUser
                      ? "rounded-user-message bg-chat-panel-message-user"
                      : "rounded-bot-message bg-chat-panel-message-bot"
                  } box-border peer py-2 px-3`}
                  onPointerMoveCapture={(e) =>
                    getRelativePosition(e.currentTarget, message.id)
                  }
                >
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
                    className={`leading-6 max-w-message-width ${
                      isUser
                        ? " text-text-chat-message-markdown-user"
                        : "text-text-chat-message-markdown-bot"
                    }`}
                  />
                  <Imgs message={message} />
                </div>
                <MessageActions
                  className={actionsBarPosition}
                  message={message}
                  inputRef={inputRef}
                  isUser={isUser}
                  isContext={isContext}
                  setIsLoading={setIsLoading}
                  setShowPromptModal={setShowPromptModal}
                />
              </div>
            </div>
            {shouldShowClearContextDivider && <ClearContextDivider />}
          </Fragment>
        );
      })}
    </div>
  );
}
