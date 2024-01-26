import { useChatStore } from "@/app/store";
import style from "./voice.module.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { IconButton } from "../button";
import { api } from "@/app/client/api";

function findLast<T>(array: T[], predictor: (_: T) => boolean) {
  for (let i = array.length - 1; i >= 0; i -= 1) {
    if (predictor(array[i])) {
      return array[i];
    }
  }

  return null;
}

export function VoicePage() {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const lastAssistantMessage = useMemo(
    () => findLast(session.messages, (m) => m.role === "assistant"),
    [session.messages],
  );
  const lastUserMessage = useMemo(
    () => findLast(session.messages, (m) => m.role === "user"),
    [session.messages],
  );
  const speech = useSpeechRecognition({
    clearTranscriptOnListen: true,
  });

  if (!speech.browserSupportsSpeechRecognition) {
    throw Error("your browser does not support speech recognition api");
  }

  function startVoice() {
    SpeechRecognition.startListening({
      language: "zh-CN",
    });
    sourceNodeRef.current?.stop();
  }

  function stopVoice() {
    SpeechRecognition.stopListening();
  }

  useEffect(() => {
    if (!speech.listening) {
      if (
        speech.finalTranscript.length > 0 &&
        speech.finalTranscript !== lastUserMessage?.content
      ) {
        chatStore.onUserInput(speech.finalTranscript);
      }
    }
  }, [speech.listening]);

  const [loadingTTS, setLoadingTTS] = useState(false);
  const sourceNodeRef = useRef<AudioBufferSourceNode>();

  function speak() {
    const content = lastAssistantMessage?.content;
    if (!content) return;
    setLoadingTTS(true);
    api.llm.speech(content).then(async (arrayBuffer) => {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      try {
        sourceNodeRef.current?.stop();
      } catch {}
      sourceNodeRef.current = source;
      // 设置音频源的 buffer 属性
      source.buffer = await audioContext.decodeAudioData(arrayBuffer);
      // 连接到默认的输出设备（通常是扬声器）
      source.connect(audioContext.destination);
      // 开始播放
      setLoadingTTS(false);
      source.start(0);
    });
  }

  const lastStream = useRef(false);
  useEffect(() => {
    if (
      lastAssistantMessage?.streaming !== lastStream.current &&
      lastStream.current
    ) {
      speak();
    }
    lastStream.current = !!lastAssistantMessage?.streaming;
  }, [lastAssistantMessage?.streaming]);

  return (
    <div className={style["voice-page"]}>
      <div className={style["top"] + ` ${style["active"]}`} onClick={speak}>
        {lastAssistantMessage?.content}
      </div>
      <div className={style["center"]}></div>
      <div
        className={style["bottom"] + ` ${speech.listening && style["active"]}`}
        onClick={() => {
          if (speech.listening) {
            stopVoice();
          } else {
            startVoice();
          }
        }}
      >
        {speech.transcript || lastUserMessage?.content}
      </div>
    </div>
  );
}
