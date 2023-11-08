import React, { useState, useRef, useEffect, use } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store";

import styles_chat from "../components/chat.module.scss";
import styles_tm from "./toastmasters.module.scss";
import { List, showPrompt, showToast } from "../components/ui-lib";
import { IconButton } from "../components/button";

import {
  TimerGuidance as ToastmastersRoleGuidance,
  TimerRecord as ToastmastersRecord,
  InputSubmitStatus,
  ToastmastersRoles,
  speakersTimeRecord,
} from "./roles";
import {
  ChatTitle,
  ChatInput,
  ChatResponse,
  ChatUtility,
  ChatSubmitRadiobox,
  BorderLine,
} from "./chat-common";
import { ILightsTime, InputTableRow } from "../store/chat";

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
import { SpeechAvatarVideoShow } from "../cognitive/speech-avatar";
import { EN_MASKS } from "../masks/en";
import { Mask } from "../store/mask";
import { useScrollToBottom } from "../components/chat";

import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import MuiList from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Avatar from "@mui/material/Avatar";
import { MuiCollapse, MuiStepper } from "./chat-common-mui";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

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
    if (session.input.datas.length === 0) {
      showToast(`Input Table is empty, please check`);
      return new InputSubmitStatus(false, "");
    }

    const isAllValid = session.input.datas.every((row) => {
      let speech = row.speech.text.trim();
      if (speech === "") {
        showToast(`${row.speaker}: Speech is empty, please check`);
        return false;
      }
      return true;
    });

    if (!isAllValid) {
      return new InputSubmitStatus(false, "");
    }

    var guidance = ToastmastersRoleGuidance(getInputsString());
    return new InputSubmitStatus(true, guidance);
  };

  const getInputsString = (): string => {
    // inputTable
    const speakerInputs = session.input.datas?.map((row) => ({
      Speaker: row.speaker,
      SpeechTime: ChatUtility.formatTime(row.speech.time),
      ExpectTime: {
        GreenTime: ChatUtility.formatTimeMinutes(row.speech.timeExpect.Green),
        YellowTime: ChatUtility.formatTimeMinutes(row.speech.timeExpect.Yellow),
        RedTime: ChatUtility.formatTimeMinutes(row.speech.timeExpect.Red),
        MaxTime: ChatUtility.formatTimeMinutes(row.speech.timeExpect.Red + 0.5),
      },
    }));
    // 4 是可选的缩进参数，它表示每一层嵌套的缩进空格数
    const speakerInputsString = JSON.stringify(speakerInputs, null, 4);
    return speakerInputsString;
  };

  const addItem = (role: string, timeExpect: ILightsTime) => {
    setAutoScroll(false);
    const newItem = new InputTableRow();
    newItem.speaker = `Speaker${session.input.datas.length + 1}`;
    newItem.speech.role = role.split("(")[0]; // only keep prefix
    newItem.speech.timeExpect = timeExpect;

    var newInputBlocks = [...session.input.datas, newItem];
    chatStore.updateCurrentSession(
      (session) => (
        (session.input.datas = newInputBlocks), (session.input.activeStep = 1)
      ),
    );
  };

  const [anchorState, setAnchorState] = React.useState(false);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setAnchorState(open);
    };

  const TimerSidebar = () => {
    const [timeRole, setTimeRole] = React.useState("");
    const [colorGreenTime, setColorGreenTime] = React.useState(0);
    const [colorYellowTime, setColorYellowTime] = React.useState(0);
    const [colorRedTime, setColorRedTime] = React.useState(0);

    const onInputRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectRole = (event.target as HTMLInputElement).value;
      setTimeRole(selectRole);
      setColorGreenTime(speakersTimeRecord[selectRole].Green);
      setColorYellowTime(speakersTimeRecord[selectRole].Yellow);
      setColorRedTime(speakersTimeRecord[selectRole].Red);
    };

    return (
      <div className={styles_tm["chat-input-panel-buttons-column"]}>
        <Box sx={{ width: 350 }}>
          <List>
            <FormLabel>Roles</FormLabel>
            <RadioGroup name="speaker-roles-group" onChange={onInputRoleChange}>
              {Object.keys(speakersTimeRecord).map((role) => {
                return (
                  <FormControlLabel
                    key={role}
                    value={role}
                    control={<Radio />}
                    label={role}
                    className={styles_tm["item-radio-button"]}
                  />
                );
              })}
            </RadioGroup>
          </List>

          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Green" />
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={colorYellowTime}
                  value={colorGreenTime}
                  style={{ width: "30%" }}
                  onChange={(e) =>
                    setColorGreenTime(parseFloat(e.target.value))
                  }
                ></input>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Yellow" />
                <input
                  type="number"
                  step={0.1}
                  min={colorGreenTime}
                  max={colorRedTime}
                  value={colorYellowTime}
                  style={{ width: "30%" }}
                  onChange={(e) =>
                    setColorYellowTime(parseFloat(e.target.value))
                  }
                ></input>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Red" />
                <input
                  type="number"
                  step={0.1}
                  min={colorYellowTime}
                  value={colorRedTime}
                  style={{ width: "30%" }}
                  onChange={(e) => setColorRedTime(parseFloat(e.target.value))}
                ></input>
              </ListItemButton>
            </ListItem>
          </List>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton
              icon={<AddIcon />}
              text="Add Speaker"
              bordered
              onClick={() =>
                addItem(timeRole, {
                  Green: colorGreenTime,
                  Yellow: colorYellowTime,
                  Red: colorRedTime,
                })
              }
              className={styles_tm["chat-input-button-add"]}
            />
          </div>
        </Box>
      </div>
    );
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
        <MuiCollapse title="Introduction" topBorderLine={false}>
          <Typography
            sx={{ mt: 1, mb: 1, marginLeft: "40px", marginBottom: "20px" }}
          >
            Timer aims to improve time management skills for speakers. See{" "}
            <Link href="https://www.toastmasters.org/membership/club-meeting-roles/timer">
              More Info.{" "}
            </Link>
            <br />
            Here is the general flow.
          </Typography>
          <MuiStepper
            steps={[
              "Add Speaker",
              "Select Evaluator",
              "Generate Evaluation",
              "Display Evaluation",
            ]}
            activeStep={session.input.activeStep}
          />
        </MuiCollapse>
        <BorderLine />

        <div className={styles_tm["chat-input-button-add-row"]}>
          <React.Fragment>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={toggleDrawer(true)}
              style={{ textTransform: "none" }}
            >
              {"Add Speaker"}
            </Button>
            <Drawer
              anchor={"left"}
              open={anchorState}
              onClose={toggleDrawer(false)}
            >
              {<TimerSidebar></TimerSidebar>}
            </Drawer>
          </React.Fragment>
        </div>
        {session.input.datas.length > 0 && (
          <>
            <div style={{ padding: "0px 20px" }}>
              <ChatTable />
            </div>
            <ChatSubmitRadiobox
              toastmastersRecord={ToastmastersRecord}
              checkInput={checkInput}
              updateAutoScroll={setAutoScroll}
            />
          </>
        )}
        {/* 3 is the predifined message length */}
        {session.input.roles.length > 0 && (
          <ChatResponse
            scrollRef={scrollRef}
            toastmastersRecord={ToastmastersRecord}
          />
        )}
      </div>
    </div>
  );
}

