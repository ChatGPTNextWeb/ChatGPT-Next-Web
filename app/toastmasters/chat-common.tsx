import { useDebouncedCallback } from "use-debounce";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import LoadingIcon from "../icons/three-dots.svg";
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
import AvatarIcon from "../icons/avatar36.svg";
import { IconButton } from "../components/button";

import { copyToClipboard, useMobileScreen } from "../utils";
import { ChatControllerPool } from "../client/controller";
import Locale from "../locales";
import {
  ChatMessage,
  useChatStore,
  createMessage,
  useAppConfig,
  DEFAULT_TOPIC,
  InputStore,
  HttpRequestResponse,
} from "../store";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { showPrompt, showToast, showConfirm } from "../components/ui-lib";
import { autoGrowTextArea } from "../utils";
import dynamic from "next/dynamic";
import Multiselect from "multiselect-react-dropdown";
import { getClientConfig } from "../config/client";
import { ExportMessageModal } from "../components/exporter";

import styles from "../components/chat.module.scss";
import styles_toastmasters from "./toastmasters.module.scss";
import {
  ToastmastersRolePrompt,
  InputSubmitStatus,
  ToastmastersRoles,
} from "./roles";

import { speechRecognizer, speechSynthesizer } from "../cognitive/speech-sdk";
import { onSpeechAvatar } from "../cognitive/speech-avatar";
import zBotServiceClient, {
  LocalStorageKeys,
} from "../zbotservice/ZBotServiceClient";

const ToastmastersDefaultLangugage = "en";

export function ChatTitle() {
  const navigate = useNavigate();
  const config = useAppConfig();

  const [showExport, setShowExport] = useState(false);

  const isMobileScreen = useMobileScreen();
  const clientConfig = useMemo(() => getClientConfig(), []);
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const renameSession = () => {
    showPrompt(Locale.Chat.Rename, session.topic).then((newTopic) => {
      if (newTopic && newTopic !== session.topic) {
        chatStore.updateCurrentSession(
          (session) => (session.topic = newTopic!),
        );
      }
    });
  };

  return (
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
        {/* <div className="window-action-button">
            <IconButton
              icon={<ExportIcon />}
              bordered
              title={Locale.Chat.Actions.Export}
              onClick={() => {
                setShowExport(true);   // TODO: export png without question
              }}
            />
          </div> */}
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

      {showExport && (
        <ExportMessageModal onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}

export const ChatInput = (props: { title: string; inputStore: InputStore }) => {
  const config = useAppConfig();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [recording, setRecording] = useState(false);

  /*
  when page is mounted, show last userInput
  when userInput is changed, show userInput
  when Send button is clicked, show session.messages[session.messages.length-1].content
  */
  const [userInput, setUserInput] = useState(props.inputStore.text);
  const [time, setTime] = useState(props.inputStore.time);

  // 计时器
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (recording) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      // save to store
      props.inputStore.time = time;
      clearInterval(intervalId);
    };
  }, [recording]);

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        10,
        // Math.max(2 + Number(!isMobileScreen), rows),
        rows,
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

  // set parent value
  useEffect(() => {
    // save to store
    props.inputStore.text = userInput;

    // set the focus to the input at the end of textarea
    inputRef.current?.focus();
  }, [userInput]); // should not depend props in case auto focus expception

  const onRecord = () => {
    if (!recording) {
      speechRecognizer.startRecording(
        appendUserInput,
        ToastmastersDefaultLangugage,
      );
      setRecording(true);
    } else {
      speechRecognizer.stopRecording();
      setRecording(false);
    }
  };

  const appendUserInput = (newState: string): void => {
    // 每次按下button时 换行显示
    if (userInput === "") {
      setUserInput(newState);
    } else {
      setUserInput(userInput + "\n" + newState);
    }
  };

  return (
    <div className={styles_toastmasters["chat-input-panel-noborder"]}>
      <div className={styles_toastmasters["chat-input-panel-title"]}>
        {props.title}
      </div>
      <div className={styles_toastmasters["chat-input-panel-textarea"]}>
        <textarea
          ref={inputRef}
          className={styles["chat-input"]}
          placeholder={"Enter To wrap"}
          onInput={(e) => setUserInput(e.currentTarget.value)}
          value={userInput}
          // onFocus={() => setAutoScroll(true)}
          // onBlur={() => setAutoScroll(false)}
          rows={inputRows}
          // autoFocus={autoFocus}
          style={{
            fontSize: config.fontSize,
          }}
        />
        <IconButton
          icon={<MicphoneIcon />}
          text={recording ? "Recording" : "Record"}
          bordered
          className={
            recording
              ? styles_toastmasters["chat-input-send-recording"]
              : styles_toastmasters["chat-input-send-record"]
          }
          onClick={onRecord}
        />
        <div className={styles_toastmasters["chat-input-words"]}>
          {ChatUtility.getWordsNumber(userInput)} words,{" "}
          {ChatUtility.formatTime(time)}
        </div>
      </div>
    </div>
  );
};

