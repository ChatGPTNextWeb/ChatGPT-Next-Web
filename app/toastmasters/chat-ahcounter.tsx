import React, { useState, useRef, useEffect } from "react";

import { useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import styles_toastmasters from "./toastmasters.module.scss";
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

export function Chat() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

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

    session.inputBlocks.forEach((element) => {
      let question = element.question.text.trim();
      let speech = element.speech.text.trim();
      if (question === "" || speech === "") {
        showToast("Question or Speech can not be empty");
        return new InputSubmitStatus(false, "");
      }

      var speakerInput: string = `
      {
        "Speaker": "${element.speaker}",
        "Question": "${element.question.text}",
        "Speech": "${element.speech.text}"
      }
      `;
      speakerInputs.push(speakerInput);
    });

    var speakerInputsString = speakerInputs.join(",\n");
    console.log(speakerInputsString);

    // Add a return statement for the case where the input is valid
    var guidance = ToastmastersRoleGuidance(speakerInputsString);
    console.log(guidance);
    return new InputSubmitStatus(true, guidance);
  };

  const addItem = () => {
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
          className={styles_toastmasters["table-border"]}
        >
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell
                align="left"
                className={styles_toastmasters["table-border-header"]}
              >
                Speaker
              </TableCell>
              <TableCell
                align="left"
                className={styles_toastmasters["table-border-header"]}
              >
                Question
              </TableCell>
              <TableCell
                align="left"
                className={styles_toastmasters["table-border-header"]}
              >
                Speech
              </TableCell>
              <TableCell
                align="left"
                className={styles_toastmasters["table-border-header"]}
              >
                SpeechWords
              </TableCell>
              <TableCell
                align="left"
                className={styles_toastmasters["table-border-header"]}
              >
                SpeechTime
              </TableCell>
              <TableCell
                align="left"
                className={styles_toastmasters["table-border-header"]}
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
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
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
              className={`${styles_toastmasters["chat-input-speaker"]}`}
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
            <div className={styles_toastmasters["chat-input-table-actions"]}>
              <IconButton
                icon={<CloseIcon />}
                onClick={() => deleteItem(row_index)}
              />
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
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
    <div className={styles.chat} key={session.id}>
      <ChatTitle></ChatTitle>
      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        onMouseDown={() => inputRef.current?.blur()}
        // onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <button
          onClick={addItem}
          className={styles_toastmasters["chat-input-add-button"]}
        >
          Add Speaker
        </button>

        <CollapsibleTable inputBlocks={session.inputBlocks} />

        <ChatInputSubmit
          roleOptions={ToastmastersRoleOptions}
          selectedValues={toastmastersEvaluators}
          updateParent={setToastmastersEvaluators}
          checkInput={checkInput}
        />

        <ChatResponse
          scrollRef={scrollRef}
          toastmastersRolePrompts={toastmastersEvaluators}
        />
      </div>
    </div>
  );
}
