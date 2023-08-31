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
} from "./chat-common";
import { InputBlock } from "../store/chat";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import RenameIcon from "../icons/rename.svg";

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

  const [inputBlocks, setInputBlocks] = useState<InputBlock[]>([]);

  // 进来时, 读取上次的输入
  useEffect(() => {
    var roles = session.inputs.roles?.map(
      (index: number) => ToastmastersRoleOptions[index],
    );
    setToastmastersEvaluators(roles);

    setInputBlocks(session.inputBlocks ?? []);
  }, []);

  // 每次输入变化时, 保存输入
  // useEffect(() => {
  //   session.inputBlocks = inputBlocks;
  // }, [inputBlocks, session]);

  const checkInput = (): InputSubmitStatus => {
    var speakerInputs: string[] = [];

    inputBlocks.forEach((element) => {
      let question = element.input.text.trim();
      let speech = element.input2.text.trim();
      if (question === "" || speech === "") {
        showToast("Question or Speech can not be empty");
        return new InputSubmitStatus(false, "");
      }

      var speakerInput: string = `
      {
        "Speaker": "${element.name}",
        "Question": "${element.input.text}",
        "Speech": "${element.input2.text}"
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
      key: inputBlocks.length + 1,
      name: `Speaker${inputBlocks.length + 1}`,
      input: { text: "", time: 0 },
      input2: { text: "", time: 0 },
    };
    var newInputBlocks = [...inputBlocks, newItem];
    setInputBlocks(newInputBlocks);

    chatStore.updateCurrentSession(
      (session) => (session.inputBlocks = newInputBlocks),
    );
  };
  const deleteItem = (key: number) => {
    const updatedItems = inputBlocks.filter((item) => item.key !== key);
    setInputBlocks(updatedItems);
    session.inputBlocks = inputBlocks;
  };
  const renameSpeaker = (row: InputBlock) => {
    showPrompt("Rename", row.name).then((newName) => {
      if (newName && newName !== row.name) {
        chatStore.updateCurrentSession((session) => (row.name = newName));
      }
    });
  };

  const getSpeaker = (item: InputBlock): string => {
    if (item.name === undefined) {
      item.name = `Speaker ${item.key}`;
    }
    return item.name;
  };

  function CollapsibleTable(props: { inputBlocks: InputBlock[] }) {
    return (
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell align="right">Question</TableCell>
              <TableCell align="right">Speech</TableCell>
              <TableCell align="right">SpeechWords</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.inputBlocks.map((row, index) => (
              <Row key={row.key} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  function Row(props: { row: InputBlock }) {
    const { row } = props;
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
              {row.name}
            </div>
          </TableCell>
          {/* TODO: take 1st 10 words */}
          <TableCell align="right">
            {row.input.text.substring(0, 10)}...
          </TableCell>
          <TableCell align="right">
            {row.input2.text.substring(0, 10)}...
          </TableCell>
          <TableCell align="right">{"TODO"}</TableCell>
          <TableCell align="right">
            <div className={styles_toastmasters["chat-input-table-actions"]}>
              <IconButton
                icon={<CloseIcon />}
                onClick={() => deleteItem(row.key)}
              />
              <IconButton icon={<DownloadIcon />} onClick={() => {}} />
              <IconButton icon={<UploadIcon />} onClick={() => {}} />
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <List>
                  <ChatInput title="Question" inputStore={row.input} />
                  <ChatInput
                    title="Table Topics Speech"
                    inputStore={row.input2}
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
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
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
