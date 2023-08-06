import { useDebouncedCallback } from "use-debounce";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import SendWhiteIcon from "../icons/send-white.svg";
import BrainIcon from "../icons/brain.svg";
import RenameIcon from "../icons/rename.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import LoadingIcon from "../icons/three-dots.svg";
import PromptIcon from "../icons/prompt.svg";
import MaskIcon from "../icons/mask.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ResetIcon from "../icons/reload.svg";
import BreakIcon from "../icons/break.svg";
import SettingsIcon from "../icons/chat-settings.svg";
import DeleteIcon from "../icons/clear.svg";
import PinIcon from "../icons/pin.svg";
import EditIcon from "../icons/rename.svg";

import LightIcon from "../icons/light.svg";
import DarkIcon from "../icons/dark.svg";
import AutoIcon from "../icons/auto.svg";
import BottomIcon from "../icons/bottom.svg";
import StopIcon from "../icons/pause.svg";
import RobotIcon from "../icons/robot.svg";
import MicphoneIcon from "../icons/Micphone.svg";

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

import {
  copyToClipboard,
  downloadAs,
  selectOrCopy,
  autoGrowTextArea,
  useMobileScreen,
} from "../utils";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "../client/controller";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale, { AllLangs, ALL_LANG_OPTIONS, DEFAULT_LANG } from "../locales";

import { IconButton } from "./button";
import styles from "./chat.module.scss";

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
} from "./ui-lib";
import { useLocation, useNavigate } from "react-router-dom";
import { LAST_INPUT_KEY, Path, REQUEST_TIMEOUT_MS } from "../constant";
import { Avatar } from "./emoji";
import { MaskAvatar, MaskConfig } from "./mask";
import { useMaskStore } from "../store/mask";
import { ChatCommandPrefix, useChatCommand, useCommand } from "../command";
import { prettyObject } from "../utils/format";
import { ExportMessageModal } from "./exporter";
import { getClientConfig } from "../config/client";
import { ModelConfig, SpeechConfig } from "../store/config";

import zBotServiceClient, {
  LocalStorageKeys,
} from "../zbotservice/ZBotServiceClient";

import speechSdk from "../cognitive/speech-sdk";

import {
  ToastmastersRoles,
  EN_TOASTMASTERS_ROLES,
} from "../masks/en-toastmasters";

const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
  loading: () => <LoadingIcon />,
});

