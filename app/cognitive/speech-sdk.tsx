import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { getServerSideConfig } from "../config/server";

const config = getServerSideConfig();

// In future, we will support more voice, so we just put it here insead of in \app\locales\index.ts
export const RecondLanguages: Record<string, string> = {
  cn: "zh-CN",
  en: "en-US",
};

const VoiceRoleLanguages: Record<string, string> = {
  cn: "zh-CN-XiaoxiaoNeural",
  en: "en-US-JennyNeural",
};

class SpeechSynthesizer {
  private synthesizer!: sdk.SpeechSynthesizer;

  public startSynthesize(text: string, language: string) {
    console.log("startSynthesize", text, language);
    // set info
    var speechConfig = sdk.SpeechConfig.fromSubscription(
      config.speechSubscriptionKey!,
      config.speechServiceRegion!,
    );
    speechConfig.speechSynthesisVoiceName = VoiceRoleLanguages[language];
    this.synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    this.synthesizer.speakTextAsync(text);
  }

  public stopSynthesize() {
    // TODO: this not work
    // we should take other way to stop recognizer
    this.synthesizer.close();
  }
}

type UpdateParentStateType = (newState: string) => void;

class SpeechRecognizer {
  private recognizer!: sdk.SpeechRecognizer;
  public recognizedText: string = "";

  public startRecording(
    updateParentState: UpdateParentStateType,
    language: string,
  ) {
    var speechConfig = sdk.SpeechConfig.fromSubscription(
      config.speechSubscriptionKey!,
      config.speechServiceRegion!,
    );
    speechConfig.speechRecognitionLanguage = RecondLanguages[language];

    var audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    this.recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    this.recognizer.startContinuousRecognitionAsync();
    this.recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        // console.log(`Recognized: ${e.result.text}`);
        // 每句停顿 加一个换行
        if (this.recognizedText === "") {
          this.recognizedText = e.result.text;
        } else {
          this.recognizedText += "\n" + e.result.text;
        }

        updateParentState(this.recognizedText);
      }
    };
  }

  public stopRecording() {
    this.recognizer.stopContinuousRecognitionAsync(() => {
      this.recognizer.close();
      this.recognizedText = "";
    });
  }
}

export const speechSynthesizer = new SpeechSynthesizer();
export const speechRecognizer = new SpeechRecognizer();
