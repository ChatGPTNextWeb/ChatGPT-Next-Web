// implement a voice component by speech synthesis to read the text with the voice of the user's choice
import * as React from "react";
import { useState } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import { IconButton } from "./button";
import VoiceIcon from "../icons/voice.svg";

const voices = window.speechSynthesis.getVoices();
export function Voice(props: { text: string }) {
  const { speak } = useSpeechSynthesis();
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  return (
    <div>
      <IconButton
        onClick={() => {
          if (voice) {
            speak({ text: props.text, voice });
          }
        }}
        icon={<VoiceIcon />}
        title="Read"
      />
      <select
        onChange={(e) => {
          const voice = voices.find((v) => v.name === e.target.value);
          if (voice) {
            setVoice(voice);
          }
        }}
      >
        {voices.map((v) => (
          <option key={v.name} value={v.name}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
