import React, { useState, useEffect } from "react";
import {} from "./Notification";

interface BrowserSpeechToTextProps {
  isListening: boolean;
  language: string;
  Transcript: string;
  setIsListening: (
    update: ((prevIsListening: boolean) => boolean) | boolean,
  ) => void;
  setTranscript: (
    update: ((prevTranscript: string) => string) | string,
  ) => void;
}

const SpeechRecognition =
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) &&
  ((window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition);

const globalRecognition = SpeechRecognition ? new SpeechRecognition() : null;

const BrowserSpeechToText: React.FC<BrowserSpeechToTextProps> = ({
  isListening,
  language,
  setIsListening,
  Transcript,
  setTranscript,
}) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    globalRecognition,
  );

  useEffect(() => {
    if (recognition) {
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.lang = language;
      //let currentTranscript = Transcript;
      let temp = Transcript;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = Transcript; // 使用既有的 Transcript
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            temp += text;
            setTranscript(temp); // 更新 Transcript
          } else {
            currentTranscript += text;
          }
        }
      };

      // @ts-ignore
      recognition.onerror = (event: SpeechRecognitionError) => {
        console.log("Error:", event.error);
        //notify.errorBuiltinSpeechRecognitionNotify();
        setIsListening(false);
      };
    } else {
      console.log("SpeechRecognition API is not supported in this browser");
      //notify.errorBuiltinSpeechRecognitionNotify();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, language, recognition]);

  useEffect(() => {
    if (isListening) {
      if (recognition) {
        recognition.start();
      }
    } else {
      if (recognition) {
        recognition.stop();
      }
    }
  }, [isListening, recognition]);

  return null;
};

export default BrowserSpeechToText;
