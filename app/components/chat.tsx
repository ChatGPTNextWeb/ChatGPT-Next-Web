import { ChangeEvent } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useState, useRef, useEffect, useLayoutEffect } from "react";

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
import UploadFileIcon from "../icons/uploadfile.svg";
import FileCountIcon from "../icons/fileCount.svg";
import StartIcon from "../icons/start.svg";
import LightIcon from "../icons/light.svg";
import DarkIcon from "../icons/dark.svg";
import AutoIcon from "../icons/auto.svg";
import BottomIcon from "../icons/bottom.svg";
import StopIcon from "../icons/pause.svg";
import AddIcon from "../icons/add.svg";

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
import Locale from "../locales";

import { IconButton } from "./button";
import styles from "./home.module.scss";
import chatStyle from "./chat.module.scss";

import { ListItem, Modal } from "./ui-lib";
import { useLocation, useNavigate } from "react-router-dom";
import { LAST_INPUT_KEY, Path, REQUEST_TIMEOUT_MS } from "../constant";
import { Avatar } from "./emoji";
import { MaskAvatar, MaskConfig } from "./mask";
import { useMaskStore, Mask } from "../store/mask";
import { useCommand } from "../command";
import { prettyObject } from "../utils/format";
import { ExportMessageModal } from "./exporter";
import { ExportFileCountModel } from "./filecount";
import tr from "@/app/locales/tr";
import { Property } from "csstype";
import Height = Property.Height;
import ResponseController from "@/app/api/controller/ResponseController";
import { BUILTIN_MASK_STORE } from "../masks";
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
            onClick={() => {
              if (confirm(Locale.Memory.ResetConfirm)) {
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
      if (noPrompts) return;
      if (e.metaKey || e.altKey || e.ctrlKey) {
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
      className={chatStyle["clear-context"]}
      onClick={() =>
        chatStore.updateCurrentSession(
          (session) => (session.clearContextIndex = -1),
        )
      }
    >
      <div className={chatStyle["clear-context-tips"]}>
        {Locale.Context.Clear}
      </div>
      <div className={chatStyle["clear-context-revert-btn"]}>
        {Locale.Context.Revert}
      </div>
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
  showPromptHints: () => void;
  hitBottom: boolean;
  onBeginSession: () => void;
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
  const { state } = useLocation(); //获取被跳转路由之前传入的那个state

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
          <SettingsIcon />
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

      <div
        className={`${chatStyle["chat-input-action"]} clickable`}
        onClick={props.showPromptHints}
      >
        <PromptIcon />
      </div>

      <div
        className={`${chatStyle["chat-input-action"]} clickable`}
        onClick={() => {
          navigate(Path.Masks);
        }}
      >
        <MaskIcon />
      </div>

      <div
        className={`${chatStyle["chat-input-action"]} clickable`}
        onClick={() => {
          chatStore.updateCurrentSession((session) => {
            if (session.clearContextIndex === session.messages.length) {
              session.clearContextIndex = -1;
            } else {
              session.clearContextIndex = session.messages.length;
              session.memoryPrompt = ""; // will clear memory
            }
          });
        }}
      >
        <BreakIcon />
      </div>
      {state?.fromGroup && (
        <div
          className={`${chatStyle["chat-input-action"]} clickable`}
          onClick={() => {
            navigate(Path.Masks, { state: { fromgroup: true } });
          }}
        >
          <AddIcon />
        </div>
      )}
      {state?.fromGroup && (
        <div
          className={`${chatStyle["chat-input-action"]} clickable`}
          onClick={props.onBeginSession}
          style={{ width: "20px", height: "20px" }}
        >
          <StartIcon />
        </div>
      )}
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
  const [showCount, setShowCount] = useState(false);
  const [editingHeight2, setEditingHeight2] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isEditing, setisEditing] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null,
  );
  const [editingContent, setEditingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();
  //const [input, setinput] = useState("Can you tell me a food?");
  //const input = "This is a begin";
  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 100;
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
    alert("onPromptSelect ");
    setPromptHints([]);
    inputRef.current?.focus();
    setTimeout(() => setUserInput(prompt.content), 60);
  };

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

  const AgentsTalk = (userInput: string) => {
    //console.log("[The input is ]" + userInput);
    if (userInput.trim() !== "xzw want the agents talk!!!!!!!!!") return;
    setIsLoading(true);

    chatStore.onUserInput(userInput).then(() => setIsLoading(false));

    localStorage.setItem(LAST_INPUT_KEY, userInput);
    //alert(userInput);

    setUserInput("");
    setPromptHints([]);
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  };

  const doSubmit = (userInput: string) => {
    //console.log("[The input is ]" + userInput);
    if (userInput.trim() === "") return;
    setIsLoading(true);
    chatStore.onUserInput(userInput).then(() => setIsLoading(false));
    localStorage.setItem(LAST_INPUT_KEY, userInput);
    //alert(userInput);
    setUserInput("");
    setPromptHints([]);
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
  let messages = context
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
  //console.log("[The Message is ]" + messages);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const renameSession = () => {
    const newTopic = prompt(Locale.Chat.Rename, session.topic);
    if (newTopic && newTopic !== session.topic) {
      chatStore.updateCurrentSession((session) => (session.topic = newTopic!));
    }
  };

  const location = useLocation();
  const isChat = location.pathname === Path.Chat;
  const autoFocus = !isMobileScreen || isChat; // only focus in chat page
  const { state } = useLocation();
  const startChat = (mask?: Mask) => {
    chatStore.newSession(mask);
    setTimeout(() => navigate(Path.Chat), 1);
  };
  useCommand({
    fill: setUserInput,
    submit: (text) => {
      doSubmit(text);
    },
  });

  useLayoutEffect(() => {
    if (isEditing && selectedMessageId !== null && inputRef.current) {
      const textarea = inputRef.current;
      const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
      const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom);
      const contentHeight = textarea.scrollHeight - paddingTop - paddingBottom;

      setEditingHeight2(contentHeight);
    }
  }, [isEditing, selectedMessageId]);
  //Add for langchain
  const [isLangchain, setisLangchain] = useState(false);
  useEffect(() => {
    const sessions = chatStore.currentSession();
    const model = sessions.mask.modelConfig.model;
    if (model === "lang chain") {
      setisLangchain(true);
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  // const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const formData = new FormData();
  //     formData.append('file', file);
  //
  //     fetch('/Users/xuzhongwei/uiuc', {
  //       method: 'POST',
  //       body: formData,
  //     })
  //         .then(response => {
  //           // 处理上传成功的响应
  //           console.log('文件上传成功！');
  //         })
  //         .catch(error => {
  //           // 处理上传失败的错误
  //           console.error('文件上传失败:', error);
  //         });
  //   }
  // };
  // const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const fileContent = reader.result as string;
  //
  //
  //       // 创建一个虚拟的下载链接，并触发下载
  //       const downloadLink = document.createElement('a');
  //       downloadLink.href = URL.createObjectURL(new Blob([fileContent]));
  //       downloadLink.setAttribute('download', file.name);
  //       downloadLink.style.display = 'none';
  //       document.body.appendChild(downloadLink);
  //       downloadLink.click();
  //       document.body.removeChild(downloadLink);
  //
  //       console.log('文件保存成功！');
  //     };
  //     reader.onerror = () => {
  //       console.error('文件读取错误');
  //     };
  //     reader.readAsText(file);
  //   }
  // };
  async function handlePostFile() {
    const session = chatStore.currentSession();
    let uuidValue = session.id.toString();
    let data = new FormData();
    data.append("uuid", uuidValue);
    if (fileInputRef.current!.files) {
      data.append("files", fileInputRef.current!.files[0]);
    }
    data.append("filename", "This is a PDF");
    const res = await ResponseController.postPDFprompt(data);
    if (res.text !== "") {
      alert("It upload success!");
    }
  }
  function fileCount() {}
  const uuid = session.id.toString();

  const [isRunning, setIsRunning] = useState(false);

  function beginSession() {
    setIsRunning((prevIsRunning) => !prevIsRunning);
  }

  const chatstore = useChatStore();
  const maskStore = useMaskStore();
  let index = 0;
  useEffect(() => {
    let intervalId: string | number | NodeJS.Timeout | undefined;

    let len = session.maskId.length;

    let tempmessage: ChatMessage[] = [];
    let messageLen = 0;
    let finalmessage: ChatMessage[] = [];
    let sysMessage: ChatMessage[] = [];
    let i = 0;
    if (isRunning) {
      intervalId = setInterval(() => {
        console.log("所有消息", session.messages);

        if (session.messages.length >= 2) {
          const messageAdd = session.messages.slice(-2);
          console.log("adddd", messageAdd);

          messageAdd.forEach((element) => {
            console.log("i", i);
            element.maskId = session.maskId[i];
            console.log(session.maskId[index]);
            i = i + 1;
            i = i % len;
          });
          session.messages[session.messages.length - 2].maskId =
            messageAdd[0].maskId;
          session.messages[session.messages.length - 1].maskId =
            messageAdd[1].maskId;
          // for(const value of messageAdd){
          //   console.log("i",i);
          //  console.log("id",session.maskId[i]);
          //   value.maskId=session.maskId[i];
          //   i=i+1;
          //   }
          // console.log(session.maskId);
          // console.log(session.messages);
          console.log("add", messageAdd);
          tempmessage = tempmessage.concat(messageAdd);
          // const summarizeIndex = Math.max(
          //   session.lastSummarizeIndex,
          //   session.clearContextIndex ?? 0,
          // );
          // let toBeSummarizedMsgs = messages
          // .filter((msg) => !msg.isError)
          // .slice(-10);
          messageLen = messageLen + 1;
          // console.log("聊天记录",tempmessage);
          // tempmessage[messageLen].maskId=session.maskId[index];
          console.log("加了MASKID聊天记录", tempmessage);
          index = index + 1;
          index = index % len;
          // console.log("index",index);
          // console.log("maskID",session.maskId)
          const mask =
            maskStore.get(session.maskId[index]) ??
            BUILTIN_MASK_STORE.get(session.maskId[index]);
          // console.log(session.maskId[index])
          // console.log("面具完整版",mask)
          // console.log("面具",mask.context[0].content)
          const systemMessage: ChatMessage = createMessage({
            role: "system",
            content: mask.context[0].content,
            id: session.maskId[index],
          });
          sysMessage[0] = systemMessage;
          console.log("index", session.maskId[index]);
          for (const value of tempmessage) {
            if (value.maskId == session.maskId[index]) {
              value.role = "assistant";
            } else {
              value.role = "user";
            }
          }
        }
        console.log("修改Role的聊天记录", tempmessage);
        finalmessage = sysMessage.concat(tempmessage);
        console.log("最终的聊天记录", finalmessage);

        const input = "xzw want the agents talk!!!!!!!!!";
      }, 10000);
    } else {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  const isGroup = session.group; //判断是否群聊
  const isRuningGroup = !isGroup || (isGroup && isRunning); //判断是否群聊且已经按了开始按钮
  const isStart = messages.length < 3;
  const isGroupStart = !isGroup || (isGroup && !isStart);
  if (isGroupStart) {
    messages.splice(2, 1);
  }
  // console.log("messages",messages);
  return (
    <div className={styles.chat} key={session.id}>
      <div className="window-header">
        <div className="window-header-title">
          <div
            className={`window-header-main-title " ${styles["chat-body-title"]}`}
            onClickCapture={renameSession}
          >
            {!session.topic ? DEFAULT_TOPIC : session.topic}
          </div>
          <div className="window-header-sub-title">
            {Locale.Chat.SubTitle(session.messages.length)}
          </div>
        </div>
        <div className="window-actions">
          <div className={"window-action-button" + " " + styles.mobile}>
            <IconButton
              icon={<ReturnIcon />}
              bordered
              title={Locale.Chat.Actions.ChatList}
              onClick={() => navigate(Path.Home)}
            />
          </div>
          {isLangchain && (
            <div className="window-action-button">
              <IconButton
                icon={<UploadFileIcon />}
                bordered
                onClick={handleFileUpload}
              />
              <input
                ref={fileInputRef}
                type="file"
                id="prompt_file"
                name="pdf_file"
                style={{ display: "none" }}
                onChange={handlePostFile}
              />
            </div>
          )}
          {isLangchain && (
            <div className="window-action-button">
              <IconButton
                icon={<FileCountIcon />}
                bordered
                title={Locale.Chat.Actions.Count}
                onClick={() => {
                  setShowCount(true);
                }}
              />
            </div>
          )}
          <div className="window-action-button">
            <IconButton
              icon={<RenameIcon />}
              bordered
              onClick={renameSession}
            />
          </div>
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
          {!isMobileScreen && (
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

          // const isGroup = session.group; //判断是否群聊
          // const isRuningGroup =(!isGroup)||(isGroup&&isRunning);//判断是否群聊且已经按了开始按钮
          // const isStart = messages.length===3;
          // const isGroupStart =(!isGroup)||(isGroup&&!isStart);
          // console.log("!!!!!!",isGroupStart);
          // console.log("messages.length",messages.length);

          const shouldShowClearContextDivider = i === clearContextIndex - 1;
          // const avatarMask =maskStore.get(message.maskId[index]) ?? BUILTIN_MASK_STORE.get(session.maskId[index])??session.mask;
          const avatarMask =
            maskStore.get(message.maskId) ??
            BUILTIN_MASK_STORE.get(message.maskId) ??
            session.mask;

          const editContent = () => {
            setEditingContent(message.content);
            setisEditing(true);
            setSelectedMessageId(message.id ?? null);
          };
          const saveContent = () => {
            message.content = editingContent;
            setisEditing(false);
          };

          // console.log("avatar",session.maskId[index]);
          // console.log("maskstore",maskStore.get(session.maskId[index]));
          // console.log("BUILTIN",BUILTIN_MASK_STORE.get(session.maskId[index]));
          return (
            <>
              <div
                key={i}
                className={
                  isUser ? styles["chat-message-user"] : styles["chat-message"]
                }
              >
                <div className={styles["chat-message-container"]}>
                  <div className={styles["chat-message-avatar"]}>
                    {/* {message.role === "user" ? (
                      <Avatar avatar={config.avatar} />
                    ) : ( */}
                    <MaskAvatar mask={avatarMask} />
                    {/* )} */}
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
                            <div
                              className={styles["chat-message-top-action"]}
                              onClick={() => editContent()}
                            >
                              {Locale.Chat.Actions.Edit}
                            </div>
                            {isEditing ? (
                              <div
                                className={styles["chat-message-top-action"]}
                                onClick={() => saveContent()}
                              >
                                {Locale.Chat.Actions.Save}
                              </div>
                            ) : (
                              <div
                                className={styles["chat-message-top-action"]}
                                onClick={() => copyToClipboard(message.content)}
                              >
                                {Locale.Chat.Actions.Copy}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    {isEditing && selectedMessageId === message.id ? (
                      <textarea
                        ref={inputRef}
                        className={styles["chat-input-edit"]}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        // style={editingHeight !== null ? { height: editingHeight } : undefined}
                        style={{
                          height: editingHeight2 as
                            | Height<string | number>
                            | undefined,
                          width: "400px", // 设置初始宽度
                        }}
                        autoFocus
                      />
                    ) : (
                      <div>
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
                          defaultShow={i >= messages.length - 10}
                        />
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
              {shouldShowClearContextDivider && <ClearContextDivider />}
            </>
          );
        })}
      </div>

      <div className={styles["chat-input-panel"]}>
        <PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} />

        <ChatActions
          showPromptModal={() => setShowPromptModal(true)}
          scrollToBottom={scrollToBottom}
          hitBottom={hitBottom}
          showPromptHints={() => {
            // Click again to close
            if (promptHints.length > 0) {
              setPromptHints([]);
              return;
            }

            inputRef.current?.focus();
            setUserInput("/");
            onSearch("");
          }}
          onBeginSession={beginSession}
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
            onBlur={() => setAutoScroll(false)}
            rows={inputRows}
            autoFocus={autoFocus}
          />
          <IconButton
            icon={<SendWhiteIcon />}
            text={Locale.Chat.Send}
            className={styles["chat-input-send"]}
            type="primary"
            onClick={() => doSubmit(userInput)}
          />
        </div>
      </div>

      {showExport && (
        <ExportMessageModal onClose={() => setShowExport(false)} />
      )}
      {showCount && (
        <ExportFileCountModel onClose={() => setShowCount(false)} uuid={uuid} />
      )}
    </div>
  );
}
