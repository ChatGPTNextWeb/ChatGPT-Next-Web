import * as sdk from "microsoft-cognitiveservices-speech-sdk";

let subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;
const serviceRegion = "eastus"; // 例如 "westus"

// 创建语音识别器
const speechConfig = sdk.SpeechConfig.fromSubscription(
  subscriptionKey,
  serviceRegion,
);

// 设置语音识别的语言
speechConfig.speechRecognitionLanguage = "zh-CN";

const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

export default function recognizeSpeech(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    console.log("开始语音识别，请说话...");
    recognizer.recognizeOnceAsync(
      (result) => {
        console.log(`识别结果： ${result.text}`);
        recognizer.close();
        resolve(result.text);
      },
      (err) => {
        console.trace("出现错误： ", err);
        recognizer.close();
        reject(err);
      },
    );
  });
}
