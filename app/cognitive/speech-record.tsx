import React, { Component } from "react";
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  ResultReason,
} from "microsoft-cognitiveservices-speech-sdk";
import { getServerSideConfig } from "../config/server";

const config = getServerSideConfig();

interface RecordingComponentProps {
  subscriptionKey: string;
  serviceRegion: string;
}

interface RecordingComponentState {
  isRecording: boolean;
  recordedText: string;
}

class RecordingComponent extends Component<
  RecordingComponentProps,
  RecordingComponentState
> {
  private recognizer: SpeechRecognizer | null = null;

  constructor() {
    super({
      subscriptionKey: config.speechSubscriptionKey!,
      serviceRegion: config.speechServiceRegion!,
    });
    this.state = {
      isRecording: false,
      recordedText: "",
    };
  }

  startRecording = () => {
    const { subscriptionKey, serviceRegion } = this.props;
    const speechConfig = SpeechConfig.fromSubscription(
      subscriptionKey,
      serviceRegion,
    );
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    this.recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    this.recognizer.startContinuousRecognitionAsync();
    this.recognizer.recognized = (s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        console.log(`Recognized: ${e.result.text}`);
        this.setState((prevState) => ({
          recordedText: prevState.recordedText + " " + e.result.text,
        }));
      }
    };
  };

  stopRecording = () => {
    if (this.recognizer) {
      this.recognizer.stopContinuousRecognitionAsync(() => {
        this.recognizer?.close();
        console.log("Recording stopped");
        console.log("Recorded text:", this.state.recordedText);
        this.setState({ recordedText: "" });
      });
    }
  };

  toggleRecording = () => {
    const { isRecording } = this.state;
    if (isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
    this.setState((prevState) => ({
      isRecording: !prevState.isRecording,
    }));
  };

  render() {
    const { isRecording, recordedText } = this.state;
    return (
      <div>
        <button onClick={this.toggleRecording}>
          {isRecording ? "停止录音" : "开始录音"}
        </button>
        <textarea value={recordedText} rows={5} cols={50} readOnly />
      </div>
    );
  }
}

export const recordingComponent = new RecordingComponent();
export default RecordingComponent;
