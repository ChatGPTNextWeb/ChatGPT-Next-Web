import React, { useState, useEffect } from "react";
import VoiceIcon from "@/app/icons/voice.svg";
import { getLang, formatLang } from "@/app/locales";
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
    <>
      {speechRecognition && (
        <div>
          <button
            onClick={() => {
              if (!isRecording && speechRecognition) {
                speechRecognition.continuous = true;
                speechRecognition.lang = formatLang(getLang());
                console.log(speechRecognition.lang);
                speechRecognition.interimResults = true;
                speechRecognition.start();
                speechRecognition.onresult = function (event: any) {
                  console.log(event);
                  var transcript = event.results[0][0].transcript;
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
            {isRecording ? (
              <button className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 ring-4 ring-blue-200 transition animate-pulse">
                <VoiceIcon fill={"white"} />
              </button>
            ) : (
              <button className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
                <VoiceIcon fill={"#8282A5"} />
              </button>
            )}
          </button>
        </div>
      )}
    </>
  );
}
