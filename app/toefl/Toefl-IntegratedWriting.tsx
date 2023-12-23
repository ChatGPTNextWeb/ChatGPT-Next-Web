import React, { useState, useRef, useEffect } from "react";

import { useAppConfig, useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import styles_tm from "../toastmasters/toastmasters.module.scss";

import { List, showToast } from "../components/ui-lib";

import {
  ChatTitle,
  ChatInput,
  ChatResponse,
  ChatSubmitCheckbox,
  ChatUtility,
} from "../toastmasters/chat-common";
import { useScrollToBottom } from "../components/chat";
import { useDebouncedCallback } from "use-debounce";
import { autoGrowTextArea } from "../utils";
import {
  EToeflRoles,
  ToeflWritingInput,
  ToeflWritingPrompts,
} from "./ToeflRoles";
import { IScoreMetric } from "../toastmasters/ISpeechRoles";
import { IconButton } from "../components/button";
import SendWhiteIcon from "../icons/send-white.svg";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  LinearProgress,
} from "@mui/material";
import "react-circular-progressbar/dist/styles.css";
import IconButtonMui from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import ButtonGroup from "@mui/joy/ButtonGroup";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VerifiedIcon from "@mui/icons-material/Verified";
import ReplayCircleFilledIcon from "@mui/icons-material/ReplayCircleFilled";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tabs from "@mui/material/Tabs";
import PhoneIcon from "@mui/icons-material/Phone";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import CircularProgress from "@mui/material/CircularProgress";
import Rating from "@mui/material/Rating";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import ReactMarkdown from "react-markdown";
import { LinearProgressWithLabel } from "../toastmasters/ISpeech-Common";

