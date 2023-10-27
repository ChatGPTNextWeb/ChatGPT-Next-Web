import { useDebouncedCallback } from "use-debounce";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import _ from "lodash";

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
  IRequestResponse,
} from "../store";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import {
  List,
  ListItem,
  Input,
  showPrompt,
  showToast,
  showModal,
  showConfirm,
  showConfirmWithProps,
} from "../components/ui-lib";
import { autoGrowTextArea } from "../utils";
import Multiselect from "multiselect-react-dropdown";
import { getClientConfig } from "../config/client";
import { ExportMessageModal } from "./chat-exporter";

import styles from "../components/chat.module.scss";
import styles_tm from "./toastmasters.module.scss";
import {
  ToastmastersRolePrompt,
  InputSubmitStatus,
  ToastmastersRoles,
  ToastmastersSettings,
  ToastmastersRolesResponsibilities,
} from "./roles";

import { speechRecognizer, speechSynthesizer } from "../cognitive/speech-sdk";
import { onSpeechAvatar } from "../cognitive/speech-avatar";
import zBotServiceClient, {
  LocalStorageKeys,
} from "../zbotservice/ZBotServiceClient";
import { SpeechAvatarVideoSetting } from "../cognitive/speech-avatar";
import { ChatAction } from "../components/chat";
import { Markdown } from "../components/exporter";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Tooltip from "@mui/material/Tooltip";
import ReactMarkdown from "react-markdown";
import { TimeSlider } from "./chat-timeSlider";

const ToastmastersDefaultLangugage = "en";

export function ChatTitle(props: { getInputsString: () => string }) {
  const navigate = useNavigate();
  const config = useAppConfig();

  const [showExport, setShowExport] = useState(false);
  const [showMessages, setShowMessages] = useState<ChatMessage[]>([]);

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

  const onExport = () => {
    const selectMessages: ChatMessage[] = [];

    selectMessages.push(
      createMessage({
        content: props.getInputsString(),
        role: "user",
        title: "Speaker Inputs",
      }),
    );

    session.messages.forEach((message, index) => {
      if (message.role === "assistant" && message.title !== "Guidance") {
        selectMessages.push(message);
      }
    });
    setShowMessages(selectMessages);
    setShowExport(true);
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
        <div className="window-action-button">
          <IconButton
            icon={<ExportIcon />}
            bordered
            title={Locale.Chat.Actions.Export}
            onClick={onExport}
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

      {showExport && (
        <ExportMessageModal
          onClose={() => setShowExport(false)}
          messages={showMessages}
          topic={session.topic}
        />
      )}
    </div>
  );
}

export const ChatInput = (props: {
  title: string;
  inputStore: InputStore;
  showTime?: boolean;
}) => {
  const { title, inputStore, showTime = false } = props;

  const config = useAppConfig();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [recording, setRecording] = useState(false);

  /*
  when page is mounted, show last userInput
  when userInput is changed, show userInput
  when Send button is clicked, show session.messages[session.messages.length-1].content
  */
  const [userInput, setUserInput] = useState(inputStore.text);
  const [time, setTime] = useState(inputStore.time);

  // 计时器
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (recording) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      props.inputStore.time = time;
    }

    return () => {
      // save to store
      inputStore.time = time;
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
    inputStore.text = userInput;

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
    <div className={styles_tm["chat-input-panel-noborder"]}>
      <div className={styles_tm["chat-input-panel-title"]}>{title}</div>
      <div className={styles_tm["chat-input-panel-textarea"]}>
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
              ? styles_tm["chat-input-send-recording"]
              : styles_tm["chat-input-send-record"]
          }
          onClick={onRecord}
        />
        <div className={styles_tm["chat-input-words"]}>
          {ChatUtility.getWordsNumber(userInput)} words,{" "}
          {ChatUtility.formatTime(time)}
        </div>
      </div>

      {showTime == true ? <TimeSlider time={time}></TimeSlider> : <></>}
    </div>
  );
};

