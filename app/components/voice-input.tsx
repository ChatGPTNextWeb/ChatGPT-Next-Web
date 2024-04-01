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
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const get_access_token = async () => {
      const response = await fetch("/api/get_voice_token");
      const result = await response.json();
      setAccessToken(result.result);
    };
    if (accessToken === "") {
      try {
        get_access_token();
      } catch (e) {
        console.log("[get_access_token]", e);
      }
    }
  }, [accessToken]);

  useEffect(() => {
    if (!userInput || userInput.trim() === "") {
      setTempUserInput("");
      setVoiceInputText("");
    }
  }, [userInput]);

  function onRecognizedResult(result: SpeechRecognitionResult) {
    // setVoiceInputText("");
    setVoiceInputText(`${result.text ?? ""}`);
    let intentJson = result.properties.getProperty(
      ms_audio_sdk.PropertyId.LanguageUnderstandingServiceResponse_JsonResult,
    );
    if (intentJson) {
      setVoiceInputText(voiceInputText + `${intentJson}`);
    }
  }
  function onCanceled(
    sender: Recognizer,
    event: SpeechRecognitionCanceledEventArgs,
  ) {
    console.log("[onCanceled] ", event);
    // 如果有异常就尝试重新获取
    setAccessToken("");
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
        `${result.text ?? ""} [...]`,
    );
    setVoiceInputText(
      voiceInputText.replace(/(.*)(^|[\r\n]+).*\[\.\.\.][\r\n]+/, "$1$2") +
        `${result.text ?? ""} [...]`,
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

    const speechConfig = ms_audio_sdk.SpeechConfig.fromAuthorizationToken(
      accessToken,
      "eastasia",
    );
    const audioConfig = ms_audio_sdk.AudioConfig.fromDefaultMicrophoneInput();
    speechConfig.speechRecognitionLanguage = "zh-CN";
    speechConfig.setProperty(
      ms_audio_sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
      "3500",
    );
    recognizer.current = new ms_audio_sdk.SpeechRecognizer(
      speechConfig,
      audioConfig,
    );
    recognizer.current.recognizing = onRecognizing; // 自定义分段显示
    recognizer.current.canceled = onCanceled; // 自定义中断
    recognizer.current.recognizeOnceAsync(
      (result) => {
        onRecognizedResult(result);
        setUserInput(
          tempUserInput + (voiceInputText ?? "") + `${result.text ?? ""}`,
        );
        setTempUserInput("");
        setVoiceInputText("");
        setVoiceInputLoading(false);
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
