import React, { useState } from "react";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // 向下箭头图标
import ExpandLessIcon from "@mui/icons-material/ExpandLess"; // 向上箭头图标
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepIcon from "@mui/material/StepIcon";
import Box from "@mui/material/Box";
import { BorderLine } from "./chat-common";

export function MuiStepper(props: { steps: string[]; activeStep: number }) {
  function StepIconWithCustomColor(stepIndex: number, activeStep: number) {
    return function StepIconProps(props: any) {
      const isCompleted = stepIndex < activeStep;
      const color = isCompleted ? "green" : "";

      return <StepIcon {...props} style={{ color }} />;
    };
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={props.activeStep} alternativeLabel>
        {props.steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={StepIconWithCustomColor(
                index,
                props.activeStep,
              )}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export function MuiCollapse(props: {
  title: string;
  children?:
    | Array<JSX.Element | null | undefined | boolean>
    | JSX.Element
    | null
    | undefined
    | boolean;
}) {
  const { title, children = null } = props;

  const [isExpanded, setIsExpanded] = useState(true);

  const toggleCollapse = () => {
    setIsExpanded((prevIsExpanded) => !prevIsExpanded);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginLeft: "0px" }}>
        <IconButton onClick={toggleCollapse} color="primary">
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <div onClick={toggleCollapse} style={{ cursor: "pointer", flex: "1" }}>
          <span>{title}</span>
        </div>
      </div>
      <Collapse in={isExpanded}>{children}</Collapse>
      <BorderLine />
    </>
  );
}
