import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import SendWhiteIcon from "../icons/send-white.svg";
import RenameIcon from "../icons/rename.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import EditIcon from "../icons/rename.svg";
import StopIcon from "../icons/pause.svg";
import MicphoneIcon from "../icons/Micphone.svg";
import ResetIcon from "../icons/reload.svg";

import {
  ChatMessage,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  createMessage,
  useAccessStore,
  Theme,
  useAppConfig,
  DEFAULT_TOPIC,
  ALL_MODELS,
} from "../store";

import { copyToClipboard, useMobileScreen } from "../utils";

import { ChatControllerPool } from "../client/controller";
import Locale, { AllLangs, ALL_LANG_OPTIONS, DEFAULT_LANG } from "../locales";

import { IconButton } from "../components/button";
import styles from "../components/chat.module.scss";

import {
  Input,
  List,
  ListItem,
  Modal,
  Select,
  showModal,
  showConfirm,
  showPrompt,
  showToast,
} from "../components/ui-lib";
import { useLocation, useNavigate } from "react-router-dom";
import { LAST_INPUT_KEY, Path, REQUEST_TIMEOUT_MS } from "../constant";
import { prettyObject } from "../utils/format";
import { ExportMessageModal } from "../components/exporter";
import { getClientConfig } from "../config/client";
import { ModelConfig, SpeechConfig } from "../store/config";

import speechSdk from "../cognitive/speech-sdk";

import { ToastmastersEvaluatorGuidance, ToastmastersEvaluators } from "./roles";
import en from "../locales/en";
import {
  ChatInput,
  ChatAction,
  Markdown,
  useScrollToBottom,
} from "./chat-common";

