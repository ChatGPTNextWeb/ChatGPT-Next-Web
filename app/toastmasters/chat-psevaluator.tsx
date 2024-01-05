import React, { useState, useRef, useEffect } from "react";

import { useAppConfig, useChatStore } from "../store";

import styles_tm from "../toastmasters/toastmasters.module.scss";
import styles_chat from "../components/chat.module.scss";
import styles_ispeech from "./ISpeech.module.scss";

import {
  List,
  ListItem,
  showConfirmWithProps,
  showPrompt,
  showToast,
} from "../components/ui-lib";
import SendWhiteIcon from "../icons/send-white.svg";
import ResetIcon from "../icons/reload.svg";
import AvatarIcon from "../icons/avatar36.svg";

import { PreparedSpeechInput } from "./PreparedSpeechRoles";
import Locale from "../locales";
import { ChatTitle, ChatInput, ChatUtility, BorderLine } from "./chat-common";
import { ChatAction, useScrollToBottom } from "../components/chat";
import { IconButton } from "../components/button";
import { Markdown } from "../components/exporter";

import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { EN_MASKS } from "../masks/en";
import { AzureRoles, AzureTTSAvatarInput } from "../azure-speech/AzureRoles";
import { Mask } from "../store/mask";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { useMobileScreen } from "../utils";