function ChatTable() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  // TODO: deleteItem执行时, speakerInputsString 并未及时变化, 导致Export结果又不对
  // 此时需要刷新页面, 才能看到正确的结果
  const deleteItem = (row_index: number) => {
    chatStore.updateCurrentSession((session) =>
      session.input.datas.splice(row_index, 1),
    );
  };

  const renameSpeaker = (row: InputTableRow) => {
    showPrompt("Rename", row.speaker).then((newName) => {
      if (newName && newName !== row.speaker) {
        chatStore.updateCurrentSession((session) => (row.speaker = newName));
      }
    });
  };

  function Row(props: { row: InputTableRow; row_index: number }) {
    const { row, row_index } = props;
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    const onDetailClick = () => {
      const mask = EN_MASKS.find(
        (mask) => mask.name === ToastmastersRoles.TableTopicsEvaluator,
      ) as Mask;

      chatStore.newSession(mask);
      navigate(mask.pagePath as any);

      // new session has index 0
      chatStore.updateSession(0, (session) => {
        session.topic = row.speaker;
        session.input.data.question = { ...row.question };
        session.input.data.speech = { ...row.speech };
        return session;
      });
    };

    function getActiveStep(speechTime: number, timeExpect: ILightsTime) {
      // speechTime is seconeds, timeExpect is minutes
      if (row.speech.time >= row.speech.timeExpect.Red * 60) return 3;
      else if (row.speech.time >= row.speech.timeExpect.Yellow * 60) return 2;
      else if (row.speech.time >= row.speech.timeExpect.Green * 60) return 1;
      return 0;
    }

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
          <TableCell align="left">{row.speech.role}</TableCell>
          {/* <TableCell align="left">
            {ChatUtility.getFirstNWords(row.question.text, 10)}
          </TableCell> */}
          <TableCell align="left">
            {ChatUtility.getFirstNWords(row.speech.text, 10)}
          </TableCell>
          <TableCell align="left">
            {ChatUtility.formatTime(row.speech.time)}
          </TableCell>
          {/* <TableCell align="left">
            <MuiStepper
              steps={[
                `${row.speech.timeExpect.Green}`,
                `${row.speech.timeExpect.Yellow}`,
                `${row.speech.timeExpect.Red}`
              ]}
              activeStep={getActiveStep(row.speech.time, row.speech.timeExpect)}
            />
          </TableCell> */}

          <TableCell align="left">
            <FormControlLabel
              control={
                <Checkbox
                  checked={row.speech.time >= row.speech.timeExpect.Green * 60}
                />
              }
              label={row.speech.timeExpect.Green}
            />
          </TableCell>
          <TableCell align="left">
            <FormControlLabel
              control={
                <Checkbox
                  checked={row.speech.time >= row.speech.timeExpect.Yellow * 60}
                />
              }
              label={row.speech.timeExpect.Yellow}
            />
          </TableCell>
          <TableCell align="left">
            <FormControlLabel
              control={
                <Checkbox
                  checked={row.speech.time >= row.speech.timeExpect.Red * 60}
                />
              }
              label={row.speech.timeExpect.Red}
            />
          </TableCell>
          <TableCell align="left">
            <div className={styles_tm["table-actions"]}>
              <IconButton
                icon={<CloseIcon />}
                onClick={() => deleteItem(row_index)}
              />
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <List>
                  {/* <ChatInput title="Question" inputStore={row.question} /> */}
                  <ChatInput
                    title="Speech"
                    inputStore={row.speech}
                    showTime={true}
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
            <TableCell
              align="left"
              className={styles_tm["table-header"]}
              style={{ width: "10px" }}
            >
              Role
            </TableCell>
            {/* <TableCell align="left" className={styles_tm["table-header"]}>
              Question
            </TableCell> */}
            <TableCell align="left" className={styles_tm["table-header"]}>
              Speech
            </TableCell>
            <TableCell
              align="left"
              className={styles_tm["table-header"]}
              style={{ width: "10px" }}
            >
              SpeechTime
            </TableCell>
            {/* <TableCell
              align="center"
              className={styles_tm["table-header"]}
              style={{ width: "50px" }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" width="50px">
                <Avatar
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    width: 26,
                    height: 26,
                  }}
                >
                  G
                </Avatar>
                <Avatar
                  style={{
                    backgroundColor: "yellow",
                    color: "gray",
                    width: 26,
                    height: 26,
                  }}
                >
                  Y
                </Avatar>
                <Avatar
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    width: 26,
                    height: 26,
                  }}
                >
                  R
                </Avatar>
              </Box>
            </TableCell> */}

            <TableCell
              align="left"
              className={styles_tm["table-header"]}
              style={{ width: "5px" }}
            >
              <Avatar
                style={{
                  backgroundColor: "green",
                  color: "white",
                  width: 26,
                  height: 26,
                }}
              >
                G
              </Avatar>
            </TableCell>
            <TableCell
              align="left"
              className={styles_tm["table-header"]}
              style={{ width: "5px" }}
            >
              <Avatar
                style={{
                  backgroundColor: "yellow",
                  color: "gray",
                  width: 26,
                  height: 26,
                }}
              >
                Y
              </Avatar>
            </TableCell>
            <TableCell
              align="left"
              className={styles_tm["table-header"]}
              style={{ width: "5px" }}
            >
              <Avatar
                style={{
                  backgroundColor: "red",
                  color: "white",
                  width: 26,
                  height: 26,
                }}
              >
                R
              </Avatar>
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
          {session.input.datas.map((row, index) => (
            <Row key={index} row={row} row_index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
