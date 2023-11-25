import React from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  IQuestionItem,
  ImpromptuSpeechInput,
  ImpromptuSpeechStage,
} from "./ISpeechRoles";
import { useChatStore } from "../store";

// Define a type for the props expected by the RehearsalReportCard component
type RehearsalReportCardProps = {
  title: string;
  children: React.ReactNode;
};

function RehearsalReportCard({ title, children }: RehearsalReportCardProps) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function RehearsalReport(props: {
  impromptuSpeechInput: ImpromptuSpeechInput;
}) {
  const questionItems = props.impromptuSpeechInput.QuestionItems;

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const formatXAxis = (tickItem: string, index: number) => {
    return `Q${index + 1}`;
  };

  const onReturn = () => {
    chatStore.updateCurrentSession(
      (session) =>
        (props.impromptuSpeechInput.ActivePage = ImpromptuSpeechStage.Question),
    );
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Impromptu Speech Report
      </Typography>

      {/* Summary Card */}
      <RehearsalReportCard title="Summary">
        <CardContent>
          <Typography variant="h5" component="div">
            Good job rehearsing! Keep up the hard work.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Typography variant="h6" color="text.primary">
              0:23
            </Typography>
            <Typography variant="h6" color="text.primary">
              5 / 5
            </Typography>
            <Typography variant="h6" color="text.primary">
              80
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary">TotalTime</Typography>
            <Typography color="text.secondary">Questions</Typography>
            <Typography color="text.secondary">AverageScore</Typography>
          </Box>
        </CardContent>
      </RehearsalReportCard>

      {/* Bar Card */}
      <RehearsalReportCard title="Average">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            width={500}
            height={300}
            data={questionItems}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis tickFormatter={formatXAxis} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="SpeechTime"
              fill="#8884d8"
              name="SpeechTime"
            >
              <LabelList dataKey="SpeechTime" position="top" />
            </Bar>
            <Bar yAxisId="right" dataKey="Score" fill="#82ca9d" name="Score">
              <LabelList dataKey="Score" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </RehearsalReportCard>

      {/* Evaluation Card */}
      <RehearsalReportCard title="Evaluation">
        <Typography variant="body1">
          To sound more polished and confident, try to avoid using filler words.
          Pause or take a breath to relax. Some filler words to avoid are:
        </Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          umm
        </Typography>
      </RehearsalReportCard>

      <Button variant="contained" sx={{ mt: 3 }} onClick={onReturn}>
        Rehearse Again
      </Button>
    </Box>
  );
}

export default RehearsalReport;
