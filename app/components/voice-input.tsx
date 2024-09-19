import { Button, Space } from "antd";
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
  const [accessToken, setAccessToken] = useState("unknown");

  const get_access_token = async () => {
    if (accessToken === "" || accessToken === "unknown") {
      try {
        const response = await fetch("/api/get_voice_token");
        const result = await response.json();
        setAccessToken(result.result);
        return result.result;
      } catch (e) {
        setAccessToken("");
        return "";
      }
    } else return accessToken;
  };

  useEffect(() => {
    if (accessToken === "") {
      get_access_token();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    // console.log('77777777777', userInput)
    if (!userInput || userInput.trim() === "") {
      setTempUserInput("");
      setVoiceInputText("");
      recognizer.current?.close();
      recognizer.current = undefined;
      setVoiceInputLoading(false);
    } else {
      if (!/\[\.\.\.\]$/.test(userInput)) {
        setTempUserInput(userInput);
      }
    }
  }, [userInput]);

  useEffect(() => {
    if (voiceInputText.trim() !== "") {
      setUserInput(tempUserInput + voiceInputText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceInputText]);

  function onRecognizedResult(result: SpeechRecognitionResult) {
    let temp_rec_result = `${result.text ?? ""}`;
    let intentJson = result.properties.getProperty(
      ms_audio_sdk.PropertyId.LanguageUnderstandingServiceResponse_JsonResult,
    );
    if (intentJson) {
      temp_rec_result += `${intentJson}`;
    }
    setVoiceInputText(temp_rec_result);
  }
  function onCanceled(
    sender: Recognizer,
    event: SpeechRecognitionCanceledEventArgs,
  ) {
    // console.log("[onCanceled] ", event);
    // 如果有异常就尝试重新获取
    setAccessToken("");
  }

  function onRecognizing(
    sender: Recognizer,
    event: SpeechRecognitionEventArgs,
  ) {
    let result = event.result;

    setVoiceInputText(
      voiceInputText.replace(/(.*)(^|[\r\n]+).*\[\.\.\.][\r\n]+/, "$1$2") +
        `${result.text ?? ""} [...]`,
    );
  }
  function onRecognized(sender: Recognizer, event: SpeechRecognitionEventArgs) {
    var result = event.result;
    onRecognizedResult(event.result);
  }

  const startRecognition = () => {
    if (voiceInputLoading) {
      recognizer.current?.close();
      recognizer.current = undefined;
      setVoiceInputLoading(false);
      return;
    }

    setVoiceInputLoading(true);
    setTempUserInput(userInput); // 开始的时候拷贝一份用于复原
    setVoiceInputText("");

    const getToken = async () => {
      return await get_access_token();
    };
    getToken().then((token) => {
      const speechConfig = ms_audio_sdk.SpeechConfig.fromAuthorizationToken(
        token,
        "eastasia",
      );
      const audioConfig = ms_audio_sdk.AudioConfig.fromDefaultMicrophoneInput();
      speechConfig.speechRecognitionLanguage = "zh-CN";
      recognizer.current = new ms_audio_sdk.SpeechRecognizer(
        speechConfig,
        audioConfig,
      );
      recognizer.current.recognizing = onRecognizing; // 自定义分段显示
      recognizer.current.recognized = onRecognized;
      recognizer.current.canceled = onCanceled; // 自定义中断
      recognizer.current.startContinuousRecognitionAsync();
    });
  };

  const icon = useMemo(() => {
    if (voiceInputLoading) {
      if (accessToken === "unknown") {
        return (
          <LoadingOutlined
            style={{
              fontSize: 16,
            }}
          />
        );
      } else {
        return (
          <LoadingOutlined
            style={{
              fontSize: 16,
              color: "rgb(234, 149, 24)",
            }}
          />
        );
      }
    }
    return (
      <AudioOutlined
        style={{
          fontSize: 16,
          color: "rgb(234, 149, 24)",
        }}
      />
    );
  }, [voiceInputLoading, accessToken]);

  return (
    <div>
      <Space.Compact>
        <Button type="text" onClick={startRecognition} icon={icon} />
      </Space.Compact>
    </div>
  );
}
