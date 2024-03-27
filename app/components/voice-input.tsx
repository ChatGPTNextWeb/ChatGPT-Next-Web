// "use client";
import { Button, Input, Space } from "antd";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AudioOutlined, LoadingOutlined } from "@ant-design/icons";
import * as ms_audio_sdk from "microsoft-cognitiveservices-speech-sdk";
import {
  Recognizer,
  SpeechRecognitionCanceledEventArgs,
  SpeechRecognitionEventArgs,
  SpeechRecognitionResult,
} from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Exports";
import { useAccessStore } from "@/app/store";

interface VoiceInputInterface {
  userInput: string;
  setUserInput: Dispatch<SetStateAction<string>>;
}

// @ts-ignore
export default function VoiceInput({
  userInput,
  setUserInput,
}: VoiceInputInterface) {
  const [voiceInputText, setVoiceInputText] = useState("");
  const [voiceInputLoading, setVoiceInputLoading] = useState(false);
  // const recognition = useRef(null);
  const recognizer = useRef<ms_audio_sdk.SpeechRecognizer | undefined>();
  const [tempUserInput, setTempUserInput] = useState("");
  const accessStore = useAccessStore();
  // const lastLength = useRef(0);

  // useEffect(() => {
  //
  //   function onresult(event: any) {
  //     // 这个事件会把前面识别的结果都返回回来，所以需要取最后一个识别结果
  //     const length = event.results.length;
  //     // 没有新的识别结果的时候，事件也会触发，所以这里判断一下如果没有新的识别结果，就不取最后一个识别结果了。
  //     if (lastLength.current === length) {
  //       return;
  //     }
  //
  //     lastLength.current = length;
  //
  //     console.log(event.results);
  //
  //     // 获取最后一个识别结果
  //     const transcript = event.results[length - 1]?.[0]?.transcript;
  //
  //     // 将最后一个识别结果添加到文本
  //     if (transcript) {
  //       setVoiceInputText((voiceInputText) => voiceInputText + transcript);
  //     }
  //   }
  //
  // }, []);

  function onRecognizedResult(result: SpeechRecognitionResult) {
    // setVoiceInputText("");
    setVoiceInputText(`${result.text}`);

    let intentJson = result.properties.getProperty(
      ms_audio_sdk.PropertyId.LanguageUnderstandingServiceResponse_JsonResult,
    );
    if (intentJson) {
      setVoiceInputText(voiceInputText + `${intentJson}`);
    }

    // setTempUserInput("");
    console.log("3333", tempUserInput, "2", voiceInputText);

    // if (result?.translations) {
    //   let resultJson = JSON.parse(result.json);
    //   resultJson['privTranslationPhrase']['Translation']['Translations'].forEach(
    //       function (translation: { Language: any; Text: any; }) {
    //         setVoiceInputText(voiceInputText + ` [${translation.Language}] ${translation.Text}\r\n`);
    //       });
    // }
  }
  function onCanceled(
    sender: Recognizer,
    event: SpeechRecognitionCanceledEventArgs,
  ) {
    console.log(event);

    // 展示取消事件
    // statusDiv.innerHTML += "(cancel) Reason: " + ms_audio_sdk.CancellationReason[event.reason];
    // if (event.reason === ms_audio_sdk.CancellationReason.Error) {
    //   statusDiv.innerHTML += ": " + event.errorDetails;
    // }
    // statusDiv.innerHTML += "\r\n";
  }
  function onRecognizing(
    sender: Recognizer,
    event: SpeechRecognitionEventArgs,
  ) {
    let result = event.result;
    setUserInput(
      tempUserInput +
        voiceInputText.replace(/(.*)(^|[\r\n]+).*\[\.\.\.][\r\n]+/, "$1$2") +
        `${result.text} [...]`,
    );

    setVoiceInputText(
      voiceInputText.replace(/(.*)(^|[\r\n]+).*\[\.\.\.][\r\n]+/, "$1$2") +
        `${result.text} [...]`,
    );
  }

  const startRecognition = () => {
    if (voiceInputLoading) {
      recognizer.current?.close();
      setVoiceInputLoading(false);
      // setVoiceInputText("");
      // setUserInput(tempUserInput);
      return;
    }

    setVoiceInputLoading(true);
    setTempUserInput(userInput); // 开始的时候拷贝一份用于复原
    setVoiceInputText("");

    const speechConfig = ms_audio_sdk.SpeechConfig.fromSubscription(
      accessStore.azureVoiceKey,
      "eastasia",
    );
    const audioConfig = ms_audio_sdk.AudioConfig.fromDefaultMicrophoneInput();
    speechConfig.speechRecognitionLanguage = "zh-CN";
    speechConfig.setProperty(
      ms_audio_sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
      "2500",
    );
    recognizer.current = new ms_audio_sdk.SpeechRecognizer(
      speechConfig,
      audioConfig,
    );
    recognizer.current.recognizing = onRecognizing; // 自定义分段显示
    recognizer.current.canceled = onCanceled; // 自定义中断
    recognizer.current.recognizeOnceAsync(
      (result) => {
        // onRecognizedResult(result);
        setVoiceInputText(`${result.text}`);
        console.log("3333", tempUserInput, "2", voiceInputText);
        setUserInput(tempUserInput + voiceInputText + `${result.text}`);
        // setVoiceInputText(result.text);
        console.log("result", result.text);
        setVoiceInputLoading(false);
        // recognizer.close();
      },
      (err) => {
        console.error("Recognition error: ", err); // 错误处理
        setVoiceInputLoading(false);
      },
    );
  };

  const icon = useMemo(() => {
    if (voiceInputLoading) {
      return (
        <LoadingOutlined
          style={{
            fontSize: 16,
            color: "rgb(234, 149, 24)",
          }}
        />
      );
    }
    return (
      <AudioOutlined
        style={{
          fontSize: 16,
          color: "rgb(234, 149, 24)",
        }}
      />
    );
  }, [voiceInputLoading]);

  return (
    <div>
      <Space.Compact>
        {/*<Input value={voiceInputText} />*/}
        <Button type="text" onClick={startRecognition} icon={icon} />
      </Space.Compact>
    </div>
  );
}
