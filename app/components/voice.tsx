// implement a voice component by speech synthesis to read the text with the voice of the user's choice
import * as React from "react";
import { useEffect, useState } from "react";
import { IconButton } from "./button";
import VoiceIcon from "../icons/voice.svg";

const speak = ({
  text,
  voice,
}: {
  text: string;
  voice: SpeechSynthesisVoice;
}) => {
  if (!window || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
};
export function Voice(props: { text: string }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const voices = window.speechSynthesis.getVoices();
    setVoices(voices);
    setVoice(voices[0]);
  }, []);

  return props.text ? (
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
  ) : (
    <></>
  );
}
