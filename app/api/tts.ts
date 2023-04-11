import {
  AudioConfig,
  SpeechConfig,
  SpeechSynthesizer,
  SpeakerAudioDestination,
  SpeechSynthesisResult,
} from "microsoft-cognitiveservices-speech-sdk";
import { getLang } from "../locales";

const SUB_KEY = process.env.SPEECH_SUB_KEY ?? "";
const REGION = process.env.SPEECH_REGION ?? "";

export async function speak(
  text: string,
  callback: ((e: SpeechSynthesisResult) => void) | undefined,
) {
  if (!text) return;
  const player = new SpeakerAudioDestination();
  const audioConfig = AudioConfig.fromSpeakerOutput(player);
  const speechConfig = SpeechConfig.fromSubscription(SUB_KEY, REGION);
  speechConfig.speechSynthesisVoiceName =
    getLang() === "cn" ? "zh-CN-XiaoxiaoNeural" : "en-US-AriaNeural";
  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
  synthesizer.speakTextAsync(text, callback);

  player.resume();
}
