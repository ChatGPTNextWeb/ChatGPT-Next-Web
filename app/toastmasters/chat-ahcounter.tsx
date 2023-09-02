import React, { useState, useRef, useEffect } from "react";

import { useChatStore } from "../store";

import styles_chat from "../components/chat.module.scss";
import styles_tm from "./toastmasters.module.scss";
import { List, showPrompt, showToast } from "../components/ui-lib";
import { IconButton } from "../components/button";

import {
  ToastmastersAhCounterGuidance as ToastmastersRoleGuidance,
  ToastmastersAhCounter as ToastmastersRoleOptions,
  ToastmastersRolePrompt,
  InputSubmitStatus,
} from "./roles";
import {
  ChatTitle,
  ChatInput,
  ChatInputSubmit,
  ChatResponse,
  useScrollToBottom,
  ChatInputName,
  ChatUtility,
} from "./chat-common";
import { InputBlock } from "../store/chat";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import RenameIcon from "../icons/rename.svg";
import CopyIcon from "../icons/copy.svg";
import SendWhiteIcon from "../icons/send-white.svg";

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

import Multiselect from "multiselect-react-dropdown";

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

  const [toastmastersEvaluators, setToastmastersEvaluators] = useState<
    ToastmastersRolePrompt[]
  >([]);

  // 进来时, 读取上次的输入
  useEffect(() => {
    var roles = session.inputs.roles?.map(
      (index: number) => ToastmastersRoleOptions[index],
    );
    setToastmastersEvaluators(roles);
  }, []);

  const checkInput = (): InputSubmitStatus => {
    var speakerInputs: string[] = [];

    const isAllValid = session.inputBlocks.every((element) => {
      let question = element.question.text.trim();
      let speech = element.speech.text.trim();
      if (question === "" || speech === "") {
        showToast(
          `${element.speaker}: Question or Speech is empty, please check`,
        );
        return false;
      }

      var speakerInput: string = `
      {
        "Speaker": "${element.speaker}",
        "Question": "${element.question.text}",
        "Speech": "${element.speech.text}"
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

  const deleteItem = (row_index: number) => {
    chatStore.updateCurrentSession((session) =>
      session.inputBlocks.splice(row_index, 1),
    );
  };

  const renameSpeaker = (row: InputBlock) => {
    showPrompt("Rename", row.speaker).then((newName) => {
      if (newName && newName !== row.speaker) {
        chatStore.updateCurrentSession((session) => (row.speaker = newName));
      }
    });
  };

  function CollapsibleTable(props: { inputBlocks: InputBlock[] }) {
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
            {props.inputBlocks.map((row, index) => (
              <Row key={index} row={row} row_index={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  function Row(props: { row: InputBlock; row_index: number }) {
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
        <div style={{ padding: "0px 20px" }}>
          <CollapsibleTable inputBlocks={session.inputBlocks} />
        </div>

        <ChatInputAddSubmit
          roleOptions={ToastmastersRoleOptions}
          selectedValues={toastmastersEvaluators}
          updateParent={setToastmastersEvaluators}
          checkInput={checkInput}
          updateAutoScroll={setAutoScroll}
        />

        <ChatResponse
          scrollRef={scrollRef}
          toastmastersRolePrompts={toastmastersEvaluators}
        />
      </div>
    </div>
  );
}

const ChatInputAddSubmit = (props: {
  roleOptions: ToastmastersRolePrompt[];
  selectedValues: ToastmastersRolePrompt[];
  updateParent: (selectRoles: ToastmastersRolePrompt[]) => void;
  checkInput: () => InputSubmitStatus;
  updateAutoScroll: (status: boolean) => void;
}) => {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const roleSelectRef = useRef<Multiselect>(null);
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    props.updateAutoScroll(false);
    const newItem: InputBlock = {
      speaker: `Speaker${session.inputBlocks.length + 1}`,
      question: { text: "", time: 0 },
      speech: { text: "", time: 0 },
    };
    var newInputBlocks = [...session.inputBlocks, newItem];
    chatStore.updateCurrentSession(
      (session) => (session.inputBlocks = newInputBlocks),
    );
  };

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
    props.updateAutoScroll(true);

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
    <div className={styles_tm["chat-input-panel-buttons"]}>
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
        icon={<AddIcon />}
        text="Add Speaker"
        onClick={addItem}
        className={styles_tm["chat-input-button-add"]}
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