export class ChatUtility {
  static getWordsNumber(text: string): number {
    return text.length > 0 ? text.split(/\s+/).length : 0;
  }

  static getFirstNWords(
    text: string,
    number: number,
    withOmit: boolean = true,
  ): string {
    var words = this.getWordsNumber(text);

    if (number == -1 || words <= number) {
      return text;
    }

    var firstWords = text.split(/\s+/).slice(0, number).join(" ");

    if (!withOmit) {
      return firstWords;
    }

    return firstWords + "...";
  }

  static formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
}

export const ChatInputName = (props: {
  title: string;
  inputStore: InputStore;
}) => {
  const config = useAppConfig();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState(props.inputStore.text);

  // set parent value
  useEffect(() => {
    // save to store
    props.inputStore.text = userInput;

    // set the focus to the input at the end of textarea
    inputRef.current?.focus();
  }, [userInput]); // should not depend props in case auto focus expception

  return (
    <div className={styles_toastmasters["chat-input-name-group"]}>
      <div className={styles_toastmasters["chat-input-panel-title"]}>
        {props.title}
      </div>
      <div className={styles_toastmasters["chat-input-panel-textarea"]}>
        <textarea
          ref={inputRef}
          className={styles["chat-input-no-height"]}
          onInput={(e) => setUserInput(e.currentTarget.value)}
          value={userInput}
          rows={1}
          style={{
            fontSize: config.fontSize,
          }}
        />
      </div>
    </div>
  );
};

export const ChatInputSubmit = (props: {
  roleOptions: ToastmastersRolePrompt[];
  selectedValues: ToastmastersRolePrompt[];
  updateParent: (selectRoles: ToastmastersRolePrompt[]) => void;
  checkInput: () => InputSubmitStatus;
}) => {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const roleSelectRef = useRef<Multiselect>(null);
  const [submitting, setSubmitting] = useState(false);

  const doSubmit = async () => {
    var checkInputResult = props.checkInput();
    if (!checkInputResult.canSubmit) {
      return;
    }

    var toastmastersRolePrompts = roleSelectRef.current?.getSelectedItems();

    let isEnoughCoins = await chatStore.isEnoughCoins(
      toastmastersRolePrompts.length + 1,
    );
    if (!isEnoughCoins) {
      return;
    }
    setSubmitting(true);
    props.updateParent(toastmastersRolePrompts);

    // 保存输入: 于是ChatResponse可以使用
    session.inputs.roles = toastmastersRolePrompts?.map(
      (v: ToastmastersRolePrompt) => v.role_index,
    );

    // reset status from 0
    chatStore.resetSession();

    chatStore.onUserInput(checkInputResult.guidance);

    toastmastersRolePrompts.forEach((element: ToastmastersRolePrompt) => {
      chatStore.getIsFinished().then(() => {
        var ask = element.content;
        chatStore.onUserInput(ask);
      });
    });

    // the last role is doing
    chatStore.getIsFinished().then(() => {
      setSubmitting(false);
    });

    // if (!isMobileScreen) inputRef.current?.focus();
    // setAutoScroll(true);
  };

  return (
    <div className={styles_toastmasters["chat-input-panel-buttons"]}>
      <Multiselect
        options={props.roleOptions} // Options to display in the dropdown
        ref={roleSelectRef}
        // onSelect={this.onSelect} // Function will trigger on select event
        // onRemove={this.onRemove} // Function will trigger on remove event
        displayValue="role" // Property name to display in the dropdown options
        placeholder="Select Roles" // Placeholder for the dropdown search input
        showCheckbox
        selectedValues={props.selectedValues}
        style={{
          searchBox: {
            "border-bottom": "1px solid blue",
            "border-radius": "2px",
          },
        }}
      />

      <IconButton
        icon={<SendWhiteIcon />}
        text={submitting ? "Submitting" : "Submit"}
        disabled={submitting}
        className={
          submitting
            ? styles_toastmasters["chat-input-button-submitting"]
            : styles_toastmasters["chat-input-button-submit"]
        }
        onClick={doSubmit}
      />
    </div>
  );
};