export const ChatSubmitCheckbox = (props: {
  toastmastersRecord: Record<string, ToastmastersRolePrompt[]>;
  checkInput: () => InputSubmitStatus;
}) => {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const roleSelectRef = useRef<Multiselect>(null);
  const [submitting, setSubmitting] = useState(false);

  type SelectType = {
    name: string;
  };
  const multiselectOptions = Object.keys(props.toastmastersRecord).map(
    (roleName) => ({
      name: roleName,
    }),
  );

  const selectedOptions = session.input.roles.map((roleName) => ({
    name: roleName,
  }));

  const doSubmit = async () => {
    const checkInputResult = props.checkInput();
    if (!checkInputResult.canSubmit) {
      return;
    }

    const selectItems = roleSelectRef.current?.getSelectedItems();
    // 将选择的role, 合并为一个数组
    var toastmastersRolePrompts: ToastmastersRolePrompt[] = [];
    selectItems?.forEach((item: SelectType) => {
      toastmastersRolePrompts = toastmastersRolePrompts.concat(
        props.toastmastersRecord[item.name],
      );
    });

    let isEnoughCoins = await chatStore.isEnoughCoins(
      toastmastersRolePrompts.length + 1,
    );
    if (!isEnoughCoins) {
      return;
    }
    setSubmitting(true);

    // 保存输入: 于是ChatResponse可以使用
    chatStore.updateCurrentSession(
      (session) =>
        (session.input.roles = selectItems?.map((v: SelectType) => v.name)),
    );
    session.input.setting = ToastmastersSettings(props.toastmastersRecord);

    // reset status from 0
    chatStore.resetSession();

    chatStore.onUserInput(
      checkInputResult.guidance,
      ToastmastersRoles.Guidance,
    );
    for (const selectItem of selectItems) {
      const _RolePrompts = props.toastmastersRecord[selectItem.name];
      for (const item of _RolePrompts) {
        await chatStore.getIsFinished();
        let ask = item.contentWithSetting(session.input.setting[item.role]);
        chatStore.onUserInput(ask, item.role);
      }
      await chatStore.getIsFinished();
    }
    setSubmitting(false);

    // if (!isMobileScreen) inputRef.current?.focus();
    // setAutoScroll(true);
  };

  return (
    <div className={styles_tm["chat-input-panel-buttons"]}>
      <Multiselect
        options={multiselectOptions} // Options to display in the dropdown
        ref={roleSelectRef}
        // onSelect={this.onSelect} // Function will trigger on select event
        // onRemove={this.onRemove} // Function will trigger on remove event
        displayValue="name" // Property name to display in the dropdown options
        placeholder="Select Roles" // Placeholder for the dropdown search input
        showCheckbox
        selectedValues={selectedOptions}
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
            ? styles_tm["chat-input-button-submitting"]
            : styles_tm["chat-input-button-submit"]
        }
        onClick={doSubmit}
      />
    </div>
  );
};

export const ChatSubmitRadiobox = (props: {
  toastmastersRecord: Record<string, ToastmastersRolePrompt[]>;
  checkInput: () => InputSubmitStatus;
  updateAutoScroll: (status: boolean) => void;
}) => {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const [submitting, setSubmitting] = useState(false);

  const [inputRole, setInputRole] = useState(session.input.roles[0] || "");

  const onInputRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputRole((event.target as HTMLInputElement).value);
  };

  const doSubmit = async () => {
    const checkInputResult = props.checkInput();
    if (!checkInputResult.canSubmit) {
      return;
    }

    const toastmastersRolePrompts = props.toastmastersRecord[inputRole];

    const isEnoughCoins = await chatStore.isEnoughCoins(
      toastmastersRolePrompts.length + 1,
    );
    if (!isEnoughCoins) {
      return;
    }
    setSubmitting(true);
    props.updateAutoScroll(true);

    // 保存输入: 于是ChatResponse可以使用
    session.input.roles[0] = inputRole;
    session.input.setting = ToastmastersSettings(props.toastmastersRecord);

    // reset status from 0
    chatStore.resetSession();

    let ask = checkInputResult.guidance;
    chatStore.onUserInput(ask, ToastmastersRoles.Guidance);
    for (const item of toastmastersRolePrompts) {
      await chatStore.getIsFinished();

      // TODO: move setting into item, but when retry, it will lose
      ask = item.contentWithSetting(session.input.setting[item.role]);
      chatStore.onUserInput(ask, item.role);
    }
    await chatStore.getIsFinished();

    setSubmitting(false);

    // if (!isMobileScreen) inputRef.current?.focus();
    // setAutoScroll(true);
  };

  return (
    <div className={styles_tm["chat-input-panel-buttons"]}>
      <FormControl>
        <FormLabel id="demo-controlled-radio-buttons-group">
          Evaluators
        </FormLabel>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={inputRole}
          onChange={onInputRoleChange}
          row
        >
          {Object.entries(props.toastmastersRecord).map(
            ([role, ToastmastersRolePrompts]) => {
              return (
                <Tooltip
                  key={role}
                  title={
                    <ReactMarkdown>
                      {ToastmastersRolesResponsibilities[role]}
                    </ReactMarkdown>
                  }
                >
                  <FormControlLabel
                    value={role}
                    control={<Radio />}
                    label={role}
                    className={styles_tm["selection-tooltip"]}
                  />
                </Tooltip>
              );
            },
          )}
        </RadioGroup>
      </FormControl>

      {inputRole && (
        <IconButton
          icon={<SendWhiteIcon />}
          text={submitting ? "Submitting" : "Submit"}
          disabled={submitting}
          className={
            submitting
              ? styles_tm["chat-input-button-submitting"]
              : styles_tm["chat-input-button-submit"]
          }
          onClick={doSubmit}
        />
      )}
    </div>
  );
};

