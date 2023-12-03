import * as React from "react";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";

import { PieChart, Pie, Cell } from "recharts";

export function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number },
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function GaugeChart(props: {
  data: { name: string; value: number; color: string }[];
  // width: number,
  // height: number,
  outerRadius: number;
  value: number;
  unit: string;
  title: string;
}) {
  // const {data, width, height, outerRadius, value, unit, title} = props;
  const { data, outerRadius, value, unit, title } = props;

  const width = outerRadius * 3;
  const height = outerRadius * 4;

  const cx = width / 2;
  const cy = height / 2;
  const innerRadius = outerRadius - 20;
  const RADIAN = Math.PI / 180;
  const total: number = data.reduce((sum, current) => sum + current.value, 0);

  const needle = () => {
    const ang = 180.0 * (1 - value / total);
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 5;
    const x0 = cx + 5;
    const y0 = cy + 5;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + outerRadius * cos;
    const yp = y0 + outerRadius * sin;

    return [
      // <circle cx={x0} cy={y0} r={r} fill={'#d0d000'} stroke="none" key={`${x0}-${y0}`}/>,
      <path
        d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
        stroke="#none"
        fill={"#d0d000"}
        key={`${x0}-${y0}`}
      />,
    ];
  };

  const renderCustomLabel = ({
    startAngle,
    payload,
  }: {
    startAngle: number;
    payload: { name: string };
  }) => {
    const radius = outerRadius + 5; // 将标签放置在外半径之外
    // 使用 startAngle 而不是 midAngle 来定位文本
    const x = cx + radius * Math.cos(-RADIAN * startAngle);
    const y = cy + radius * Math.sin(-RADIAN * startAngle);

    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {payload.name}
      </text>
    );
  };

  const renderCenterText = () => {
    return (
      <g>
        <text
          x={cx}
          y={cy - 30}
          fill="black"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="30px"
        >
          {value}
        </text>
        <text
          x={cx}
          y={cy}
          fill="black"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {unit}
        </text>
        <text
          x={cx}
          y={cy + 30}
          fill="black"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="20px"
        >
          {title}
        </text>
      </g>
    );
  };

  return (
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        cx={cx}
        cy={cy}
        startAngle={180}
        endAngle={0}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        fill="#8884d8"
        paddingAngle={2}
        dataKey="value"
        labelLine={false}
        label={renderCustomLabel}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      {needle()}
      {renderCenterText()}
    </PieChart>
  );
}
