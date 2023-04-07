import { useDebouncedCallback } from "use-debounce";
import { memo, useState, useRef, useEffect, useLayoutEffect } from "react";

import SendWhiteIcon from "../icons/send-white.svg";
import BrainIcon from "../icons/brain.svg";
import ExportIcon from "../icons/export.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import DownloadIcon from "../icons/download.svg";
import LoadingIcon from "../icons/three-dots.svg";
import BotIcon from "../icons/bot.svg";
import AddIcon from "../icons/add.svg";
import DeleteIcon from "../icons/delete.svg";

import {
  Message,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  ROLES,
  createMessage,
} from "../store";

import {
  copyToClipboard,
  downloadAs,
  getEmojiUrl,
  isMobileScreen,
  selectOrCopy,
} from "../utils";

import dynamic from "next/dynamic";

import { ControllerPool } from "../requests";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale from "../locales";

import { IconButton } from "./button";
import styles from "./home.module.scss";
import chatStyle from "./chat.module.scss";

import { Input, Modal, showModal, showToast } from "./ui-lib";

import calcTextareaHeight from "../calcTextareaHeight";

const Markdown = dynamic(
  async () => memo((await import("./markdown")).Markdown),
  {
    loading: () => <LoadingIcon />,
  },
);

const Emoji = dynamic(async () => (await import("emoji-picker-react")).Emoji, {
  loading: () => <LoadingIcon />,
});

