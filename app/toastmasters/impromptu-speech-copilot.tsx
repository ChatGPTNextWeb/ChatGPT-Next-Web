import React, { useState, useRef, useEffect, use } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useAppConfig, useChatStore } from "../store";

import styles_chat from "../components/chat.module.scss";
import styles_tm from "../toastmasters/toastmasters.module.scss";
import { List, ListItem, showPrompt, showToast } from "../components/ui-lib";
import { IconButton } from "../components/button";
import SendWhiteIcon from "../icons/send-white.svg";

import {
  InputSubmitStatus,
  ToastmastersRoles,
  speakersTimeRecord,
} from "./roles";

// import {
//   InterviewSelfServeFinalGuidance as InterviewGuidance,
//   InterviewSelfServeRecord as InterviewRecord,
// } from "./roles";

import {
  ChatTitle,
  ChatInput,
  ChatResponse,
  ChatUtility,
  ChatSubmitRadiobox,
  BorderLine,
} from "./chat-common";
import { InputTableRow } from "../store/chat";

import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import MenuIcon from "../icons/menu.svg";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButtonMui from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { EN_MASKS } from "../masks/en";
import { Mask } from "../store/mask";
import { useScrollToBottom } from "../components/chat";
import { MuiCollapse, MuiStepper } from "./chat-common-mui";
import { ImpromptuSpeechV2 } from "./impromptu-v2";
import { ImpromptuSpeechV3 } from "./impromptu-v3";
import { ImpromptuSpeechV4 } from "./impromptu-v4";
import styles from "./impromptu-v2.module.scss";
import { ImpromptuSpeech } from "./impromptu-speech";

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

  // TODO: save selected job
  const config = useAppConfig();
  const [jobDescription, setJobDescription] = useState("");

  const checkInput = (): InputSubmitStatus => {
    if (session.input.datas.length === 0) {
      showToast(`Input Table is empty, please check`);
      return new InputSubmitStatus(false, "");
    }

    const isAllValid = session.input.datas.every((row) => {
      let question = row.question.text.trim();
      let speech = row.speech.text.trim();
      if (question === "" || speech === "") {
        showToast(`${row.speaker}: Question or Speech is empty, please check`);
        return false;
      }
      return true;
    });

    if (!isAllValid) {
      return new InputSubmitStatus(false, "");
    }

    // var guidance = InterviewGuidance(getInputsString());
    var guidance = "";
    return new InputSubmitStatus(true, guidance);
  };

  const getInputsString = (): string => {
    // inputTable
    const speakerInputs = session.input.datas?.map((row) => ({
      Number: row.speaker,
      Question: row.question.text,
      Answer: row.speech.text,
    }));
    // 4 是可选的缩进参数，它表示每一层嵌套的缩进空格数
    const speakerInputsString = JSON.stringify(speakerInputs, null, 4);
    return speakerInputsString;
  };

  return (
    <div className={styles_chat.chat} key={session.id}>
      <ChatTitle getInputsString={getInputsString}></ChatTitle>
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
        <List>
          <ListItem title="Topic Theme">
            <textarea
              ref={inputRef}
              className={styles_chat["chat-input"]}
              placeholder={"Enter To wrap"}
              onInput={(e) => setJobDescription(e.currentTarget.value)}
              value={jobDescription}
              rows={1}
              style={{
                fontSize: config.fontSize,
              }}
            />
          </ListItem>
          <ListItem title="">
            <IconButton
              icon={<SendWhiteIcon />}
              text={"Submit"}
              className={styles_tm["chat-input-button-submit"]}
              // onClick={doSubmit}
            />
          </ListItem>
        </List>

        <ImpromptuSpeech></ImpromptuSpeech>

        {/* <BorderLine></BorderLine>
        <List>
          <ImpromptuSpeechV2></ImpromptuSpeechV2>
        </List>
        <List>
          <ImpromptuSpeechV3></ImpromptuSpeechV3>
        </List> */}
        {/* <List>
          <ImpromptuSpeechV4></ImpromptuSpeechV4>
        </List> */}
      </div>
    </div>
  );
}
