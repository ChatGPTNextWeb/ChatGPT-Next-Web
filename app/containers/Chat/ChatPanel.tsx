import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useChatStore,
  BOT_HELLO,
  createMessage,
  useAccessStore,
  useAppConfig,
  ModelType,
} from "@/app/store";
import Locale from "@/app/locales";
import { Selector, showConfirm, showToast } from "@/app/components/ui-lib";
import {
  CHAT_PAGE_SIZE,
  REQUEST_TIMEOUT_MS,
  UNFINISHED_INPUT,
} from "@/app/constant";
import { useCommand } from "@/app/command";
import { prettyObject } from "@/app/utils/format";
import { ExportMessageModal } from "@/app/components/exporter";

import PromptToast from "./components/PromptToast";
import { EditMessageModal } from "./components/EditMessageModal";
import ChatHeader from "./components/ChatHeader";
import ChatInputPanel, {
  ChatInputPanelInstance,
} from "./components/ChatInputPanel";
import ChatMessagePanel, { RenderMessage } from "./components/ChatMessagePanel";
import { useAllModels } from "@/app/utils/hooks";
import useRows from "@/app/hooks/useRows";
import SessionConfigModel from "./components/SessionConfigModal";
import useScrollToBottom from "@/app/hooks/useScrollToBottom";

function _Chat() {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const config = useAppConfig();

  const { isMobileScreen } = config;

  const [showExport, setShowExport] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInputPanelRef = useRef<ChatInputPanelInstance | null>(null);

  const [hitBottom, setHitBottom] = useState(true);

  const [attachImages, setAttachImages] = useState<string[]>([]);

  // auto grow input
  const { measure, inputRows } = useRows({
    inputRef,
  });

  const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(scrollRef);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  useEffect(() => {
    chatStore.updateCurrentSession((session) => {
      const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
      session.messages.forEach((m) => {
        // check if should stop all stale messages
        if (m.isError || new Date(m.date).getTime() < stopTiming) {
          if (m.streaming) {
            m.streaming = false;
          }

          if (m.content.length === 0) {
            m.isError = true;
            m.content = prettyObject({
              error: true,
              message: "empty response",
            });
          }
        }
      });

      // auto sync mask config from global config
      if (session.mask.syncGlobalConfig) {
        console.log("[Mask] syncing from global, name = ", session.mask.name);
        session.mask.modelConfig = { ...config.modelConfig };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const context: RenderMessage[] = useMemo(() => {
    return session.mask.hideContext ? [] : session.mask.context.slice();
  }, [session.mask.context, session.mask.hideContext]);
  const accessStore = useAccessStore();

  if (
    context.length === 0 &&
    session.messages.at(0)?.content !== BOT_HELLO.content
  ) {
    const copiedHello = Object.assign({}, BOT_HELLO);
    if (!accessStore.isAuthorized()) {
      copiedHello.content = Locale.Error.Unauthorized;
    }
    context.push(copiedHello);
  }

  // preview messages
  const renderMessages = useMemo(() => {
    return context
      .concat(session.messages as RenderMessage[])
      .concat(
        isLoading
          ? [
              {
                ...createMessage({
                  role: "assistant",
                  content: "……",
                }),
                preview: true,
              },
            ]
          : [],
      )
      .concat(
        userInput.length > 0 && config.sendPreviewBubble
          ? [
              {
                ...createMessage(
                  {
                    role: "user",
                    content: userInput,
                  },
                  {
                    customId: "typing",
                  },
                ),
                preview: true,
              },
            ]
          : [],
      );
  }, [
    config.sendPreviewBubble,
    context,
    isLoading,
    session.messages,
    userInput,
  ]);

  const [msgRenderIndex, _setMsgRenderIndex] = useState(
    Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
  );

  const [showPromptModal, setShowPromptModal] = useState(false);

  useCommand({
    fill: setUserInput,
    submit: (text) => {
      chatInputPanelRef.current?.doSubmit(text);
    },
    code: (text) => {
      if (accessStore.disableFastLink) return;
      console.log("[Command] got code from url: ", text);
      showConfirm(Locale.URLCommand.Code + `code = ${text}`).then((res) => {
        if (res) {
          accessStore.update((access) => (access.accessCode = text));
        }
      });
    },
    settings: (text) => {
      if (accessStore.disableFastLink) return;

      try {
        const payload = JSON.parse(text) as {
          key?: string;
          url?: string;
        };

        console.log("[Command] got settings from url: ", payload);

        if (payload.key || payload.url) {
          showConfirm(
            Locale.URLCommand.Settings +
              `\n${JSON.stringify(payload, null, 4)}`,
          ).then((res) => {
            if (!res) return;
            if (payload.key) {
              accessStore.update(
                (access) => (access.openaiApiKey = payload.key!),
              );
            }
            if (payload.url) {
              accessStore.update((access) => (access.openaiUrl = payload.url!));
            }
          });
        }
      } catch {
        console.error("[Command] failed to get settings from url: ", text);
      }
    },
  });

  // edit / insert message modal
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  // remember unfinished input
  useEffect(() => {
    // try to load from local storage
    const key = UNFINISHED_INPUT(session.id);
    const mayBeUnfinishedInput = localStorage.getItem(key);
    if (mayBeUnfinishedInput && userInput.length === 0) {
      setUserInput(mayBeUnfinishedInput);
      localStorage.removeItem(key);
    }

    const dom = inputRef.current;
    return () => {
      localStorage.setItem(key, dom?.value ?? "");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chatinputPanelProps = {
    inputRef,
    isMobileScreen,
    renderMessages,
    attachImages,
    userInput,
    hitBottom,
    inputRows,
    setAttachImages,
    setUserInput,
    setIsLoading,
    showChatSetting: setShowPromptModal,
    _setMsgRenderIndex,
    scrollDomToBottom,
    setAutoScroll,
  };

  const chatMessagePanelProps = {
    scrollRef,
    inputRef,
    isMobileScreen,
    msgRenderIndex,
    userInput,
    context,
    renderMessages,
    setAutoScroll,
    setMsgRenderIndex: chatInputPanelRef.current?.setMsgRenderIndex,
    setHitBottom,
    setUserInput,
    setIsLoading,
    setShowPromptModal,
    scrollDomToBottom,
  };

  return (
    <div
      className={`
        relative flex flex-col overflow-hidden bg-chat-panel
        max-md:absolute max-md:h-[100vh] max-md:w-[100%]
        md:h-[100%] md:mr-2.5 md:rounded-md
        `}
      key={session.id}
    >
      <ChatHeader
        setIsEditingMessage={setIsEditingMessage}
        setShowExport={setShowExport}
        isMobileScreen={isMobileScreen}
      />

      <ChatMessagePanel {...chatMessagePanelProps} />

      <ChatInputPanel ref={chatInputPanelRef} {...chatinputPanelProps} />

      {showExport && (
        <ExportMessageModal onClose={() => setShowExport(false)} />
      )}

      {isEditingMessage && (
        <EditMessageModal
          onClose={() => {
            setIsEditingMessage(false);
          }}
        />
      )}

      <PromptToast showToast={!hitBottom} setShowModal={setShowPromptModal} />

      {showPromptModal && (
        <SessionConfigModel onClose={() => setShowPromptModal(false)} />
      )}
    </div>
  );
}

export default function Chat() {
  const chatStore = useChatStore();
  const sessionIndex = chatStore.currentSessionIndex;
  return <_Chat key={sessionIndex}></_Chat>;
}