export function Chat() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  useEffect(() => {
    // 在组件加载时初始化 inputCopilot
    if (!session.inputCopilot) {
      chatStore.updateCurrentSession((session) => {
        session.inputCopilot = new PreparedSpeechInput();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组表示这个 effect 只在组件挂载时运行一次

  // 检查 inputCopilot 是否已初始化
  if (!session || !session.inputCopilot) {
    return <div>Loading...</div>; // 或其他的加载指示
  }

  return <ChatCore sessionInput={session.inputCopilot}></ChatCore>;
}

export function ChatCore(props: { sessionInput: PreparedSpeechInput }) {
  const { sessionInput } = props;

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();
  const config = useAppConfig();
  const [submitting, setSubmitting] = useState(false);
  const [evaluationRole, setEvaluationRole] = useState<string>(
    Object.keys(
      PreparedSpeechInput.GetCheckedRoles(sessionInput.RolesSetting),
    )[0],
  );

  const onEvaluation = async (role: string) => {
    const topic = sessionInput.Topic.text.trim();
    const speech = sessionInput.Speech.text.trim();
    if (topic === "") {
      showToast("Topic is empty, please check");
      return;
    }
    if (speech === "") {
      showToast("Speech is empty, please check");
      return;
    }

    const checkRoles = PreparedSpeechInput.GetCheckedRoles(
      sessionInput.RolesSetting,
    );
    const checkRolesKeys = Object.keys(checkRoles);
    if (checkRolesKeys.length == 0) {
      showToast("Evaluate Role is empty, please check");
      return;
    }

    let isEnoughCoins = await chatStore.isEnoughCoins(
      checkRolesKeys.length + 1,
    );
    if (!isEnoughCoins) {
      return;
    }

    const currentSetting = sessionInput.RolesSetting[role].Setting;
    const setting = _.cloneDeep(currentSetting);

    if (currentSetting) {
      const ContentComponent = () => {
        return (
          <List>
            <ListItem title="Words">
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
        title: `Evaluation Settings`,
        cancelText: "Cancel",
        confirmText: "Confirm",
      });
      if (!isConfirmed) return;

      sessionInput.RolesSetting[role].Setting = _.cloneDeep(setting);
    }

    setSubmitting(true);
    chatStore.updateCurrentSession((session) => {
      sessionInput.RolesSetting[role].Evaluation = "";
    });

    // reset status from 0
    chatStore.resetSession();

    let ask = PreparedSpeechInput.GetEvaluateGuidance(getInputsString());
    chatStore.onUserInput(ask);
    await chatStore.waitFinished();

    ask = PreparedSpeechInput.GetEvaluateRolesPrompt(role, setting);
    chatStore.onUserInput(ask);
    await chatStore.waitFinished();
    chatStore.updateCurrentSession((session) => {
      sessionInput.RolesSetting[role].Evaluation =
        session.messages[session.messages.length - 1].content;
    });
    setSubmitting(false);
  };

  const onTTSAvatar = (text: string) => {
    const mask = EN_MASKS.find(
      (mask) => mask.name === AzureRoles.TTSAvatar,
    ) as Mask;

    chatStore.newSession(mask);
    navigate(mask.pagePath as any);

    // new session has index 0
    chatStore.updateSession(0, (session) => {
      session.inputCopilot = new AzureTTSAvatarInput();
      session.inputCopilot.InputText = text;
      return session;
    });
  };

  const getInputsString = (): string => {
    const speakerInputs = {
      Topic: sessionInput.Topic.text.trim(),
      Speech: sessionInput.Speech.text.trim(),
    };
    // 4 是可选的缩进参数，它表示每一层嵌套的缩进空格数
    const speakerInputsString = JSON.stringify(speakerInputs, null, 4);
    return speakerInputsString;
  };

  const ResponseBody = (props: { role: string }) => {
    const { role } = props;
    return (
      <Typography style={{ textAlign: "left" }}>
        <p
          className={styles_ispeech.questionText}
          onClick={async () => {
            const newMessage = await showPrompt(
              Locale.Chat.Actions.Edit,
              sessionInput.RolesSetting[role].Evaluation,
            );
            chatStore.updateCurrentSession((session) => {
              sessionInput.RolesSetting[role].Evaluation = newMessage;
            });
          }}
        >
          <Markdown
            content={sessionInput.RolesSetting[role].Evaluation}
            fontSize={config.fontSize}
            defaultShow={true}
          />
        </p>
        <div className={styles_chat["chat-input-words"]}>
          {ChatUtility.getWordsNumber(
            sessionInput.RolesSetting[role].Evaluation,
          )}{" "}
          words
        </div>

        <div
          className={styles_chat["chat-input-actions"]}
          style={{
            justifyContent: "center",
            gap: "20px",
          }}
        >
          {/* <ChatAction
              text={Locale.Chat.Actions.Play}
              icon={<PlayCircleIcon />}
              // onClick={() =>
              //   speechSynthesizer.startSynthesize(
              //     impromptuSpeechInput.TotalEvaluations[role],
              //     AzureDefaultEnglishVoiceName,
              //   )
              // }
            /> */}
          <ChatAction
            text={Locale.Chat.Actions.Retry}
            icon={<ResetIcon />}
            onClick={() => onEvaluation(role)}
          />
          <ChatAction
            text={Locale.Chat.Actions.VideoPlay}
            icon={<AvatarIcon style={{ width: "24px", height: "24px" }} />}
            onClick={() => {
              onTTSAvatar(sessionInput.RolesSetting[role].Evaluation);
            }}
          />
        </div>
      </Typography>
    );
  };

  return (
    <div className={styles_chat.chat} key={session.id}>
      <ChatTitle getInputsString={getInputsString}></ChatTitle>

      <div className={styles_chat["chat-body"]}>
        <List>
          <ChatInput title="Topic" inputStore={sessionInput.Topic} />
          <ChatInput title="Speech" inputStore={sessionInput.Speech} />
          <div style={{ paddingBottom: "10px" }}></div>
        </List>

        {isMobileScreen ? (
          <>
            {Object.keys(sessionInput.RolesSetting).map((role, index) => (
              <Accordion
                key={role}
                sx={{ backgroundColor: "#f5f5f5", userSelect: "text" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{role}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ textAlign: "left" }}>
                  {sessionInput.RolesSetting[role].Evaluation === "" ? (
                    submitting ? (
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <IconButton
                          icon={<SendWhiteIcon />}
                          text="Submit"
                          disabled={submitting}
                          className={styles_tm["chat-input-button-submit"]}
                          onClick={() => onEvaluation(role)}
                        />
                      </Box>
                    )
                  ) : (
                    <ResponseBody role={role}></ResponseBody>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        ) : (
          <List>
            <AccordionDetails>
              <Box sx={{ width: "100%", typography: "body1" }}>
                <TabContext value={evaluationRole}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList
                      onChange={(event, newValue) => {
                        setEvaluationRole(newValue);
                      }}
                      aria-label="lab API tabs example"
                    >
                      {Object.keys(sessionInput.RolesSetting).map(
                        (role, index) => (
                          <Tab
                            key={index}
                            label={role}
                            value={role}
                            sx={{ textTransform: "none" }}
                          />
                        ),
                      )}
                    </TabList>
                  </Box>
                  {Object.keys(sessionInput.RolesSetting).map((role, index) => (
                    <TabPanel key={index} value={role}>
                      {sessionInput.RolesSetting[role].Evaluation === "" ? (
                        submitting ? (
                          <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <CircularProgress />
                          </Box>
                        ) : (
                          <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <IconButton
                              icon={<SendWhiteIcon />}
                              text="Submit"
                              disabled={submitting}
                              className={styles_tm["chat-input-button-submit"]}
                              onClick={() => onEvaluation(role)}
                            />
                          </Box>
                        )
                      ) : (
                        <ResponseBody role={role}></ResponseBody>
                      )}
                    </TabPanel>
                  ))}
                </TabContext>
              </Box>
            </AccordionDetails>
          </List>
        )}
      </div>
    </div>
  );
}
