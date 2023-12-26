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
  BorderLine,
} from "../toastmasters/chat-common";
import { useScrollToBottom } from "../components/chat";
import { useDebouncedCallback } from "use-debounce";
import { autoGrowTextArea } from "../utils";
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
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import StopCircleIcon from "@mui/icons-material/StopCircle";

import ReactMarkdown from "react-markdown";
import { LinearProgressWithLabel } from "../toastmasters/ISpeech-Common";
import { PlayCircleOutlineOutlined } from "@mui/icons-material";
import {
  AvatarDefaultLanguage,
  AzureAvatarLanguageVoices,
  AzureRoles,
} from "./AzureRoles";

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
  const [language, setLanguage] = useState(AvatarDefaultLanguage);
  const [voiceList, setVoiceList] = useState(
    AzureAvatarLanguageVoices[language],
  );
  const [voice, setVoice] = useState(voiceList[0]);
  const [tabValue, setTabValue] = React.useState("1");

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
    setVoiceList(AzureAvatarLanguageVoices[event.target.value]);
    setVoice(AzureAvatarLanguageVoices[event.target.value][0]);
  };
  const handleVoiceChange = (event: SelectChangeEvent) => {
    setVoice(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const getInputsString = (): string => {
    return "";
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
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src="lisa-casual-sitting-transparent-bg.png"
                alt="lisa-casual-sitting-transparent-background"
                width="80%"
              />
              <h4>Microsoft Azure AI Avatar</h4>
            </div>

            {/* <Box sx={{ typography: 'body1' }}>
              <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                    <Tab label="Avatar" value="1" />
                    <Tab label="Background" value="2" />
                  </TabList>
                </Box>
                <TabPanel value="1">Item One</TabPanel>
                <TabPanel value="2">Item Two</TabPanel>
              </TabContext>
            </Box> */}
          </div>
        </List>

        <Stack spacing={2} direction="row">
          <Button variant="contained" style={{ textTransform: "none" }}>
            Preview video
          </Button>
          <Button variant="outlined" style={{ textTransform: "none" }}>
            Export video
          </Button>
        </Stack>

        <div style={{ marginBottom: "20px" }}></div>

        <List>
          <Stack
            direction="row"
            spacing={2}
            style={{ marginTop: "10px", marginLeft: "10px" }}
          >
            <Button
              variant="outlined"
              startIcon={<PlayCircleOutlineOutlined />}
              style={{ textTransform: "none" }}
            >
              Play audio
            </Button>
            <Button
              variant="outlined"
              startIcon={<StopCircleIcon />}
              style={{ textTransform: "none" }}
            >
              Stop playing
            </Button>

            <FormControl sx={{ m: 1, minWidth: 180 }} size="small">
              <InputLabel sx={{ background: "white", paddingRight: "4px" }}>
                Language
              </InputLabel>
              <Select
                value={language}
                onChange={handleLanguageChange}
                autoWidth
              >
                {Object.keys(AzureAvatarLanguageVoices).map((key, index) => (
                  <MenuItem key={index} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel sx={{ background: "white", paddingRight: "4px" }}>
                Voice
              </InputLabel>
              <Select value={voice} onChange={handleVoiceChange} autoWidth>
                {voiceList.map((key, index) => (
                  <MenuItem key={index} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <BorderLine></BorderLine>
          <TextField
            label="Text"
            placeholder="Input Text"
            multiline
            sx={{
              width: "100%",
            }}
          />
        </List>
      </div>
    </div>
  );
}
