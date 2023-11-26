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

  // TODO: file access
  public SpeechAudioSynthesize(
    text: string,
    language: string,
    audioFile: string,
  ) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      config.speechSubscriptionKey!,
      config.speechServiceRegion!,
    );
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

    // The language of the voice that speaks.
    speechConfig.speechSynthesisVoiceName = VoiceRoleLanguages[language];

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
    language: string,
  ) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      config.speechSubscriptionKey!,
      config.speechServiceRegion!,
    );
    speechConfig.speechRecognitionLanguage = RecondLanguages[language];

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
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

  public transcribeAudio1(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      // Setup the Speech SDK
      const audioFile = this.blobToFile(blob, "audio.wav");
      const audioConfig = sdk.AudioConfig.fromWavFileInput(audioFile);
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        config.speechSubscriptionKey!,
        config.speechServiceRegion!,
      );
      speechConfig.speechRecognitionLanguage = RecondLanguages["en"];

      // Create the Speech Recognizer
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizeOnceAsync((result) => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          console.log(`Recognized: ${result.text}`);
        } else if (result.reason === sdk.ResultReason.NoMatch) {
          console.log("No speech could be recognized.");
        } else if (result.reason === sdk.ResultReason.Canceled) {
          const cancellation = sdk.CancellationDetails.fromResult(result);
          console.log(`CANCELED: Reason=${cancellation.reason}`);

          if (cancellation.reason === sdk.CancellationReason.Error) {
            console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
            console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
            console.log("CANCELED: Did you update the subscription info?");
          }
        }
      });

      // // Start the transcription
      // recognizer.recognizeOnceAsync(result => {
      //   if (result.reason === sdk.ResultReason.RecognizedSpeech) {
      //     resolve(result.text);
      //   } else {
      //     reject(`Transcription failed: ${result.reason}`);
      //   }
      //   recognizer.close();
      // });
    });
  }

  private blobToFile(theBlob: Blob, fileName: string): File {
    return new File([theBlob], fileName, {
      lastModified: new Date().getTime(),
      type: theBlob.type,
    });
  }

  public transcribeAudio(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const pushStream = sdk.AudioInputStream.createPushStream();

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        pushStream.write(arrayBuffer);
        pushStream.close();
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(blob);

      // 设置语音配置
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        config.speechSubscriptionKey!,
        config.speechServiceRegion!,
      );
      speechConfig.speechRecognitionLanguage = RecondLanguages["en"];

      // 使用流创建音频配置
      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

      // 创建语音识别器
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizeOnceAsync((result) => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve(result.text);
        } else {
          // 处理不同的失败情况
          reject(result);
        }
        recognizer.close();
      });
    });
  }
}

export const speechSynthesizer = new SpeechSynthesizer();
export const speechRecognizer = new SpeechRecognizer();

export const audioSpeechToText = (audioBlob: Blob) => {
  // 创建语音配置
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    config.speechSubscriptionKey!,
    config.speechServiceRegion!,
  );
  const language = "en-US";
  speechConfig.speechRecognitionLanguage = RecondLanguages[language];

  // 创建 Push 流
  const pushStream = sdk.AudioInputStream.createPushStream();

  // 读取 Blob 并推送到流中
  const fileReader = new FileReader();
  fileReader.onloadend = () => {
    const arrayBuffer = fileReader.result as ArrayBuffer;
    const view = new Uint8Array(arrayBuffer);
    pushStream.write(view.buffer);
    pushStream.close();
  };
  fileReader.readAsArrayBuffer(audioBlob);

  // 使用推送流创建音频配置
  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

  // 创建语音识别器
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  // 开始识别
  recognizer.recognizeOnceAsync(
    (result) => {
      console.log(`Recognized Text: ${result.text}`);
      recognizer.close();
    },
    (error) => {
      console.error(error);
      recognizer.close();
    },
  );
};

// 使用此函数时，传入一个 Blob 对象
// speechToText(yourAudioBlob);