export function Chat() {
  type RenderMessage = ChatMessage & { preview?: boolean };

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const config = useAppConfig();
  const fontSize = config.fontSize;

  const [showExport, setShowExport] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();

  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 10;
    setHitBottom(isTouchBottom);
  };

  const doSubmit = () => {
    const question = session.input.text;
    const speech = session.input2.text;

    if (question.trim() === "" || speech === "") return;

    // reset status from 0
    chatStore.resetSession();

    var ask = ToastmastersEvaluatorGuidance(question, speech);
    chatStore.onUserInput(ask);

    for (let i = 0; i < ToastmastersEvaluators.length; i++) {
      chatStore.getIsFinished().then(() => {
        ask = ToastmastersEvaluators[i].content;
        chatStore.onUserInput(ask);
      });
    }
    // the last role is doing
    // chatStore.getIsFinished().then(() => {});

    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  };

  const onResend = (roleIndex: number) => {
    // reset status from messageIndex
    chatStore.resetSessionFromIndex(2 * roleIndex + 2);

    var ask = ToastmastersEvaluators[roleIndex].content;
    chatStore.onUserInput(ask);

    for (let i = roleIndex + 1; i < ToastmastersEvaluators.length; i++) {
      chatStore.getIsFinished().then(() => {
        ask = ToastmastersEvaluators[i].content;
        chatStore.onUserInput(ask);
      });
    }
    // the last role is doing
    // chatStore.getIsFinished().then(() => {});

    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  };

  const onEdit = async (botMessage: ChatMessage) => {
    const newMessage = await showPrompt(
      Locale.Chat.Actions.Edit,
      botMessage.content,
    );
    chatStore.updateCurrentSession((session) => {
      const m = session.messages.find((m) => m.id === botMessage.id);
      if (m) {
        m.content = newMessage;
      }
    });
  };

  // stop response
  const onUserStop = (messageId: number) => {
    ChatControllerPool.stop(sessionIndex, messageId);
  };

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

  const context: RenderMessage[] = session.mask.hideContext
    ? []
    : session.mask.context.slice();

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

  const renameSession = () => {
    showPrompt(Locale.Chat.Rename, session.topic).then((newTopic) => {
      if (newTopic && newTopic !== session.topic) {
        chatStore.updateCurrentSession(
          (session) => (session.topic = newTopic!),
        );
      }
    });
  };

  const clientConfig = useMemo(() => getClientConfig(), []);

  const location = useLocation();
  const isChat = location.pathname === Path.Chat;

  const autoFocus = !isMobileScreen || isChat; // only focus in chat page
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

  return (
    <div className={styles.chat} key={session.id}>
      <div className="window-header" data-tauri-drag-region>
        {isMobileScreen && (
          <div className="window-actions">
            <div className={"window-action-button"}>
              <IconButton
                icon={<ReturnIcon />}
                bordered
                title={Locale.Chat.Actions.ChatList}
                onClick={() => navigate(Path.Home)}
              />
            </div>
          </div>
        )}

        <div className={`window-header-title ${styles["chat-body-title"]}`}>
          <div
            className={`window-header-main-title ${styles["chat-body-main-title"]}`}
            onClickCapture={renameSession}
          >
            {!session.topic ? DEFAULT_TOPIC : session.topic}
          </div>
          <div className="window-header-sub-title">
            {Locale.Chat.SubTitle(session.messages.length)}
          </div>
        </div>
        <div className="window-actions">
          {!isMobileScreen && (
            <div className="window-action-button">
              <IconButton
                icon={<RenameIcon />}
                bordered
                onClick={renameSession}
              />
            </div>
          )}
          <div className="window-action-button">
            <IconButton
              icon={<ExportIcon />}
              bordered
              title={Locale.Chat.Actions.Export}
              onClick={() => {
                setShowExport(true);
              }}
            />
          </div>
          {showMaxIcon && (
            <div className="window-action-button">
              <IconButton
                icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
                bordered
                onClick={() => {
                  config.update(
                    (config) => (config.tightBorder = !config.tightBorder),
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        // onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        onMouseDown={() => inputRef.current?.blur()}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <List>
          <ChatInput title="Question" inputStore={session.input} />
          <ChatInput title="Impromptu Speech" inputStore={session.input2} />

          <div className={styles["chat-input-panel-buttons"]}>
            <IconButton
              icon={<SendWhiteIcon />}
              text={Locale.Chat.Send}
              className={styles["chat-input-button-send"]}
              bordered
              type="primary"
              onClick={doSubmit}
            />
          </div>

          <div className={styles["chat-input-border-bottom"]}></div>

          <div className={styles["chat-input-panel"]}>
            {ToastmastersEvaluators.map((role, index) => {
              // if length > index => the data is ready => show the data, else show the last data
              var message: ChatMessage = createMessage({});
              if (session.messages.length > 2 * index + 4)
                // data is ready, just read it
                message = session.messages[2 * index + 3];
              else if (session.messages.length == 2 * index + 4)
                message = session.messages[session.messages.length - 1];

              var showActions = message.content.length > 0;

              return (
                <div key={index} className={styles["chat-message-hover"]}>
                  <div className={styles["chat-input-panel-title"]}>
                    {" "}
                    {role.role}
                  </div>

                  <div className={styles["chat-message-item"]}>
                    {showActions && (
                      <div className={styles["chat-message-actions"]}>
                        <div
                          className={styles["chat-input-actions"]}
                          style={{
                            marginTop: 10,
                            marginBottom: 0,
                          }}
                        >
                          {message.streaming ? (
                            <ChatAction
                              text={Locale.Chat.Actions.Stop}
                              icon={<StopIcon />}
                              onClick={() =>
                                onUserStop(message.id ?? 2 * index + 3)
                              }
                            />
                          ) : (
                            <>
                              <ChatAction
                                text={Locale.Chat.Actions.Edit}
                                icon={<EditIcon />}
                                onClick={() => onEdit(message)}
                              />
                              <ChatAction
                                text={Locale.Chat.Actions.Retry}
                                icon={<ResetIcon />}
                                onClick={() => onResend(index)}
                              />
                              <ChatAction
                                text={Locale.Chat.Actions.Copy}
                                icon={<CopyIcon />}
                                onClick={() => copyToClipboard(message.content)}
                              />
                              <ChatAction
                                text={Locale.Chat.Actions.Play}
                                icon={<MicphoneIcon />}
                                onClick={() =>
                                  speechSdk.handleSynthesize(message.content)
                                }
                              />
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <Markdown
                      content={message?.content}
                      fontSize={fontSize}
                      parentRef={scrollRef}
                    />

                    <div className={styles["chat-message-action-date"]}>
                      {message.content.length > 0
                        ? message.content.split(/\s+/).length
                        : 0}{" "}
                      words
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </List>
      </div>

      {showExport && (
        <ExportMessageModal onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
