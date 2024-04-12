import { useDebouncedCallback } from "use-debounce";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useChatStore,
  BOT_HELLO,
  createMessage,
  useAccessStore,
  useAppConfig,
} from "@/app/store";
import { autoGrowTextArea, useMobileScreen } from "@/app/utils";
import Locale from "@/app/locales";
import { showConfirm } from "@/app/components/ui-lib";
import {
  CHAT_PAGE_SIZE,
  REQUEST_TIMEOUT_MS,
  UNFINISHED_INPUT,
} from "@/app/constant";
import { useCommand } from "@/app/command";
import { prettyObject } from "@/app/utils/format";
import { ExportMessageModal } from "@/app/components/exporter";

import PromptToast from "./PromptToast";
import { EditMessageModal } from "./EditMessageModal";
import ChatHeader from "./ChatHeader";
import ChatInputPanel, { ChatInputPanelInstance } from "./ChatInputPanel";
import ChatMessagePanel, { RenderMessage } from "./ChatMessagePanel";

import styles from "./index.module.scss";

function _Chat() {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const config = useAppConfig();

  const [showExport, setShowExport] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInputPanelRef = useRef<ChatInputPanelInstance | null>(null);

  const [hitBottom, setHitBottom] = useState(true);
  const isMobileScreen = useMobileScreen();

  const [attachImages, setAttachImages] = useState<string[]>([]);

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        20,
        Math.max(2 + Number(!isMobileScreen), rows),
      );
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

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
                ...createMessage({
                  role: "user",
                  content: userInput,
                }),
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
    scrollRef,
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
    setShowPromptModal,
    _setMsgRenderIndex,
  };

  const chatMessagePanelProps = {
    scrollRef,
    inputRef,
    isMobileScreen,
    msgRenderIndex,
    userInput,
    context,
    renderMessages,
    setAutoScroll: chatInputPanelRef.current?.setAutoScroll,
    setMsgRenderIndex: chatInputPanelRef.current?.setMsgRenderIndex,
    setHitBottom,
    setUserInput,
    setIsLoading,
    setShowPromptModal,
  };

  return (
    <div
      className={`${styles.chat}  my-2.5 ml-1 mr-2.5 rounded-md bg-gray-50`}
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

      <PromptToast
        showToast={!hitBottom}
        showModal={showPromptModal}
        setShowModal={setShowPromptModal}
      />
    </div>
  );
}

export default function Chat() {
  const chatStore = useChatStore();
  const sessionIndex = chatStore.currentSessionIndex;
  return <_Chat key={sessionIndex}></_Chat>;
}