export const ChatResponse = (props: {
  scrollRef: React.RefObject<HTMLDivElement>;
  toastmastersRecord: Record<string, ToastmastersRolePrompt[]>;
}) => {
  const { scrollRef, toastmastersRecord } = props;

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const config = useAppConfig();

  // prompt count
  const promptCount = 3;

  // 将选择的role, 合并为一个数组
  let toastmastersRolePrompts: ToastmastersRolePrompt[] = [];
  session.input.roles?.forEach((roleName: any) => {
    toastmastersRolePrompts = toastmastersRolePrompts.concat(
      toastmastersRecord[roleName],
    );
  });

  // TODO: when resending, the page will auto scroll to the bottom, so the avatar video will cover the reponse message
  const onResendConfirm = async (messageIndex: number, roleIndex: number) => {
    const currentPromptItem = toastmastersRolePrompts[roleIndex];
    const currentSetting = session.input.setting[currentPromptItem.role];
    if (currentSetting) {
      const setting = _.cloneDeep(currentSetting);
      const ContentComponent = () => {
        return (
          <List>
            <ListItem title="Evaluation Words for each Speaker">
              <input
                type="number"
                min={0}
                defaultValue={setting.words}
                onChange={(e) =>
                  (setting.words = parseInt(e.currentTarget.value))
                }
              ></input>
            </ListItem>
          </List>
        );
      };

      const isConfirmed = await showConfirmWithProps({
        children: <ContentComponent />,
        title: `${currentPromptItem.role} Settings`,
        cancelText: "Cancel",
        confirmText: "Confirm",
      });
      if (!isConfirmed) return;

      session.input.setting[currentPromptItem.role] = _.cloneDeep(setting);
    }

    // -1: means reset from the last message of roleIndex
    chatStore.resetSessionFromIndex(messageIndex - 1);

    /*
    JavaScript 中的 for 循环通常是同步顺序执行的。这意味着循环内的代码会按顺序执行，每次迭代都会等待上一次迭代完成后才会开始下一次迭代。
    这是因为 JavaScript 是单线程的，它在执行循环时会阻塞其他代码的执行，直到循环完成。
    */
    // const roleIndex = (messageIndex - promptCount) / 2;
    for (let i = roleIndex; i < toastmastersRolePrompts.length; i++) {
      let item = toastmastersRolePrompts[i];
      let ask = item.contentWithSetting(session.input.setting[item.role]);
      chatStore.onUserInput(ask, item.role);
      await chatStore.getIsFinished();
    }
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
      config.avatarVideo.maxWords == -1
        ? words
        : Math.min(config.avatarVideo.maxWords, words);

    if (config.avatarVideo.previewCost === true) {
      const isConfirmed = await showConfirm(
        <SpeechAvatarVideoSetting></SpeechAvatarVideoSetting>,
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
        config.avatarVideo.maxWords,
        false,
      ),
      (outputAvatar: IRequestResponse) => {
        chatStore.updateCurrentSession(
          (session) => (session.output.avatar = outputAvatar),
        );
      },
    );

    const userEmail = localStorage.getItem(LocalStorageKeys.userEmail);
    zBotServiceClient.updateRequest(userEmail ?? "", cost);
  };

  return (
    <div className={styles["chat-input-panel"]}>
      {session.messages.map((message, messageIndex) => {
        var showActions = message.content.length > 0;

        // first question-answer pair is guidance, and only show the answer from bot
        if (messageIndex <= 1 || messageIndex % 2 == 0) return null;

        const roleIndex = (messageIndex - promptCount) / 2;
        const roleKey = toastmastersRolePrompts[roleIndex].role;

        return (
          <div key={messageIndex} className={styles["chat-message-hover"]}>
            <div className={styles["chat-input-panel-title"]}>{roleKey}</div>

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
                        onClick={() => onUserStop(message.id ?? messageIndex)}
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
                          onClick={() =>
                            onResendConfirm(messageIndex, roleIndex)
                          }
                        />
                        <ChatAction
                          text={Locale.Chat.Actions.Copy}
                          icon={<CopyIcon />}
                          onClick={() => copyToClipboard(message.content)}
                        />
                        <ChatAction
                          text={Locale.Chat.Actions.AudioPlay}
                          icon={<MicphoneIcon />}
                          onClick={() =>
                            speechSynthesizer.startSynthesize(
                              message.content,
                              session.mask.lang,
                            )
                          }
                        />
                        <ChatAction
                          text={Locale.Chat.Actions.VideoPlay}
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

export const BorderLine = () => {
  const lineStyle = {
    borderBottom: "var(--border-in-light)",
    width: "100%", // 横跨整个父容器
    margin: "10px 0", // 设置上下边距
  };

  return <div style={lineStyle}></div>;
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
