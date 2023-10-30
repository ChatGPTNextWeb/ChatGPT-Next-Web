import React, { useState } from "react";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // 向下箭头图标
import ExpandLessIcon from "@mui/icons-material/ExpandLess"; // 向上箭头图标
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepIcon from "@mui/material/StepIcon";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { useChatStore } from "../store";

export function ChatIntroduction(props: {
  introduction: string;
  steps: string[];
}) {
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleCollapse = () => {
    setIsExpanded((prevIsExpanded) => !prevIsExpanded);
  };

  function StepIconWithCustomColor(stepIndex: number, activeStep: number) {
    return function StepIconProps(props: any) {
      const isCompleted = stepIndex < activeStep;
      const color = isCompleted ? "green" : "";

      return <StepIcon {...props} style={{ color }} />;
    };
  }

  return (
    <>
      <div
        style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}
      >
        <IconButton onClick={toggleCollapse} color="primary">
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <div onClick={toggleCollapse} style={{ cursor: "pointer", flex: "1" }}>
          <span>Introduction</span>
        </div>
      </div>
      <Collapse in={isExpanded}>
        <Typography
          sx={{ mt: 1, mb: 1, marginLeft: "60px", marginBottom: "20px" }}
        >
          {props.introduction}
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Stepper activeStep={session.input.activeStep} alternativeLabel>
            {props.steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={StepIconWithCustomColor(
                    index,
                    session.input.activeStep,
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Collapse>
    </>
  );
}