export function Avatar(props: { role: Message["role"] }) {
  const config = useChatStore((state) => state.config);

  if (props.role !== "user") {
    return <BotIcon className={styles["user-avtar"]} />;
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
  const config = useChatStore((state) => state.config);
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

  // auto scroll
  useLayoutEffect(() => {
    const dom = scrollRef.current;
    if (dom && autoScroll) {
      setTimeout(() => (dom.scrollTop = dom.scrollHeight), 1);
    }
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
  };
}

export function Chat(props: {
  showSideBar?: () => void;
  sideBarShowing?: boolean;
  autoSize: {
    minRows: number;
    maxRows?: number;
  };
}) {
  type RenderMessage = Message & { preview?: boolean };

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const fontSize = useChatStore((state) => state.config.fontSize);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(false);
  const [textareaStyle, setTextareaStyle] = useState({});

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

  const scrollInput = () => {
    const dom = inputRef.current;
    if (!dom) return;
    const paddingBottomNum: number = parseInt(
      window.getComputedStyle(dom).paddingBottom,
      10,
    );
    dom.scrollTop = dom.scrollHeight - dom.offsetHeight + paddingBottomNum;
  };

  // textarea has an adaptive height
  const resizeTextarea = () => {
    const dom = inputRef.current;
    if (!dom) return;
    const { minRows, maxRows } = props.autoSize;
    setTimeout(() => {
      setTextareaStyle(calcTextareaHeight(dom, minRows, maxRows));
    }, 50);
  };

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    scrollInput();
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    } else if (!chatStore.config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith("/")) {
        let searchText = text.slice(1);
        if (searchText.length === 0) {
          searchText = " ";
        }
        onSearch(searchText);
      }
    }
  };

  // submit user input
  const onUserSubmit = () => {
    if (userInput.length <= 0) return;
    setIsLoading(true);
    chatStore.onUserInput(userInput).then(() => setIsLoading(false));
    setUserInput("");
    setPromptHints([]);
    if (!isMobileScreen()) inputRef.current?.focus();
    setAutoScroll(true);
  };

  // stop response
  const onUserStop = (messageId: number) => {
    ControllerPool.stop(sessionIndex, messageId);
  };

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const onResend = (botIndex: number) => {
    // find last user input message and resend
    for (let i = botIndex; i >= 0; i -= 1) {
      if (messages[i].role === "user") {
        setIsLoading(true);
        chatStore
          .onUserInput(messages[i].content)
          .then(() => setIsLoading(false));
        chatStore.updateCurrentSession((session) =>
          session.messages.splice(i, 2),
        );
        inputRef.current?.focus();
        return;
      }
    }
  };

  const config = useChatStore((state) => state.config);

  const context: RenderMessage[] = session.context.slice();

  if (
    context.length === 0 &&
    session.messages.at(0)?.content !== BOT_HELLO.content
  ) {
    context.push(BOT_HELLO);
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

  // Auto focus
  useEffect(() => {
    if (props.sideBarShowing && isMobileScreen()) return;
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Textarea Adaptive height
  useEffect(() => {
    resizeTextarea();
  });

  return (
    <div className={styles.chat} key={session.id}>
      <div className={styles["window-header"]}>
        <div className={styles["window-header-title"]}>
          <div
            className={`${styles["window-header-main-title"]} ${styles["chat-body-title"]}`}
            onClickCapture={() => {
              const newTopic = prompt(Locale.Chat.Rename, session.topic);
              if (newTopic && newTopic !== session.topic) {
                chatStore.updateCurrentSession(
                  (session) => (session.topic = newTopic!),
                );
              }
            }}
          >
            {session.topic}
          </div>
          <div className={styles["window-header-sub-title"]}>
            {Locale.Chat.SubTitle(session.messages.length)}
          </div>
        </div>
        <div className={styles["window-actions"]}>
          <div className={styles["window-action-button"] + " " + styles.mobile}>
            <IconButton
              icon={<ReturnIcon />}
              bordered
              title={Locale.Chat.Actions.ChatList}
              onClick={props?.showSideBar}
            />
          </div>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<BrainIcon />}
              bordered
              title={Locale.Chat.Actions.CompressedHistory}
              onClick={() => {
                setShowPromptModal(true);
              }}
            />
          </div>
          <div className={styles["window-action-button"]}>
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
          </div>
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
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {messages.map((message, i) => {
          const isUser = message.role === "user";

          return (
            <div
              key={i}
              className={
                isUser ? styles["chat-message-user"] : styles["chat-message"]
              }
            >
              <div className={styles["chat-message-container"]}>
                <div className={styles["chat-message-avatar"]}>
                  <Avatar role={message.role} />
                </div>
                {(message.preview || message.streaming) && (
                  <div className={styles["chat-message-status"]}>
                    {Locale.Chat.Typing}
                  </div>
                )}
                <div className={styles["chat-message-item"]}>
                  {!isUser &&
                    !(message.preview || message.content.length === 0) && (
                      <div className={styles["chat-message-top-actions"]}>
                        {message.streaming ? (
                          <div
                            className={styles["chat-message-top-action"]}
                            onClick={() => onUserStop(message.id ?? i)}
                          >
                            {Locale.Chat.Actions.Stop}
                          </div>
                        ) : (
                          <div
                            className={styles["chat-message-top-action"]}
                            onClick={() => onResend(i)}
                          >
                            {Locale.Chat.Actions.Retry}
                          </div>
                        )}

                        <div
                          className={styles["chat-message-top-action"]}
                          onClick={() => copyToClipboard(message.content)}
                        >
                          {Locale.Chat.Actions.Copy}
                        </div>
                      </div>
                    )}
                  {(message.preview || message.content.length === 0) &&
                  !isUser ? (
                    <LoadingIcon />
                  ) : (
                    <div
                      className="markdown-body"
                      style={{ fontSize: `${fontSize}px` }}
                      onContextMenu={(e) => onRightClick(e, message)}
                      onDoubleClickCapture={() => {
                        if (!isMobileScreen()) return;
                        setUserInput(message.content);
                      }}
                    >
                      <Markdown content={message.content} />
                    </div>
                  )}
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
        <div className={styles["chat-input-panel-inner"]}>
          <textarea
            ref={inputRef}
            className={styles["chat-input"]}
            style={textareaStyle}
            placeholder={Locale.Chat.Input(submitKey)}
            onInput={(e) => onInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={onInputKeyDown}
            onFocus={() => setAutoScroll(true)}
            onBlur={() => {
              setAutoScroll(false);
              setTimeout(() => setPromptHints([]), 500);
            }}
            autoFocus={!props?.sideBarShowing}
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
