import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { getServerSideConfig } from "../config/server";

const config = getServerSideConfig();

import { DEFAULT_LANG } from "../locales";

// In future, we will support more voice, so we just put it here insead of in \app\locales\index.ts
const ALL_LANG_TO_LOCALES: Record<string, string> = {
  cn: "zh-CN",
  en: "en-US",
};

const ALL_LANG_TO_ROLES: Record<string, string> = {
  cn: "zh-CN-XiaoxiaoNeural",
  en: "en-US-JennyNeural",
};

class SpeechSdk {
  private synthesizer!: sdk.SpeechSynthesizer;
  private recognizer!: sdk.SpeechRecognizer;
  private recognizedText: string = "";

  constructor(language: string) {
    this.resetSpeaker(language);
  }

  public resetSpeaker(language: string) {
    // set info
    var speechConfig = sdk.SpeechConfig.fromSubscription(
      config.speechSubscriptionKey!,
      config.speechServiceRegion!,
    );
    speechConfig.speechRecognitionLanguage = ALL_LANG_TO_LOCALES[language];
    speechConfig.speechSynthesisVoiceName = ALL_LANG_TO_ROLES[language];
    var audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

    if (this.synthesizer) {
      this.synthesizer.close();
    }
    if (this.recognizer) {
      this.recognizer.close();
    }

    this.synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    this.recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  }

  public handleSynthesize(text: string) {
    this.synthesizer.speakTextAsync(text);
  }

  public stopSynthesize() {
    // TODO: not work
    // this.synthesizer.close();
  }

  public async startRecognition(): Promise<void> {
    this.recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        this.recognizedText += e.result.text;
      }
    };

    this.recognizer.startContinuousRecognitionAsync();

    // wait for ready
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  public async stopRecognition(): Promise<string> {
    // wait for completed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.recognizer.stopContinuousRecognitionAsync();
    let result = this.recognizedText;
    this.recognizedText = ""; // reset
    return result;
  }

  public recognizeOnceAsync(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recognizer.recognizeOnceAsync(
        (result) => {
          resolve(result.text);
        },
        (error) => {
          reject(error);
        },
      );
    });
  }

  // TODO: close recognizer
}

let speechSdk = new SpeechSdk(DEFAULT_LANG);
export default speechSdk;
