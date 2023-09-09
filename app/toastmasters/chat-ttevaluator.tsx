import React, { useState, useRef, useEffect } from "react";
import _ from "lodash";

import { useChatStore } from "../store";

import styles_chat from "../components/chat.module.scss";
import styles_tm from "./toastmasters.module.scss";
import {
  List,
  ListItem,
  showPrompt,
  showToast,
  showModal,
  Input,
} from "../components/ui-lib";
import { IconButton } from "../components/button";

import {
  ToastmastersTTEvaluatorGuidance as ToastmastersRoleGuidance,
  ToastmastersTTEvaluatorRecord as ToastmastersRecord,
  InputSubmitStatus,
  ToastmastersRoles,
} from "./roles";
import {
  ChatTitle,
  ChatInput,
  ChatResponse,
  useScrollToBottom,
  ChatUtility,
} from "./chat-common";
import { ChatSession, InputTableRow, HttpRequestResponse } from "../store/chat";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import RenameIcon from "../icons/rename.svg";
import CopyIcon from "../icons/copy.svg";
import SendWhiteIcon from "../icons/send-white.svg";
import SettingsIcon from "../icons/settings.svg";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButtonMui from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { text } from "stream/consumers";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Switch from "@mui/material/Switch";

import { VideoFetchStatus } from "../cognitive/speech-avatar";

