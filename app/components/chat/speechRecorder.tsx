import React, { useState, useEffect } from "react";

type SpeechRecognitionType =
  | typeof window.SpeechRecognition
  | typeof window.webkitSpeechRecognition;

export default function SpeechRecorder({
  textUpdater,
  onStop,
}: {
  textUpdater: (text: string) => void;
  onStop?: () => void;
}) {
  const [speechRecognition, setSpeechRecognition] =
    useState<SpeechRecognitionType | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  useEffect(() => {
    if ("SpeechRecognition" in window) {
      setSpeechRecognition(new (window as any).SpeechRecognition());
    } else if ("webkitSpeechRecognition" in window) {
      setSpeechRecognition(new (window as any).webkitSpeechRecognition());
    }
  }, []);
  return (
    <div>
      <button
        onClick={() => {
          if (!isRecording && speechRecognition) {
            speechRecognition.continuous = true; // 连续识别
            speechRecognition.lang = "zh-CN"; // 设置识别的语言为中文
            speechRecognition.interimResults = true; // 返回临时结果
            speechRecognition.start();
            speechRecognition.onresult = function (event: any) {
              console.log(event);
              var transcript = event.results[0][0].transcript; // 获取识别结果
              console.log(transcript);
              textUpdater(transcript);
            };
            setIsRecording(true);
          } else {
            speechRecognition.stop();
            setIsRecording(false);
          }
        }}
      >
        {isRecording ? "输入中" : "点击说话"}
      </button>
    </div>
  );
}
