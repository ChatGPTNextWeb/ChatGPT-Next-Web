import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { getServerSideConfig } from "../config/server";
import { ELocaleLanguages } from "../azure-speech/AzureRoles";

const config = getServerSideConfig();

class SpeechSynthesizer {
  private synthesizer!: sdk.SpeechSynthesizer;

  public startSynthesize(text: string, voiceName: string) {
    // set info
    var speechConfig = sdk.SpeechConfig.fromSubscription(
      config.speechSubscriptionKey!,
      config.speechServiceRegion!,
    );
    speechConfig.speechSynthesisVoiceName = voiceName;
    this.synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    this.synthesizer.speakTextAsync(text);
  }

  public startSynthesizeAsync(text: string, voiceName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // set info
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        config.speechSubscriptionKey!,
        config.speechServiceRegion!,
      );
      speechConfig.speechSynthesisVoiceName = voiceName;
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

      // 添加 SynthesisCompleted 事件监听器
      synthesizer.synthesisCompleted = (s, e) => {
        // 在语音合成完成后执行需要的操作
        resolve(); // 语音合成完成，解析 Promise
      };

      // 开始语音合成
      synthesizer.speakTextAsync(text);
    });
  }

  public stopSynthesize() {
    // TODO: this not work
    // we should take other way to stop recognizer
    this.synthesizer.close();
  }

  // TODO: file access
  public SpeechAudioSynthesize(
    text: string,
    voiceName: string,
    audioFile: string,
  ) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      config.speechSubscriptionKey!,
      config.speechServiceRegion!,
    );
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

    // The language of the voice that speaks.
    speechConfig.speechSynthesisVoiceName = voiceName;

    // Create the speech synthesizer.
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Start the synthesizer and wait for a result.
    synthesizer.speakTextAsync(
      text,
      function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("synthesis finished.");
        } else {
          console.error(
            "Speech synthesis canceled, " +
              result.errorDetails +
              "\nDid you set the speech resource key and region values?",
          );
        }
        synthesizer.close();
        // synthesizer = null;
      },
      function (err) {
        console.trace("err - " + err);
        synthesizer.close();
        // synthesizer = null;
      },
    );
    console.log("Now synthesizing to: " + audioFile);
  }
}

type UpdateParentStateType = (newState: string) => void;

class SpeechRecognizer {
  private recognizer!: sdk.SpeechRecognizer;
  public recognizedText: string = "";

  public startRecording(
    updateParentState: UpdateParentStateType,
    localeLanguage: ELocaleLanguages,
  ) {
    // const speechConfig = sdk.SpeechConfig.fromSubscription(
    //   config.speechSubscriptionKey!,
    //   config.speechServiceRegion!,
    // );
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      config.speechAvatarSubscriptionKey!,
      config.speechAvatarServiceRegion!,
    );
    speechConfig.speechRecognitionLanguage = localeLanguage;

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    this.recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    this.recognizer.startContinuousRecognitionAsync();
    this.recognizer.recognized = (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        // console.log(`${e.result.text}`);
        updateParentState(e.result.text);
      }
    };
  }

  public stopRecording() {
    this.recognizer.stopContinuousRecognitionAsync(() => {
      this.recognizer.close();
      this.recognizedText = "";
    });
  }

  public recognizeOnceAsync(localeLanguage: ELocaleLanguages): Promise<string> {
    return new Promise((resolve, reject) => {
      // const speechConfig = sdk.SpeechConfig.fromSubscription(
      //   config.speechSubscriptionKey!,
      //   config.speechServiceRegion!,
      // );
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        config.speechAvatarSubscriptionKey!,
        config.speechAvatarServiceRegion!,
      );
      speechConfig.speechRecognitionLanguage = localeLanguage;

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // Start the transcription
      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve(result.text);
          } else {
            reject(`Transcription failed: ${result.reason}`);
          }
          recognizer.close();
        },
        (error) => {
          recognizer.close();
          reject(`Error in recognition: ${error}`);
        },
      );
    });
  }
}

export const speechSynthesizer = new SpeechSynthesizer();
export const speechRecognizer = new SpeechRecognizer();
