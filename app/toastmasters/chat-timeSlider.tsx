import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

import { ChatUtility } from "./chat-common";

export function TimeSlider(props: { time: number }) {
  const centerContainerStyle = {
    display: "flex",
    flexDirection: "column" as const, // 使用 'column' 来确保类型匹配
    justifyContent: "center", // 水平居中
    alignItems: "center", // 垂直居中
    width: "100%", // 使容器占满可用宽度
    marginTop: "20px", // 设置子组件距离上边缘的距离
  };

  const maxValue = 180;
  const orderedDict = [
    { label: "G", value: 60, color: "green" },
    { label: "Y", value: 90, color: "yellow" },
    { label: "R", value: 120, color: "red" },
    { label: "Over", value: 150, color: "brown" },
  ];

  const sliderColor = () => {
    for (let i = orderedDict.length - 1; i >= 0; i--) {
      const item = orderedDict[i];

      if (props.time >= item.value) return item.color;
    }

    return "";
  };

  const marks: { value: number; label: string }[] = [];
  orderedDict.forEach((d) => {
    const value = d.value;
    const label = d.label + ":" + ChatUtility.formatTime(d.value);
    marks.push({ value, label });
  });

  return (
    <div style={centerContainerStyle}>
      <div>Speech Time </div>
      <Box sx={{ width: "80%" }}>
        <Slider
          aria-label="Always visible"
          value={props.time}
          getAriaValueText={ChatUtility.formatTime}
          valueLabelFormat={ChatUtility.formatTime}
          step={1}
          marks={marks}
          valueLabelDisplay="on"
          size="medium"
          max={maxValue}
          sx={{
            fontSize: "100px", // 在这里设置字体大小
            color: sliderColor,
          }}
        />
        {/* {
          orderedDict.map((d) => (
            props.time >= d.value && (
              <IconButton key={d.label} color="primary">
                <LightbulbIcon />
              </IconButton>
            )
          ))
        } */}
      </Box>
    </div>
  );
}

export const ChatTimeShow = (props: { time: number }) => {
  const centerContainerStyle = {
    display: "flex",
    justifyContent: "center", // 水平居中
    alignItems: "center", // 垂直居中
    width: "100%", // 使容器占满可用宽度
  };

  const centerStyle = {
    fontSize: "40px", // 设置字体大小为40像素
  };

  return (
    <div style={centerContainerStyle}>
      <div style={centerStyle}>{ChatUtility.formatTime(props.time)}</div>
    </div>
  );
};