export function Chat() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 设置自动滑动窗口
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);

  const checkInput = (): InputSubmitStatus => {
    var speakerInputs: string[] = [];

    const isAllValid = session.inputTable.every((row) => {
      let question = row.question.text.trim();
      let speech = row.speech.text.trim();
      if (question === "" || speech === "") {
        showToast(`${row.speaker}: Question or Speech is empty, please check`);
        return false;
      }

      var speakerInput: string = `
      {
        "Speaker": "${row.speaker}",
        "Question": "${row.question.text}",
        "Speech": "${row.speech.text}"
      }
      `;
      speakerInputs.push(speakerInput);
      return true;
    });

    if (!isAllValid) {
      return new InputSubmitStatus(false, "");
    }

    console.log("CheckInput: ", speakerInputs);

    var speakerInputsString = speakerInputs.join(",\n");

    // Add a return statement for the case where the input is valid
    var guidance = ToastmastersRoleGuidance(speakerInputsString);
    console.log(guidance);
    return new InputSubmitStatus(true, guidance);
  };

  const addItem = () => {
    setAutoScroll(false);
    const newItem: InputTableRow = {
      speaker: `Speaker${session.inputTable.length + 1}`,
      question: { text: "", time: 0 },
      speech: { text: "", time: 0 },
    };
    var newInputBlocks = [...session.inputTable, newItem];
    chatStore.updateCurrentSession(
      (session) => (session.inputTable = newInputBlocks),
    );
  };

  const deleteItem = (row_index: number) => {
    chatStore.updateCurrentSession((session) =>
      session.inputTable.splice(row_index, 1),
    );
  };

  const renameSpeaker = (row: InputTableRow) => {
    showPrompt("Rename", row.speaker).then((newName) => {
      if (newName && newName !== row.speaker) {
        chatStore.updateCurrentSession((session) => (row.speaker = newName));
      }
    });
  };

  function CollapsibleTable() {
    return (
      <TableContainer component={Paper}>
        <Table
          aria-label="collapsible table"
          className={styles_tm["table-border"]}
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "10px" }} />
              <TableCell
                align="left"
                className={styles_tm["table-header"]}
                style={{ width: "100px" }}
              >
                Speaker
              </TableCell>
              <TableCell align="left" className={styles_tm["table-header"]}>
                Question
              </TableCell>
              <TableCell align="left" className={styles_tm["table-header"]}>
                Speech
              </TableCell>
              <TableCell
                align="left"
                className={styles_tm["table-header"]}
                style={{ width: "100px" }}
              >
                SpeechWords
              </TableCell>
              <TableCell
                align="left"
                className={styles_tm["table-header"]}
                style={{ width: "100px" }}
              >
                SpeechTime
              </TableCell>
              <TableCell
                align="left"
                className={styles_tm["table-header"]}
                style={{ width: "100px" }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {session.inputTable.map((row, index) => (
              <Row key={index} row={row} row_index={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  function Row(props: { row: InputTableRow; row_index: number }) {
    const { row, row_index } = props;
    const [open, setOpen] = React.useState(false);

    return (
      <React.Fragment>
        <TableRow
          sx={{ "& > *": { borderBottom: "unset" } }}
          onClick={() => setOpen(!open)}
        >
          <TableCell>
            <IconButtonMui
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButtonMui>
          </TableCell>
          <TableCell component="th" scope="row">
            <div
              className={`${styles_tm["chat-input-speaker"]}`}
              onClickCapture={() => {
                renameSpeaker(row);
              }}
            >
              {row.speaker}
            </div>
          </TableCell>
          <TableCell align="left">
            {ChatUtility.getFirstNWords(row.question.text, 20)}
          </TableCell>
          <TableCell align="left">
            {ChatUtility.getFirstNWords(row.speech.text, 20)}
          </TableCell>
          <TableCell align="left">
            {ChatUtility.getWordsNumber(row.speech.text)}
          </TableCell>
          <TableCell align="left">
            {ChatUtility.formatTime(row.speech.time)}
          </TableCell>
          <TableCell align="left">
            {/* <div className={styles_tm["table-actions"]}> */}
            <IconButton
              icon={<CloseIcon />}
              onClick={() => deleteItem(row_index)}
            />
            {/* </div> */}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <List>
                  <ChatInput title="Question" inputStore={row.question} />
                  <ChatInput
                    title="Table Topics Speech"
                    inputStore={row.speech}
                  />
                </List>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  return (
    <div className={styles_chat.chat} key={session.id}>
      <ChatTitle></ChatTitle>
      <div
        className={styles_chat["chat-body"]}
        ref={scrollRef}
        onMouseDown={() => inputRef.current?.blur()}
        // onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <div className={styles_tm["chat-input-button-add-row"]}>
          <IconButton
            icon={<AddIcon />}
            text="Add Speaker"
            onClick={addItem}
            className={styles_tm["chat-input-button-add"]}
          />
          <IconButton
            icon={<SettingsIcon />}
            text="Settings"
            onClick={() => ToastmastersSettings(session)}
            className={styles_tm["chat-input-button-add"]}
          />
        </div>

        <div style={{ padding: "0px 20px" }}>
          <CollapsibleTable />
        </div>

        <ChatInputAddSubmit
          checkInput={checkInput}
          updateAutoScroll={setAutoScroll}
        />

        <ChatResponse
          scrollRef={scrollRef}
          toastmastersRolePrompts={ToastmastersRecord[session.inputRole]}
        />

        <ChatAvatarShow outputAvatar={session.outputAvatar} />
      </div>
    </div>
  );
}

const ChatInputAddSubmit = (props: {
  checkInput: () => InputSubmitStatus;
  updateAutoScroll: (status: boolean) => void;
}) => {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const [submitting, setSubmitting] = useState(false);

  const [inputRole, setInputRole] = useState(session.inputRole);

  const onInputRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputRole((event.target as HTMLInputElement).value);
  };

  const doSubmit = async () => {
    const checkInputResult = props.checkInput();
    if (!checkInputResult.canSubmit) {
      return;
    }

    const toastmastersRolePrompts = ToastmastersRecord[inputRole];

    let isEnoughCoins = await chatStore.isEnoughCoins(
      toastmastersRolePrompts.length + 1,
    );
    if (!isEnoughCoins) {
      return;
    }
    setSubmitting(true);
    props.updateAutoScroll(true);

    // 保存输入: 于是ChatResponse可以使用
    session.inputRole = inputRole;

    // reset status from 0
    chatStore.resetSession();

    chatStore.onUserInput(checkInputResult.guidance);
    for (const item of toastmastersRolePrompts) {
      await chatStore.getIsFinished();
      let ask = item.contentWithSetting(session.inputSetting[inputRole]);
      chatStore.onUserInput(ask);
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
          {Object.entries(ToastmastersRecord).map(
            ([role, ToastmastersRolePrompts]) => {
              return (
                <FormControlLabel
                  key={role}
                  value={role}
                  control={<Radio />}
                  label={role}
                />
              );
            },
          )}
        </RadioGroup>
      </FormControl>

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

function ToastmastersSettings(session: ChatSession) {
  /*
  将当前的设置值复制到initialSettings: 创建一个新的对象副本，而不是引用相同的对象
  const setting = { ...session.inputSetting }; 
  在JavaScript中，使用{ ...session.inputSetting }这种方式创建一个对象副本时，通常会复制对象的第一层属性，但对于嵌套的对象或子对象，它们仍然是引用。这就是为什么修改setting会影响到session.inputSetting的原因。
  */
  const setting = _.cloneDeep(session.inputSetting);

  const onSubmit = async () => {
    session.inputSetting = { ...setting };
    showToast("Setting has been saved, please return");
  };

  showModal({
    title: "Current Page Settings",
    children: (
      <div>
        <List>
          <ListItem title="Page Settings"></ListItem>
          <ListItem
            title="Avatar Video max words"
            subTitle={"Cost: 1 word costs 1 AI coin. -1 means no limit."}
          >
            <Input
              rows={1}
              defaultValue={setting[ToastmastersRoles.PageSettings].words}
              onChange={(e) =>
                (setting[ToastmastersRoles.PageSettings].words = parseInt(
                  e.currentTarget.value,
                ))
              }
            ></Input>
          </ListItem>
          <ListItem
            title={"Avatar Video Cost Preview"}
            subTitle={
              "Preview how many AI coins will be cost when generating avatar video"
            }
          >
            <Switch
              defaultChecked={
                setting[ToastmastersRoles.PageSettings].avatarCostPreview ??
                true
              }
              onChange={(e) =>
                (setting[ToastmastersRoles.PageSettings].avatarCostPreview =
                  e.currentTarget.checked)
              }
              inputProps={{ "aria-label": "controlled" }}
            />
          </ListItem>
        </List>
        <List>
          <ListItem title="Role Settings"></ListItem>
          <TableContainer component={Paper}>
            <Table className={styles_tm["table-border"]}>
              <TableHead>
                <TableRow>
                  <TableCell align="left">Role</TableCell>
                  <TableCell align="center">
                    Evaluation Words for each Speaker
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(ToastmastersRecord).map(([role]) => (
                  <TableRow key={role}>
                    <TableCell component="th" scope="row">
                      {role}
                    </TableCell>
                    <TableCell align="center">
                      <Input
                        rows={1}
                        defaultValue={setting[role].words}
                        onChange={(e) =>
                          (setting[role].words = parseInt(
                            e.currentTarget.value,
                          ))
                        }
                      ></Input>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </List>
      </div>
    ),
    actions: [
      <IconButton
        icon={<SendWhiteIcon />}
        type="primary"
        key=""
        text="Confirm"
        onClick={onSubmit}
      />,
    ],
  });
}

const ChatAvatarShow = (props: { outputAvatar: HttpRequestResponse }) => {
  const { outputAvatar } = props;

  if (outputAvatar.status === VideoFetchStatus.Empty) {
    return null;
  }

  if (outputAvatar.status === VideoFetchStatus.Error) {
    return <div>{outputAvatar.data}</div>;
  }

  if (outputAvatar.status === VideoFetchStatus.Failed) {
    return <div>{outputAvatar.data}</div>;
  }

  if (outputAvatar.status === VideoFetchStatus.Loading) {
    return (
      <div>
        <h3 className={styles_tm["video-container"]}>
          Avatar Video is generating...
        </h3>
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      </div>
    );
  }

  if (outputAvatar.status === VideoFetchStatus.Succeeded) {
    return (
      <div className={styles_tm["video-container"]}>
        <video controls width="800" height="600">
          <source src={outputAvatar.data} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
};