export function Chat() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitProgressInfo, setSubmitProgressInfo] = useState("");
  const [submitProgress, setSubmitProgress] = useState(0);
  const [evaluationRole, setEvaluationRole] = React.useState<string>(
    EToeflRoles.Scores,
  );

  useEffect(() => {
    // 在组件加载时初始化 inputCopilot
    if (!session.inputCopilot) {
      chatStore.updateCurrentSession((session) => {
        session.inputCopilot = new ToeflWritingInput();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组表示这个 effect 只在组件挂载时运行一次

  // 检查 inputCopilot 是否已初始化
  if (!session || !session.inputCopilot) {
    return <div>Loading...</div>; // 或其他的加载指示
  }

  const inputCopilot: ToeflWritingInput = session.inputCopilot;
  const evaluationRoles = ToeflWritingPrompts.GetEvaluationRoles();
  const onSubmit = async () => {
    // verify input
    setSubmitting(true);
    const res = await onScore();
    if (res === true) await onEvaluation();
    setSubmitting(false);
  };

  const onScore = async (): Promise<boolean> => {
    // verify input
    const reading = inputCopilot.Reading.text;
    const listening = inputCopilot.Listening.text;
    const writing = inputCopilot.Writing.text;
    if (reading === "") {
      showToast(`reading is empty, please check`);
      return false;
    }
    if (listening === "") {
      showToast(`listening is empty, please check`);
      return false;
    }
    if (writing === "") {
      showToast(`writing is empty, please check`);
      return false;
    }

    // setSubmitting(true);
    // setSubmitProgress(0);
    // Guidance + Score + TotalEvaluation + Grammar + Sample
    // const progressStep = Math.floor(
    //   100 / (3 + evaluationRoles.length),
    // );

    // reset status from 0
    chatStore.resetSession();

    // clean
    chatStore.updateCurrentSession(
      (session) => (
        (inputCopilot.Score = 0),
        (inputCopilot.Scores = []),
        (inputCopilot.EvaluationGeneral = "")
      ),
    );

    // (1) Guidance
    setSubmitProgressInfo("Get Guidance...");
    let ask = ToeflWritingPrompts.GetGuidance(reading, listening, writing);
    chatStore.onUserInput(ask);
    await chatStore.getIsFinished();

    // (2) Scores
    setSubmitProgressInfo("Get Scores...");
    ask = ToeflWritingPrompts.GetScorePrompt();
    chatStore.onUserInput(ask);
    await chatStore.getIsFinished();

    let response = session.messages[session.messages.length - 1].content;
    console.log("Scores: ", response);
    let scores: IScoreMetric[] = [];
    try {
      scores = JSON.parse(response);
    } catch (error) {
      showToast(`JSON.parse(response) failed, please try again.`);
      return false;
    }
    const socreRoles = ToeflWritingPrompts.GetScoreRoles();
    if (socreRoles.length !== scores.length) {
      showToast(
        `socreRoles.length=${socreRoles.length}, scores.length=${scores.length}.`,
      );
      return false;
    }

    const averageScore = Math.round(
      scores.reduce((acc, val) => acc + val.Score, 0) / scores.length,
    );

    chatStore.updateCurrentSession(
      (session) => (
        (inputCopilot.Score = averageScore), (inputCopilot.Scores = scores)
      ),
    );

    // (3) GeneralFeedback
    setSubmitProgressInfo(`Get ${EToeflRoles.GeneralFeedback}...`);
    ask = ToeflWritingPrompts.GetGeneralFeedbackPrompt();
    chatStore.onUserInput(ask);
    await chatStore.getIsFinished();
    response = session.messages[session.messages.length - 1].content;
    // console.log("response: ", response);
    chatStore.updateCurrentSession(
      (session) => (inputCopilot.EvaluationGeneral = response),
    );
    return true;
  };

  const onEvaluation = async () => {
    // setEvaluating(true);
    chatStore.resetSessionFromIndex(2);

    // reset
    chatStore.updateCurrentSession(
      (session) => (inputCopilot.Evaluations = {}),
    );

    const evaluationPropmts = ToeflWritingPrompts.GetEvaluationPrompts();
    for (const role of evaluationRoles) {
      setSubmitProgressInfo(`Get ${role}...`);
      chatStore.onUserInput(evaluationPropmts[role]);
      await chatStore.getIsFinished();
      const response = session.messages[session.messages.length - 1].content;
      // console.log("response: ", response);
      chatStore.updateCurrentSession(
        (session) => (inputCopilot.Evaluations[role] = response),
      );
    }
    await chatStore.getIsFinished();

    // setEvaluating(false);
  };

  const onReEvaluation = async (role: string) => {
    // setEvaluating(true);
    chatStore.resetSessionFromIndex(2); // to keep scores as history

    chatStore.updateCurrentSession(
      (session) => delete inputCopilot.Evaluations[role],
    );

    const evaluationPropmts = ToeflWritingPrompts.GetEvaluationPrompts();
    chatStore.onUserInput(evaluationPropmts[role]);
    await chatStore.getIsFinished();
    const response = session.messages[session.messages.length - 1].content;
    chatStore.updateCurrentSession(
      (session) => (inputCopilot.Evaluations[role] = response),
    );
    // chatStore.resetSessionFromIndex(4); // to keep scores as history
    // setEvaluating(false);
  };

  const getInputsString = (): string => {
    const inputRow = session.input.data;
    const speakerInputs = {
      Topic: inputRow.question.text.trim(),
      Speech: inputRow.speech.text.trim(),
    };
    // 4 是可选的缩进参数，它表示每一层嵌套的缩进空格数
    const speakerInputsString = JSON.stringify(speakerInputs, null, 4);
    return speakerInputsString;
  };

  return (
    <div className={styles.chat} key={session.id}>
      <ChatTitle getInputsString={getInputsString}></ChatTitle>

      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        onMouseDown={() => inputRef.current?.blur()}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <List>
          <ChatInput title="Reading" inputStore={inputCopilot.Reading} />
          <ChatInput title="Listening" inputStore={inputCopilot.Listening} />
          <ChatInput title="User Writing" inputStore={inputCopilot.Writing} />

          {submitting ? (
            <div>
              <Stack
                direction="row"
                spacing={10}
                justifyContent="center"
                alignItems="center"
                sx={{
                  marginBottom: "20px",
                  marginTop: "20px",
                }}
              >
                <IconButton
                  icon={<SendWhiteIcon />}
                  text="Submitting"
                  disabled={true}
                  className={styles_tm["chat-input-button-submitting"]}
                />
              </Stack>
              {/* <LinearProgressWithLabel value={submitProgress} /> */}
              <div
                style={{
                  marginLeft: "20px",
                }}
              >
                {submitProgressInfo}
              </div>
            </div>
          ) : (
            <Stack
              direction="row"
              spacing={10}
              justifyContent="center"
              alignItems="center"
              sx={{
                marginBottom: "20px",
                marginTop: "20px",
              }}
            >
              <IconButton
                icon={<SendWhiteIcon />}
                text="Submit"
                disabled={false}
                className={styles_tm["chat-input-button-submit"]}
                onClick={onSubmit}
              />
              {inputCopilot.Score > 0 && (
                <IconButtonMui
                  title="Average Score"
                  color="secondary"
                  aria-label="score"
                  sx={{
                    backgroundColor: "lightblue", // 淡蓝色背景
                    color: "blue", // 图标颜色，这里选择了白色
                    borderRadius: "50%", // 圆形
                    width: 40, // 宽度
                    height: 40, // 高度
                    padding: 0, // 如果需要，调整内边距
                  }}
                >
                  <Typography variant="subtitle1">
                    {inputCopilot.Score}
                  </Typography>
                </IconButtonMui>
              )}
            </Stack>
          )}
        </List>

        <List>
          <Accordion
            sx={{
              backgroundColor: "#f5f5f5",
              userSelect: "text",
              marginTop: "5px",
            }}
          >
            {/* <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Evaluations</Typography>
            </AccordionSummary>
            <AccordionDetails> */}
            <Box sx={{ width: "100%", typography: "body1" }}>
              <TabContext value={evaluationRole}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList
                    onChange={(event, newValue) => {
                      setEvaluationRole(newValue);
                    }}
                    aria-label="lab API tabs example"
                  >
                    <Tab
                      label={EToeflRoles.Scores}
                      value={EToeflRoles.Scores}
                      sx={{ textTransform: "none" }}
                    />
                    {evaluationRoles.map((role, index) => (
                      <Tab
                        key={index}
                        label={role}
                        value={role}
                        sx={{ textTransform: "none" }}
                      />
                    ))}
                  </TabList>
                </Box>
                <TabPanel value={EToeflRoles.Scores}>
                  <h4> {EToeflRoles.TotalScore} </h4>
                  <Box
                    sx={{
                      width: 200,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Rating
                      name="read-only"
                      value={inputCopilot.Score}
                      readOnly
                      size="large"
                    />
                    <Box sx={{ ml: 2 }}>{inputCopilot.Score}分</Box>
                  </Box>

                  <h4> {EToeflRoles.SubScore} </h4>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell align="center">Score(0-5)</TableCell>
                          <TableCell align="center">Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inputCopilot.Scores.map((row, index) => (
                          <TableRow
                            key={row.Subject}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                border: 0,
                              },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {index + 1}.{row.Subject}
                            </TableCell>
                            <TableCell align="center">{row.Score}</TableCell>
                            <TableCell align="left">{row.Reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <h4> {EToeflRoles.GeneralFeedback} </h4>
                  <ReactMarkdown>
                    {inputCopilot.EvaluationGeneral}
                  </ReactMarkdown>

                  <Stack
                    direction="row"
                    spacing={5}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <IconButtonMui title="Regenerage" onClick={onScore}>
                      <ReplayCircleFilledIcon />
                    </IconButtonMui>
                  </Stack>
                </TabPanel>
                {evaluationRoles.map((role, index) => (
                  <TabPanel key={index} value={role}>
                    {role in inputCopilot.Evaluations && (
                      <Typography style={{ textAlign: "left" }}>
                        <ReactMarkdown>
                          {inputCopilot.Evaluations[role]}
                        </ReactMarkdown>
                        <div className={styles["chat-input-words"]}>
                          {ChatUtility.getWordsNumber(
                            inputCopilot.Evaluations[role],
                          )}{" "}
                          words
                        </div>
                        <Stack
                          direction="row"
                          spacing={5}
                          justifyContent="center"
                          alignItems="center"
                        >
                          <IconButtonMui
                            title="Regenerage"
                            onClick={(event) => onReEvaluation(role)}
                          >
                            <ReplayCircleFilledIcon />
                          </IconButtonMui>
                        </Stack>
                      </Typography>
                    )}
                  </TabPanel>
                ))}
              </TabContext>
            </Box>
            {/* </AccordionDetails> */}
          </Accordion>
        </List>
      </div>
    </div>
  );
}

// TODO:
export const ChatInputBox = (props: { title: string; text: string }) => {
  const { title, text } = props;

  const config = useAppConfig();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState(text);

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

  return (
    <div className={styles_tm["chat-input-panel-noborder"]}>
      <div className={styles_tm["chat-input-panel-title"]}>{title}</div>
      <div className={styles_tm["chat-input-panel-textarea"]}>
        <textarea
          ref={inputRef}
          className={styles["chat-input"]}
          placeholder={"Enter To wrap"}
          defaultValue={text}
          onChange={(e) => setUserInput(e.currentTarget.value)}
          rows={inputRows}
          style={{
            fontSize: config.fontSize,
          }}
        />
        <div className={styles_tm["chat-input-words"]}>
          {ChatUtility.getWordsNumber(userInput)} words{" "}
        </div>
      </div>
    </div>
  );
};
