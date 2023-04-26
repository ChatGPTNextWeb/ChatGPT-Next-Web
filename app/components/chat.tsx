import { useDebounce, useDebouncedCallback } from "use-debounce";
import { memo, useState, useRef, useEffect, useLayoutEffect } from "react";

import SendWhiteIcon from "../icons/send-white.svg";
import BrainIcon from "../icons/brain.svg";
import RenameIcon from "../icons/rename.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import DownloadIcon from "../icons/download.svg";
import LoadingIcon from "../icons/three-dots.svg";
import BotIcon from "../icons/bot.svg";
import BlackBotIcon from "../icons/black-bot.svg";
import AddIcon from "../icons/add.svg";
import DeleteIcon from "../icons/delete.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";

import LightIcon from "../icons/light.svg";
import DarkIcon from "../icons/dark.svg";
import AutoIcon from "../icons/auto.svg";
import BottomIcon from "../icons/bottom.svg";
import StopIcon from "../icons/pause.svg";

import {
  Message,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  ROLES,
  createMessage,
  useAccessStore,
  Theme,
  ModelType,
  useAppConfig,
} from "../store";

import {
  copyToClipboard,
  downloadAs,
  getEmojiUrl,
  selectOrCopy,
  autoGrowTextArea,
  useMobileScreen,
} from "../utils";

import dynamic from "next/dynamic";

import { ControllerPool } from "../requests";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale from "../locales";

import { IconButton } from "./button";
import styles from "./home.module.scss";
import chatStyle from "./chat.module.scss";

import { Input, Modal, showModal } from "./ui-lib";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";

const Markdown = dynamic(
  async () => memo((await import("./markdown")).Markdown),
  {
    loading: () => <LoadingIcon />,
  },
);

const Emoji = dynamic(async () => (await import("emoji-picker-react")).Emoji, {
  loading: () => <LoadingIcon />,
});

export function Avatar(props: { role: Message["role"]; model?: ModelType }) {
  const config = useAppConfig();

  if (props.role !== "user") {
    return (
      <div className="no-dark">
        {props.model?.startsWith("gpt-4") ? (
          <BlackBotIcon className={styles["user-avtar"]} />
        ) : (
          <BotIcon className={styles["user-avtar"]} />
        )}
      </div>
    );
  }

  return (
    <div className={styles["user-avtar"]}>
      <Emoji unified={config.avatar} size={18} getEmojiUrl={getEmojiUrl} />
    </div>
  );
}