export function SessionConfigModel(props: { onClose: () => void }) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const maskStore = useMaskStore();
  const navigate = useNavigate();

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Context.Edit}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            icon={<ResetIcon />}
            bordered
            text={Locale.Chat.Config.Reset}
            onClick={async () => {
              if (await showConfirm(Locale.Memory.ResetConfirm)) {
                chatStore.updateCurrentSession(
                  (session) => (session.memoryPrompt = ""),
                );
              }
            }}
          />,
          <IconButton
            key="copy"
            icon={<CopyIcon />}
            bordered
            text={Locale.Chat.Config.SaveAs}
            onClick={() => {
              navigate(Path.Masks);
              setTimeout(() => {
                maskStore.create(session.mask);
              }, 500);
            }}
          />,
        ]}
      >
        <MaskConfig
          mask={session.mask}
          updateMask={(updater) => {
            const mask = { ...session.mask };
            updater(mask);
            chatStore.updateCurrentSession((session) => (session.mask = mask));
          }}
          shouldSyncFromGlobal
          extraListItems={
            session.mask.modelConfig.sendMemory ? (
              <ListItem
                title={`${Locale.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`}
                subTitle={session.memoryPrompt || Locale.Memory.EmptyContent}
              ></ListItem>
            ) : (
              <></>
            )
          }
        ></MaskConfig>
      </Modal>
    </div>
  );
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.mask.context;

  return (
    <div className={styles["prompt-toast"]} key="prompt-toast">
      {props.showToast && (
        <div
          className={styles["prompt-toast-inner"] + " clickable"}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={styles["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel onClose={() => props.setShowModal(false)} />
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
  const noPrompts = props.prompts.length === 0;
  const [selectIndex, setSelectIndex] = useState(0);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectIndex(0);
  }, [props.prompts.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (noPrompts || e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      // arrow up / down to select prompt
      const changeIndex = (delta: number) => {
        e.stopPropagation();
        e.preventDefault();
        const nextIndex = Math.max(
          0,
          Math.min(props.prompts.length - 1, selectIndex + delta),
        );
        setSelectIndex(nextIndex);
        selectedRef.current?.scrollIntoView({
          block: "center",
        });
      };

      if (e.key === "ArrowUp") {
        changeIndex(1);
      } else if (e.key === "ArrowDown") {
        changeIndex(-1);
      } else if (e.key === "Enter") {
        const selectedPrompt = props.prompts.at(selectIndex);
        if (selectedPrompt) {
          props.onPromptSelect(selectedPrompt);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prompts.length, selectIndex]);

  if (noPrompts) return null;
  return (
    <div className={styles["prompt-hints"]}>
      {props.prompts.map((prompt, i) => (
        <div
          ref={i === selectIndex ? selectedRef : null}
          className={
            styles["prompt-hint"] +
            ` ${i === selectIndex ? styles["prompt-hint-selected"] : ""}`
          }
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
          onMouseEnter={() => setSelectIndex(i)}
        >
          <div className={styles["hint-title"]}>{prompt.title}</div>
          <div className={styles["hint-content"]}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

function ClearContextDivider() {
  const chatStore = useChatStore();

  return (
    <div
      className={styles["clear-context"]}
      onClick={() =>
        chatStore.updateCurrentSession(
          (session) => (session.clearContextIndex = undefined),
        )
      }
    >
      <div className={styles["clear-context-tips"]}>{Locale.Context.Clear}</div>
      <div className={styles["clear-context-revert-btn"]}>
        {Locale.Context.Revert}
      </div>
    </div>
  );
}

function ChatAction(props: {
  text: string;
  icon: JSX.Element;
  onClick: () => void;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState({
    full: 16,
    icon: 16,
  });

  function updateWidth() {
    if (!iconRef.current || !textRef.current) return;
    const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
    const textWidth = getWidth(textRef.current);
    const iconWidth = getWidth(iconRef.current);
    setWidth({
      full: textWidth + iconWidth,
      icon: iconWidth,
    });
  }

  return (
    <div
      className={`${styles["chat-input-action"]} clickable`}
      onClick={() => {
        props.onClick();
        setTimeout(updateWidth, 1);
      }}
      onMouseEnter={updateWidth}
      onTouchStart={updateWidth}
      style={
        {
          "--icon-width": `${width.icon}px`,
          "--full-width": `${width.full}px`,
        } as React.CSSProperties
      }
    >
      <div ref={iconRef} className={styles["icon"]}>
        {props.icon}
      </div>
      <div className={styles["text"]} ref={textRef}>
        {props.text}
      </div>
    </div>
  );
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollToBottom = useCallback(() => {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => dom.scrollTo(0, dom.scrollHeight));
    }
  }, []);

  // auto scroll
  useEffect(() => {
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
  showPromptHints: () => void;
  hitBottom: boolean;
}) {
  const config = useAppConfig();
  const navigate = useNavigate();
  const chatStore = useChatStore();

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
  const couldStop = ChatControllerPool.hasPending();
  const stopAll = () => ChatControllerPool.stopAll();

  // switch model
  const currentModel = chatStore.currentSession().mask.modelConfig.model;
  function nextModel() {
    const models = ALL_MODELS.filter((m) => m.available).map((m) => m.name);
    const modelIndex = models.indexOf(currentModel);
    const nextIndex = (modelIndex + 1) % models.length;
    const nextModel = models[nextIndex];
    chatStore.updateCurrentSession((session) => {
      session.mask.modelConfig.model = nextModel;
      session.mask.syncGlobalConfig = false;
    });
  }

  return (
    <div className={styles["chat-input-actions"]}>
      {couldStop && (
        <ChatAction
          onClick={stopAll}
          text={Locale.Chat.InputActions.Stop}
          icon={<StopIcon />}
        />
      )}
      {!props.hitBottom && (
        <ChatAction
          onClick={props.scrollToBottom}
          text={Locale.Chat.InputActions.ToBottom}
          icon={<BottomIcon />}
        />
      )}
      {props.hitBottom && (
        <ChatAction
          onClick={props.showPromptModal}
          text={Locale.Chat.InputActions.Settings}
          icon={<SettingsIcon />}
        />
      )}

      <ChatAction
        onClick={nextTheme}
        text={Locale.Chat.InputActions.Theme[theme]}
        icon={
          <>
            {theme === Theme.Auto ? (
              <AutoIcon />
            ) : theme === Theme.Light ? (
              <LightIcon />
            ) : theme === Theme.Dark ? (
              <DarkIcon />
            ) : null}
          </>
        }
      />

      <ChatAction
        onClick={props.showPromptHints}
        text={Locale.Chat.InputActions.Prompt}
        icon={<PromptIcon />}
      />

      <ChatAction
        onClick={() => {
          navigate(Path.Masks);
        }}
        text={Locale.Chat.InputActions.Masks}
        icon={<MaskIcon />}
      />

      <ChatAction
        text={Locale.Chat.InputActions.Clear}
        icon={<BreakIcon />}
        onClick={() => {
          chatStore.updateCurrentSession((session) => {
            if (session.clearContextIndex === session.messages.length) {
              session.clearContextIndex = undefined;
            } else {
              session.clearContextIndex = session.messages.length;
              session.memoryPrompt = ""; // will clear memory
            }
          });
        }}
      />

      <ChatAction
        onClick={nextModel}
        text={currentModel}
        icon={<RobotIcon />}
      />
    </div>
  );
}

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
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();

  const [impromptuSpeech, setImpromptuSpeech] = useState("");
  const [toastmastersProcess, setToastmastersProcess] = useState<number>(-1);

  // 使用 useEffect 钩子来监听 voiceButtonStarted 的变化。
  // 当 voiceButtonStarted 发生变化时，可以在 useEffect 钩子中执行一些副作用，例如更新组件的样式
  const [voiceButtonStarted, setVoiceButtonStarted] = useState(false);
  useEffect(() => {}, [voiceButtonStarted]);

  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 10;
    setHitBottom(isTouchBottom);
  };

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<Prompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      const matchedPrompts = promptStore.search(text);
      setPromptHints(matchedPrompts);
    },
    100,
    { leading: true, trailing: true },
  );

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

  // chat commands shortcuts
  const chatCommands = useChatCommand({
    new: () => chatStore.newSession(),
    newm: () => navigate(Path.NewChat),
    prev: () => chatStore.nextSession(-1),
    next: () => chatStore.nextSession(1),
    clear: () =>
      chatStore.updateCurrentSession(
        (session) => (session.clearContextIndex = session.messages.length),
      ),
    del: () => chatStore.deleteSession(chatStore.currentSessionIndex),
  });

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    }
    // else if (text.startsWith(ChatCommandPrefix)) {
    //   setPromptHints(chatCommands.search(text));
    // } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
    //   // check if need to trigger auto completion
    //   if (text.startsWith("/")) {
    //     let searchText = text.slice(1);
    //     onSearch(searchText);
    //   }
    // }
  };

  const doSubmit_backup = async (userInput: string) => {
    console.log("userInput:", userInput);

    if (userInput.trim() === "") return;

    // reset status
    chatStore.resetSession();
    setToastmastersProcess(-1); // i is doing

    // the 1st role: 0: Impromptu Speaker doing
    setToastmastersProcess(toastmastersProcess + 1); // i is doing
    console.log("toastmastersProcess= " + toastmastersProcess);

    var ask = EN_TOASTMASTERS_ROLES[toastmastersProcess].content;
    ask = ask.replace("{{question}}", userInput);
    chatStore.onUserInput(ask);

    // the ist role is doing
    // while (toastmastersProcess < EN_TOASTMASTERS_ROLES.length) {
    //   console.log( "toastmastersProcess= " + toastmastersProcess + ", answer:" + session.messages[session.messages.length - 1]?.content);

    //   chatStore.getIsFinished().then(() => {
    //     setToastmastersProcess(toastmastersProcess + 1)
    //     ask = EN_TOASTMASTERS_ROLES[toastmastersProcess].content;
    //     chatStore.onUserInput(ask)
    //   });
    // }
    for (let i = 1; i < EN_TOASTMASTERS_ROLES.length; i++) {
      console.log(
        "toastmastersProcess= " +
          toastmastersProcess +
          ", answer:" +
          session.messages[session.messages.length - 1]?.content,
      );

      chatStore.getIsFinished().then(() => {
        setToastmastersProcess(i);
        ask = EN_TOASTMASTERS_ROLES[toastmastersProcess].content;
        chatStore.onUserInput(ask);
      });
    }

    // the last role is doing
    chatStore.getIsFinished().then(() => {
      setToastmastersProcess(toastmastersProcess + 1);

      // last work
      setIsLoading(false);
      localStorage.setItem(LAST_INPUT_KEY, userInput);
      setUserInput("");
      setPromptHints([]);
    });

    // chatStore.getIsFinished().then(() => {
    //   setToastmastersProcess(2) // 2: Table Topics Evaluator doing
    //   console.log( "i= " + 0 + ", answer:" + session.messages[session.messages.length - 1]?.content);
    //   ask = EN_TOASTMASTERS_ROLES[1].content;
    //   chatStore.onUserInput(ask)
    // });

    // chatStore.getIsFinished().then(() => {
    //   setToastmastersProcess(3) // 3: Grammarian doing
    //   console.log( "i= " + 1 + ", answer:" + session.messages[session.messages.length - 1]?.content);
    //   ask = EN_TOASTMASTERS_ROLES[2].content;
    //   chatStore.onUserInput(ask)
    // });

    // chatStore.getIsFinished().then(() => {
    //   setToastmastersProcess(4) // 4: Grammarian done
    //   console.log( "i= " + 2 + ", answer:" + session.messages[session.messages.length - 1]?.content);

    //   setIsLoading(false)
    //   localStorage.setItem(LAST_INPUT_KEY, userInput);
    //   setUserInput("");
    //   setPromptHints([]);
    // });

    // for (let i = 0; i < EN_TOASTMASTERS_ROLES.length; i++) {
    //   var ask = EN_TOASTMASTERS_ROLES[i].content;
    //   if ( i == 0)
    //   {
    //     ask = ask.replace("{{question}}", userInput)
    //   }

    //   console.log( "i= " + i + ", ask:" + ask);
    //   await chatStore.onUserInput(ask)

    //   // await chatStore.getIsFinished()

    //   while (!chatStore.isFinished) {
    //     await new Promise((resolve) => setTimeout(resolve, 1000));
    //   }

    //   console.log( "i= " + i + ", answer:" + session.messages[session.messages.length - 1]?.content);

    //   setIsLoading(false)
    //   localStorage.setItem(LAST_INPUT_KEY, userInput);
    //   setUserInput("");
    //   setPromptHints([]);
    //   // chatStore.getIsFinished().then((isFinished) => {
    //   // });
    // }

    // chatStore.onUserInput(userInput).then(() => setIsLoading(false));
    // chatStore.resetSession();
    // chatStore.onUserInputToastmasters(userInput, ToastmastersRoles.ImpromptuSpeaker).then(() =>
    //   {
    //     setImpromptuSpeech(session.messages[session.messages.length - 1]?.content);
    //     console.log("session.messages[session.messages.length - 1]?.content:", session.messages[session.messages.length - 1]?.content);
    //     console.log("impromptuSpeech:", impromptuSpeech);
    //     setIsLoading(false)
    //   }
    // );
    // chatStore.getIsFinished().then((isFinished) => {
    //   if (isFinished) {
    //     console.log("isFinished:", isFinished);
    //     setImpromptuSpeech(session.messages[session.messages.length - 1]?.content);
    //   }
    //   else {
    //     console.log("isFinished:", isFinished);
    //     setImpromptuSpeech("");
    //   }
    // });

    // localStorage.setItem(LAST_INPUT_KEY, userInput);
    // setUserInput("");
    // setPromptHints([]);
    if (!isMobileScreen) inputRef.current?.focus();
    // setAutoScroll(true);
  };

  const doSubmit_backup2 = (userInput: string) => {
    console.log("userInput:", userInput);

    if (userInput.trim() === "") return;

    // reset status
    chatStore.resetSession();

    // the 1st role: 0: Impromptu Speaker doing
    console.log("toastmastersProcess= " + toastmastersProcess);

    setIsLoading(false);
    localStorage.setItem(LAST_INPUT_KEY, userInput);
    setUserInput("");

    var ask = EN_TOASTMASTERS_ROLES[0].content;
    ask = ask.replace("{{question}}", userInput);
    chatStore.onUserInput(ask);

    for (let i = 1; i < EN_TOASTMASTERS_ROLES.length; i++) {
      console.log(
        "toastmastersProcess= " +
          toastmastersProcess +
          ", answer:" +
          session.messages[session.messages.length - 1]?.content,
      );

      chatStore.getIsFinished().then(() => {
        ask = EN_TOASTMASTERS_ROLES[i].content;
        chatStore.onUserInput(ask);
      });
    }

    // the last role is doing
    chatStore.getIsFinished().then(() => {
      setPromptHints([]);
    });

    // localStorage.setItem(LAST_INPUT_KEY, userInput);
    // setUserInput("");
    // setPromptHints([]);
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  };

  const doSubmit = (userInput: string) => {
    console.log("userInput:", userInput);

    if (userInput.trim() === "") return;

    // reset status from 0
    chatStore.resetSession();

    doSubmitFromIndex(userInput);
  };

  const doSubmitFromIndex = (userInput: string, roleIndex: number = 0) => {
    console.log("userInput:", userInput);

    // the 1st role: 0: Impromptu Speaker doing
    setIsLoading(false);
    localStorage.setItem(LAST_INPUT_KEY, userInput);
    setUserInput("");

    var ask = EN_TOASTMASTERS_ROLES[roleIndex].content;
    ask = ask.replace("{{question}}", userInput);
    chatStore.onUserInput(ask);

    for (let i = roleIndex + 1; i < EN_TOASTMASTERS_ROLES.length; i++) {
      console.log(
        "toastmastersProcess= " +
          toastmastersProcess +
          ", answer:" +
          session.messages[session.messages.length - 1]?.content,
      );

      chatStore.getIsFinished().then(() => {
        ask = EN_TOASTMASTERS_ROLES[i].content;
        chatStore.onUserInput(ask);
      });
    }

    // the last role is doing
    chatStore.getIsFinished().then(() => {
      setPromptHints([]);
    });

    // localStorage.setItem(LAST_INPUT_KEY, userInput);
    // setUserInput("");
    // setPromptHints([]);
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
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

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput, fill with last input
    if (
      e.key === "ArrowUp" &&
      userInput.length <= 0 &&
      !(e.metaKey || e.altKey || e.ctrlKey)
    ) {
      setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e) && promptHints.length === 0) {
      doSubmit(userInput);
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: ChatMessage) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message.content)) {
      if (userInput.length === 0) {
        setUserInput(message.content);
      }

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
      // session.messages.splice(userIndex, 2),
      session.messages.splice(userIndex),
    );
  };

  const onDelete = (botMessageId: number) => {
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;
    deleteMessage(userIndex);
  };

  const onResend1 = (botMessageId: number) => {
    // find last user input message and resend
    const userIndex = findLastUserIndex(botMessageId);
    if (userIndex === null) return;

    setIsLoading(true);
    const content = session.messages[userIndex].content;
    deleteMessage(userIndex);
    chatStore.onUserInput(content).then(() => setIsLoading(false));
    inputRef.current?.focus();
  };

  const onPinMessage = (botMessage: ChatMessage) => {
    if (!botMessage.id) return;
    const userMessageIndex = findLastUserIndex(botMessage.id);
    if (userMessageIndex === null) return;

    const userMessage = session.messages[userMessageIndex];
    chatStore.updateCurrentSession((session) =>
      session.mask.context.push(userMessage, botMessage),
    );

    showToast(Locale.Chat.Actions.PinToastContent, {
      text: Locale.Chat.Actions.PinToastAction,
      onClick: () => {
        setShowPromptModal(true);
      },
    });
  };

  const onResend = (userInput: string, roleIndex: number) => {
    console.log("userInput:", userInput);

    if (userInput.trim() === "") return;

    // reset status from messageIndex = 2 * roleIndex
    chatStore.resetSessionFromIndex(2 * roleIndex);

    doSubmitFromIndex(userInput, roleIndex);
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

  const onRecord = () => {
    // continues conversation
    if (!voiceButtonStarted) {
      speechSdk.startRecognition().then(() => {
        setVoiceButtonStarted(true);
      });
    } else {
      speechSdk
        .stopRecognition()
        .then((text) => {
          if (text !== "" && text !== undefined && text.length !== 0) {
            setUserInput(text);
          }
        })
        .catch((error) => {
          console.error("speechSdk.stopRecognition failed: ", error);
        })
        .finally(() => {
          setVoiceButtonStarted(false);
        });
    }
  };

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

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! + context.length
      : -1;

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

  useCommand({
    fill: setUserInput,
    submit: (text) => {
      doSubmit(text);
    },
  });

  /*
  From [You are the Impromptu Speaker. Question is "how to learn english?"], exact the question [how to learn english?]
  */
  const exactUserInput = (message: string) => {
    var question = message.substring(
      message.indexOf('"') + 1,
      message.lastIndexOf('"'),
    );
    return question;
  };

  var userQuestion =
    userInput === "" && session.messages.length > 0
      ? exactUserInput(session.messages[0]?.content)
      : userInput;

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

        <PromptToast
          showToast={!hitBottom}
          showModal={showPromptModal}
          setShowModal={setShowPromptModal}
        />
      </div>

      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        // onScroll={(e) => onChatBodyScroll(e.currentTarget)}  // show contextual prompts on the head
        onMouseDown={() => inputRef.current?.blur()}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <List>
          <ListItem title={"Question"}>
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                marginLeft: "20px",
              }}
            >
              <textarea
                ref={inputRef}
                className={styles["chat-input"]}
                placeholder={Locale.Chat.Input(submitKey)}
                onInput={(e) => onInput(e.currentTarget.value)}
                value={userQuestion}
                onKeyDown={onInputKeyDown}
                // onFocus={() => setAutoScroll(true)}
                onBlur={() => setAutoScroll(false)}
                rows={inputRows}
                autoFocus={autoFocus}
                style={{
                  fontSize: config.fontSize,
                }}
              />
              <div className={styles["chat-input-buttons"]}>
                <IconButton
                  icon={<MicphoneIcon />}
                  text={voiceButtonStarted ? "Recording" : "Record"}
                  bordered
                  className={
                    voiceButtonStarted
                      ? styles["chat-voice-input-send-pressed"]
                      : styles["chat-voice-input-send"]
                  }
                  onClick={onRecord}
                />
                <IconButton
                  icon={<SendWhiteIcon />}
                  text={Locale.Chat.Send}
                  className={styles["chat-input-send-top-right"]}
                  type="primary"
                  onClick={() => doSubmit(userQuestion)}
                />
              </div>
            </div>
          </ListItem>

          {/* <ListItem title={"Question"}>
            <textarea
              id="question"
              rows={3}
              className={styles["modal-input"]}
              onChange={(e) => setUserInput(e.target.value)}
              value={userQuestion}
            ></textarea>
            <IconButton
              icon={<SendWhiteIcon />}
              text={Locale.Chat.Send}
              type="primary"
              onClick={() => doSubmit(userQuestion)}
            />
          </ListItem> */}

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
            {EN_TOASTMASTERS_ROLES.map((role, index) => {
              // if length > index => the data is ready => show the data, else show the last data
              var message: ChatMessage = createMessage({});
              if (session.messages.length > 2 * index + 2)
                // data is ready, just read it
                message = session.messages[2 * index + 1];
              else if (session.messages.length == 2 * index + 2)
                message = session.messages[session.messages.length - 1];

              var showActions = message.content.length > 0;

              return (
                <div key={index} className={styles["chat-message"]}>
                  <div
                    className={styles["chat-message-container-toastmasters"]}
                  >
                    {/* TODO: 1). Put edit together with other action. 2) Select avatar */}
                    <div className={styles["chat-message-avatar"]}>
                      {/* <MaskAvatar mask={session.mask} /> */}
                      <div> {role.role} </div>
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
                                  onUserStop(message.id ?? 2 * index + 1)
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
                                  onClick={() => onResend(userQuestion, index)}
                                />
                                <ChatAction
                                  text={Locale.Chat.Actions.Copy}
                                  icon={<CopyIcon />}
                                  onClick={() =>
                                    copyToClipboard(message.content)
                                  }
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

                      <div className={styles["chat-botmassage-show"]}>
                        <Markdown
                          content={message?.content}
                          fontSize={fontSize}
                          parentRef={scrollRef}
                        />
                      </div>

                      <div className={styles["chat-message-action-date"]}>
                        {message.content.length > 0
                          ? message.content.split(/\s+/).length
                          : 0}{" "}
                        words
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Success */}
          {/* <div
            className={styles["chat-body"]}
            ref={scrollRef}
            onScroll={(e) => onChatBodyScroll(e.currentTarget)}
            onMouseDown={() => inputRef.current?.blur()}
            onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
            onTouchStart={() => {
              inputRef.current?.blur();
              setAutoScroll(false);
            }}
            >{
              EN_TOASTMASTERS_ROLES.map((role, index) => {
                // if length > index => the data is ready => show the data, else show the last data
                var message = session.messages[ session.messages.length > index ? 2*index + 1 : session.messages.length - 1]
                
                return (
                  <ListItem
                    key={index}
                    title={role.role}
                  >
                    <Input
                      rows={15}
                      className={styles["modal-input"]}
                      value={ message?.content }
                    ></Input>
                    <div className={styles["button-container"]}>
                      <IconButton
                        icon={<ResetIcon />}
                        text={"Retry"}
                        bordered
                        onClick={() => doSubmit(userInput)}
                      />
                      <IconButton
                        icon={<MicphoneIcon />}
                        text={"Play"}
                        bordered
                      />
                      <div>{ message?.content.split(/\s+/).length} words</div>
                    </div>
                  </ListItem>
                )
              })
            }
          </div> */}
        </List>
      </div>
    </div>
  );
}