export const ChatResponse = (props: {
  scrollRef: React.RefObject<HTMLDivElement>;
  toastmastersRolePrompts: ToastmastersRolePrompt[];
}) => {
  const { scrollRef, toastmastersRolePrompts } = props;

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const config = useAppConfig();

  // prompt count
  const promptCount = 3;

  // TODO: more debug for other roles except tte
  const onResend = async (roleIndex: number) => {
    const isEnoughCoins = await chatStore.isEnoughCoins(
      toastmastersRolePrompts.length - roleIndex,
    );
    if (!isEnoughCoins) {
      return;
    }

    // -1: means reset from the last message of roleIndex
    chatStore.resetSessionFromIndex(promptCount + 2 * roleIndex - 1);

    /*
    JavaScript 中的 for 循环通常是同步顺序执行的。这意味着循环内的代码会按顺序执行，每次迭代都会等待上一次迭代完成后才会开始下一次迭代。
    这是因为 JavaScript 是单线程的，它在执行循环时会阻塞其他代码的执行，直到循环完成。
    */
    for (let i = roleIndex; i < toastmastersRolePrompts.length; i++) {
      let item = toastmastersRolePrompts[i];
      let ask = item.contentWithSetting(
        session.inputSetting[session.inputRole],
      );
      chatStore.onUserInput(ask);
      await chatStore.getIsFinished();
    }

    // TODO
    // if (!isMobileScreen) inputRef.current?.focus();
    // setAutoScroll(true);
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

  const onVideoGenerate = async (messageContent: string) => {
    const words = ChatUtility.getWordsNumber(messageContent);
    const cost =
      session.inputSetting[ToastmastersRoles.PageSettings].words == -1
        ? words
        : Math.min(
            session.inputSetting[ToastmastersRoles.PageSettings].words,
            words,
          );

    const confirmText: string = `
    This will generate a video by a Speech Avatar according to your speech content.
    
    The cost way: 1 word costs 1 AI coin; 
    Current setting: - Speech Avatar max words: ${
      session.inputSetting[ToastmastersRoles.PageSettings].words
    };
    current words: ${words}.

    When confirm, ${cost} AI coins will be cost.
    `;

    if (
      session.inputSetting[ToastmastersRoles.PageSettings].avatarCostPreview ==
      true
    ) {
      const isConfirmed = await showConfirm(
        <span style={{ whiteSpace: "pre-line" }}> {confirmText} </span>,
      );

      if (!isConfirmed) return;
    }

    const isEnoughCoins = await chatStore.isEnoughCoins(cost);

    if (!isEnoughCoins) {
      return;
    }

    await onSpeechAvatar(
      ChatUtility.getFirstNWords(
        messageContent,
        session.inputSetting[ToastmastersRoles.PageSettings].words,
        false,
      ),
      (outputAvatar: HttpRequestResponse) => {
        chatStore.updateCurrentSession(
          (session) => (session.outputAvatar = outputAvatar),
        );
      },
    );

    // check user login
    let userEmail = localStorage.getItem(LocalStorageKeys.userEmail);
    if (userEmail === null) {
      showToast("您尚未登录, 请前往设置中心登录");
      return;
    }
    // update db
    zBotServiceClient.updateRequest(userEmail); // TODO: count
  };

  return (
    <div className={styles["chat-input-panel"]}>
      {props.toastmastersRolePrompts.map((role, index) => {
        // if length > index => the data is ready => show the data, else show the last data
        var message: ChatMessage = createMessage({});
        if (session.messages.length > promptCount + 2 * index + 1)
          // data is ready, just read it
          message = session.messages[promptCount + 2 * index];
        else if (session.messages.length == promptCount + 2 * index + 1)
          message = session.messages[session.messages.length - 1];

        var showActions = message.content.length > 0;

        return (
          <div key={index} className={styles["chat-message-hover"]}>
            <div className={styles["chat-input-panel-title"]}> {role.role}</div>

            <div className={styles["chat-message-item"]}>
              {showActions && (
                <div className={styles["chat-message-actions"]}>
                  <div
                    className={styles["chat-input-actions"]}
                    style={{
                      marginTop: 20,
                      marginBottom: -5,
                    }}
                  >
                    {message.streaming ? (
                      <ChatAction
                        text={Locale.Chat.Actions.Stop}
                        icon={<StopIcon />}
                        onClick={() => onUserStop(message.id ?? 2 * index + 3)}
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
                            speechSynthesizer.startSynthesize(
                              message.content,
                              session.mask.lang,
                            )
                          }
                        />
                        <ChatAction
                          text={"AvatarVideo"}
                          icon={<AvatarIcon />}
                          onClick={() => onVideoGenerate(message.content)}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              <Markdown
                content={message?.content}
                fontSize={config.fontSize}
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
  );
};

export const ChatAction = (props: {
  text: string;
  icon: JSX.Element;
  onClick: () => void;
}) => {
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
};

export const Markdown = dynamic(
  async () => (await import("../components/markdown")).Markdown,
  {
    loading: () => <LoadingIcon />,
  },
);

export function useScrollToBottom() {
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
