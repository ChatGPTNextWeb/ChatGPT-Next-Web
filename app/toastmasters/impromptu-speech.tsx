import React, { useState, useEffect } from "react";
import styles from "./impromptu-speech.module.scss";

import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Button from "@mui/joy/Button";
import ButtonGroup from "@mui/joy/ButtonGroup";
import Settings from "@mui/icons-material/Settings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import MicIcon from "@mui/icons-material/Mic";
import SixtyFpsOutlinedIcon from "@mui/icons-material/SixtyFpsOutlined";
import { green } from "@mui/material/colors";
import { BorderLine } from "./chat-common";
// import { ListItem } from '../components/ui-lib';
// import React, { useState } from 'react';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { ImpromptuSpeechV5Collapse } from "./impromptu-v5-collapse";

export const ImpromptuSpeech: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(120); // assuming the timer starts with 2 minutes
  const [userResponse, setUserResponse] = useState("");

  useEffect(() => {
    const timer =
      timeLeft > 0 && setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer as NodeJS.Timeout);
  }, [timeLeft]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Implement your submit logic here
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserResponse(event.target.value);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <button className={styles.navButton}> ← Restart</button>
        <ButtonGroup
          aria-label="radius button group"
          sx={{ "--ButtonGroup-radius": "40px" }}
        >
          <Button>{"<"}</Button>
          <Button>Question 1 / 5</Button>
          <Button>{">"}</Button>
        </ButtonGroup>

        <button
          className={styles.capsuleButton}
          // onClick={onClick}
        >
          {/* <span className={styles.capsuleLeft}>{"<"}</span> */}
          End & Review
          {/* <span className={styles.capsuleRight}>{">"}</span> */}
        </button>

        {/* <div className={styles.questionNav}>
          <button className={styles.navButton}>Question 1</button>
          <button className={styles.navButton}>End & Review</button>
        </div> */}
      </div>

      <BorderLine></BorderLine>

      <form onSubmit={handleSubmit}>
        <p className={styles.questionText}>
          Can you provide an example of a time when you had to prioritize
          features and tasks for product development based on business and
          customer impact?
        </p>
        <div className={styles.timer}>
          <span>
            Speech: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {formatTime(timeLeft)}{" "}
            / 2:00
          </span>
        </div>
        <Stack
          direction="row"
          spacing={5}
          justifyContent="center"
          alignItems="center"
        >
          <IconButton aria-label="play">
            <PlayCircleIcon />
          </IconButton>
          <IconButton
            aria-label="record"
            color="primary"
            sx={{ color: green[500], fontSize: "40px" }}
          >
            <MicIcon sx={{ fontSize: "inherit" }} />
          </IconButton>
          <IconButton color="secondary" aria-label="score">
            <SixtyFpsOutlinedIcon />
          </IconButton>
        </Stack>
      </form>

      <ImpromptuSpeechV5Collapse></ImpromptuSpeechV5Collapse>
    </div>
  );
};