function exportMessages(messages: Message[], topic: string) {
  const mdText =
    `# ${topic}\n\n` +
    messages
      .map((m) => {
        return m.role === "user"
          ? `## ${Locale.Export.MessageFromYou}:\n${m.content}`
          : `## ${Locale.Export.MessageFromChatGPT}:\n${m.content.trim()}`;
      })
      .join("\n\n");
  const filename = `${topic}.md`;

  showModal({
    title: Locale.Export.Title,
    children: (
      <div className="markdown-body">
        <pre className={styles["export-content"]}>{mdText}</pre>
      </div>
    ),
    actions: [
      <IconButton
        key="copy"
        icon={<CopyIcon />}
        bordered
        text={Locale.Export.Copy}
        onClick={() => copyToClipboard(mdText)}
      />,
      <IconButton
        key="download"
        icon={<DownloadIcon />}
        bordered
        text={Locale.Export.Download}
        onClick={() => downloadAs(mdText, filename)}
      />,
    ],
  });
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.context;

  const addContextPrompt = (prompt: Message) => {
    chatStore.updateCurrentSession((session) => {
      session.context.push(prompt);
    });
  };

  const removeContextPrompt = (i: number) => {
    chatStore.updateCurrentSession((session) => {
      session.context.splice(i, 1);
    });
  };

  const updateContextPrompt = (i: number, prompt: Message) => {
    chatStore.updateCurrentSession((session) => {
      session.context[i] = prompt;
    });
  };

  return (
    <div className={chatStyle["prompt-toast"]} key="prompt-toast">
      {props.showToast && (
        <div
          className={chatStyle["prompt-toast-inner"] + " clickable"}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={chatStyle["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <div className="modal-mask">
          <Modal
            title={Locale.Context.Edit}
            onClose={() => props.setShowModal(false)}
            actions={[
              <IconButton
                key="reset"
                icon={<CopyIcon />}
                bordered
                text={Locale.Memory.Reset}
                onClick={() =>
                  confirm(Locale.Memory.ResetConfirm) &&
                  chatStore.resetSession()
                }
              />,
              <IconButton
                key="copy"
                icon={<CopyIcon />}
                bordered
                text={Locale.Memory.Copy}
                onClick={() => copyToClipboard(session.memoryPrompt)}
              />,
            ]}
          >
            <>
              <div className={chatStyle["context-prompt"]}>
                {context.map((c, i) => (
                  <div className={chatStyle["context-prompt-row"]} key={i}>
                    <select
                      value={c.role}
                      className={chatStyle["context-role"]}
                      onChange={(e) =>
                        updateContextPrompt(i, {
                          ...c,
                          role: e.target.value as any,
                        })
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={c.content}
                      type="text"
                      className={chatStyle["context-content"]}
                      rows={1}
                      onInput={(e) =>
                        updateContextPrompt(i, {
                          ...c,
                          content: e.currentTarget.value as any,
                        })
                      }
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      className={chatStyle["context-delete-button"]}
                      onClick={() => removeContextPrompt(i)}
                      bordered
                    />
                  </div>
                ))}

                <div className={chatStyle["context-prompt-row"]}>
                  <IconButton
                    icon={<AddIcon />}
                    text={Locale.Context.Add}
                    bordered
                    className={chatStyle["context-prompt-button"]}
                    onClick={() =>
                      addContextPrompt({
                        role: "system",
                        content: "",
                        date: "",
                      })
                    }
                  />
                </div>
              </div>
              <div className={chatStyle["memory-prompt"]}>
                <div className={chatStyle["memory-prompt-title"]}>
                  <span>
                    {Locale.Memory.Title} ({session.lastSummarizeIndex} of{" "}
                    {session.messages.length})
                  </span>

                  <label className={chatStyle["memory-prompt-action"]}>
                    {Locale.Memory.Send}
                    <input
                      type="checkbox"
                      checked={session.sendMemory}
                      onChange={() =>
                        chatStore.updateCurrentSession(
                          (session) =>
                            (session.sendMemory = !session.sendMemory),
                        )
                      }
                    ></input>
                  </label>
                </div>
                <div className={chatStyle["memory-prompt-content"]}>
                  {session.memoryPrompt || Locale.Memory.EmptyContent}
                </div>
              </div>
            </>
          </Modal>
        </div>
      )}
    </div>
  );
}

function useSubmitHandler() {
  const config = useAppConfig();
  const submitKey = config.submitKey;

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && e.nativeEvent.isComposing) return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export function PromptHints(props: {
  prompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
}) {
  if (props.prompts.length === 0) return null;

  return (
    <div className={styles["prompt-hints"]}>
      {props.prompts.map((prompt, i) => (
        <div
          className={styles["prompt-hint"]}
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
        >
          <div className={styles["hint-title"]}>{prompt.title}</div>
          <div className={styles["hint-content"]}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollToBottom = () => {
    const dom = scrollRef.current;
    if (dom) {
      setTimeout(() => (dom.scrollTop = dom.scrollHeight), 1);
    }
  };

  // auto scroll
  useLayoutEffect(() => {
    autoScroll && scrollToBottom();
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollToBottom,
  };
}

export function ChatActions(props: {
  showPromptModal: () => void;
  scrollToBottom: () => void;
  hitBottom: boolean;
}) {
  const config = useAppConfig();

  // switch themes
  const theme = config.theme;
  function nextTheme() {
    const themes = [Theme.Auto, Theme.Light, Theme.Dark];
    const themeIndex = themes.indexOf(theme);
    const nextIndex = (themeIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    config.update((config) => (config.theme = nextTheme));
  }

  // stop all responses
  const couldStop = ControllerPool.hasPending();
  const stopAll = () => ControllerPool.stopAll();

  return (
    <div className={chatStyle["chat-input-actions"]}>
      {couldStop && (
        <div
          className={`${chatStyle["chat-input-action"]} clickable`}
          onClick={stopAll}
        >
          <StopIcon />
        </div>
      )}
      {!props.hitBottom && (
        <div
          className={`${chatStyle["chat-input-action"]} clickable`}
          onClick={props.scrollToBottom}
        >
          <BottomIcon />
        </div>
      )}
      {props.hitBottom && (
        <div
          className={`${chatStyle["chat-input-action"]} clickable`}
          onClick={props.showPromptModal}
        >
          <BrainIcon />
        </div>
      )}

      <div
        className={`${chatStyle["chat-input-action"]} clickable`}
        onClick={nextTheme}
      >
        {theme === Theme.Auto ? (
          <AutoIcon />
        ) : theme === Theme.Light ? (
          <LightIcon />
        ) : theme === Theme.Dark ? (
          <DarkIcon />
        ) : null}
      </div>
    </div>
  );
}

export function Chat() {
  type RenderMessage = Message & { preview?: boolean };

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const config = useAppConfig();
  const fontSize = config.fontSize;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [beforeInput, setBeforeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(false);
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();

  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 20;
    setHitBottom(isTouchBottom);
  };

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<Prompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      setPromptHints(promptStore.search(text));
    },
    100,
    { leading: true, trailing: true },
  );

  const onPromptSelect = (prompt: Prompt) => {
    setUserInput(prompt.content);
    setPromptHints([]);
    inputRef.current?.focus();
  };

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        5,
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

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith("/")) {
        let searchText = text.slice(1);
        onSearch(searchText);
      }
    }
  };

  // submit user input
  const onUserSubmit = () => {
    if (userInput.length <= 0) return;
    setIsLoading(true);
    chatStore.onUserInput(userInput).then(() => setIsLoading(false));
    setBeforeInput(userInput);
    setUserInput("");
    setPromptHints([]);
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  };

  // stop response
  const onUserStop = (messageId: number) => {
    ControllerPool.stop(sessionIndex, messageId);
  };

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput
    if (e.key === "ArrowUp" && userInput.length <= 0) {
      setUserInput(beforeInput);
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e)) {
      onUserSubmit();
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: Message) => {
    // auto fill user input
    if (message.role === "user") {
      setUserInput(message.content);
    }

    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message.content)) {
      e.preventDefault();
    }
  };

  const findLastUserIndex = (messageId: number) => {
    // find last user input message and resend
    let lastUserMessageIndex: number | null = null;
    for (let i = 0; i < session.messages.length; i += 1) {
      const message = session.messages[i];
      if (message.id === messageId) {
        break;
      }
      if (message.role === "user") {
        lastUserMessageIndex = i;
      }
    }

    return lastUserMessageIndex;
  };

  const deleteMessage = (userIndex: number) => {
    chatStore.updateCurrentSession((session) =>
      session.messages.splice(userIndex, 2),
    );
  };

  const onDelete = (botMessageId: number) => {
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;
    deleteMessage(userIndex);
  };

  const onResend = (botMessageId: number) => {
    // find last user input message and resend
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;

    setIsLoading(true);
    const content = session.messages[userIndex].content;
    deleteMessage(userIndex);
    chatStore.onUserInput(content).then(() => setIsLoading(false));
    inputRef.current?.focus();
  };

  const context: RenderMessage[] = session.context.slice();

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
  const messages = context
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

  const [showPromptModal, setShowPromptModal] = useState(false);

  const renameSession = () => {
    const newTopic = prompt(Locale.Chat.Rename, session.topic);
    if (newTopic && newTopic !== session.topic) {
      chatStore.updateCurrentSession((session) => (session.topic = newTopic!));
    }
  };

  // Auto focus
  useEffect(() => {
    if (isMobileScreen) return;
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.chat} key={session.id}>
      <div className={styles["window-header"]}>
        <div className={styles["window-header-title"]}>
          <div
            className={`${styles["window-header-main-title"]} ${styles["chat-body-title"]}`}
            onClickCapture={renameSession}
          >
            {session.topic}
          </div>
          <div className={styles["window-header-sub-title"]}>
            {Locale.Chat.SubTitle(session.messages.length)}
          </div>
        </div>
        <div className={styles["window-header-title"]}>
          <img
            src="data:image/png;base64,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"
            title="扫码关注领取免费授权码"
            alt="关注微信 18827633252"
          />
        </div>
        <div className={styles["window-actions"]}>
          <div className={styles["window-action-button"] + " " + styles.mobile}>
            <IconButton
              icon={<ReturnIcon />}
              bordered
              title={Locale.Chat.Actions.ChatList}
              onClick={() => navigate(Path.Home)}
            />
          </div>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<RenameIcon />}
              bordered
              onClick={renameSession}
            />
          </div>
          {/* <div className={styles["window-action-button"]}>
            <IconButton
              icon={<ExportIcon />}
              bordered
              title={Locale.Chat.Actions.Export}
              onClick={() => {
                exportMessages(
                  session.messages.filter((msg) => !msg.isError),
                  session.topic,
                );
              }}
            />
          </div> */}
          {!isMobileScreen && (
            <div className={styles["window-action-button"]}>
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

        <PromptToast
          showToast={!hitBottom}
          showModal={showPromptModal}
          setShowModal={setShowPromptModal}
        />
      </div>

      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        onMouseDown={() => inputRef.current?.blur()}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {messages.map((message, i) => {
          const isUser = message.role === "user";
          const showActions =
            !isUser &&
            i > 0 &&
            !(message.preview || message.content.length === 0);
          const showTyping = message.preview || message.streaming;

          return (
            <div
              key={i}
              className={
                isUser ? styles["chat-message-user"] : styles["chat-message"]
              }
            >
              <div className={styles["chat-message-container"]}>
                <div className={styles["chat-message-avatar"]}>
                  <Avatar role={message.role} model={message.model} />
                </div>
                {showTyping && (
                  <div className={styles["chat-message-status"]}>
                    {Locale.Chat.Typing}
                  </div>
                )}
                <div className={styles["chat-message-item"]}>
                  {showActions && (
                    <div className={styles["chat-message-top-actions"]}>
                      {message.streaming ? (
                        <div
                          className={styles["chat-message-top-action"]}
                          onClick={() => onUserStop(message.id ?? i)}
                        >
                          {Locale.Chat.Actions.Stop}
                        </div>
                      ) : (
                        <>
                          <div
                            className={styles["chat-message-top-action"]}
                            onClick={() => onDelete(message.id ?? i)}
                          >
                            {Locale.Chat.Actions.Delete}
                          </div>
                          <div
                            className={styles["chat-message-top-action"]}
                            onClick={() => onResend(message.id ?? i)}
                          >
                            {Locale.Chat.Actions.Retry}
                          </div>
                        </>
                      )}

                      <div
                        className={styles["chat-message-top-action"]}
                        onClick={() => copyToClipboard(message.content)}
                      >
                        {Locale.Chat.Actions.Copy}
                      </div>
                    </div>
                  )}
                  <Markdown
                    content={message.content}
                    loading={
                      (message.preview || message.content.length === 0) &&
                      !isUser
                    }
                    onContextMenu={(e) => onRightClick(e, message)}
                    onDoubleClickCapture={() => {
                      if (!isMobileScreen) return;
                      setUserInput(message.content);
                    }}
                    fontSize={fontSize}
                    parentRef={scrollRef}
                  />
                </div>
                {!isUser && !message.preview && (
                  <div className={styles["chat-message-actions"]}>
                    <div className={styles["chat-message-action-date"]}>
                      {message.date.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles["chat-input-panel"]}>
        <PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} />

        <ChatActions
          showPromptModal={() => setShowPromptModal(true)}
          scrollToBottom={scrollToBottom}
          hitBottom={hitBottom}
        />
        <div className={styles["chat-input-panel-inner"]}>
          <textarea
            ref={inputRef}
            className={styles["chat-input"]}
            placeholder={Locale.Chat.Input(submitKey)}
            onInput={(e) => onInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={onInputKeyDown}
            onFocus={() => setAutoScroll(true)}
            onBlur={() => {
              setAutoScroll(false);
              setTimeout(() => setPromptHints([]), 500);
            }}
            autoFocus
            rows={inputRows}
          />
          <IconButton
            icon={<SendWhiteIcon />}
            text={Locale.Chat.Send}
            className={styles["chat-input-send"]}
            noDark
            onClick={onUserSubmit}
          />
        </div>
      </div>
    </div>
  );
}
