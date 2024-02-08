import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { getServerSideConfig } from "@/app/config/server";
const config = getServerSideConfig();

let subscriptionKey = config.azurekey;

// 这些信息应该从环境变量或配置文件中获取，不应硬编码在脚本中。
const serviceRegion = "eastus"; // 例如 "westus"
if (typeof subscriptionKey !== "string") {
  throw new Error("The SUBSCRIPTION_KEY environment variable is not set.");
}
// 创建语音识别器
const speechConfig = sdk.SpeechConfig.fromSubscription(
  subscriptionKey,
  serviceRegion,
);
export default function convertTextToSpeech(text: string) {
  return new Promise((resolve, reject) => {
    speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoshuangNeural"; // 使用 Azure 提供的声音名列表，选择合适的声音

    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput(); // 设置音频输出来自默认扬声器

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve("Speech synthesis completed successfully.");
        } else {
          reject(`Text to speech failed. Reason: ${result.reason}`);
        }
        synthesizer.close();
      },
      (error) => {
        console.error(error);
        synthesizer.close();
        reject(error);
      },
    );
  });
}
