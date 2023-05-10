import {
  createJSNode,
  createWavFile,
  interleaveLeftAndRight,
  mergeArray,
} from "../../utils/record";
import React, { useState } from "react";
import { IconButton } from "../button";
import styles from "./audioChat.module.scss";
import { ttsRecorder } from "./index";
function AudioRecord() {
  const [url, setUrl] = useState<string>();

  const leftDataList: any[] = [];
  const rightDataList: any[] = [];
  let mediaNode: any;
  let mediaStream: any;
  let jsNode: any;
  function onAudioProcess(event: any) {
    const audioBuffer = event.inputBuffer;
    const leftChannelData = audioBuffer.getChannelData(0);
    const rightChannelData = audioBuffer.getChannelData(1);
    // 需要克隆一下
    leftDataList.push(leftChannelData.slice(0));
    rightDataList.push(rightChannelData.slice(0));
  }

  const beginRecord = (mediaStream: any) => {
    const audioContext = new window.AudioContext();
    mediaNode = audioContext.createMediaStreamSource(mediaStream);
    // 创建一个jsNode
    jsNode = createJSNode(audioContext);
    // 需要连到扬声器消费掉outputBuffer，process回调才能触发
    // 并且由于不给outputBuffer设置内容，所以扬声器不会播放出声音
    jsNode.connect(audioContext.destination);
    jsNode.onaudioprocess = onAudioProcess;
    // 把mediaNode连接到jsNode
    mediaNode.connect(jsNode);
  };

  const stopRecord = () => {
    // 停止录音
    mediaStream.getAudioTracks()[0].stop();
    mediaNode.disconnect();
    jsNode.disconnect();

    const leftData = mergeArray(leftDataList);
    const rightData = mergeArray(rightDataList);
    const allData = interleaveLeftAndRight(leftData, rightData);
    const wavBuffer = createWavFile(allData);
    const blob = new Blob([new Uint8Array(wavBuffer)]);
    const blobUrl = URL.createObjectURL(blob);
    setUrl(blobUrl);
  };

  const startRecord = () => {
    window.navigator.mediaDevices
      .getUserMedia({
        audio: {
          sampleRate: 44100, // 采样率
          channelCount: 2, // 声道
        },
      })
      .then((stream) => {
        mediaStream = stream;

        beginRecord(stream);
      })
      .catch((err) => {
        console.log(1111111, err);
        // 如果用户电脑没有麦克风设备或者用户拒绝了，或者连接出问题了等
        // 这里都会抛异常，并且通过err.name可以知道是哪种类型的错误
      });
  };

  return (
    <div className={styles["chat-input-panel"]}>
      {/* <PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} /> */}

      {/* <ChatActions
      showPromptModal={() => setShowPromptModal(true)}
      scrollToBottom={scrollToBottom}
      hitBottom={hitBottom}
      showPromptHints={() => {
        inputRef.current?.focus();
        onSearch("");
      }}
    /> */}
      <div
        className={styles["chat-input-panel-inner"]}
        onClick={() => {
          console.log(222222222);
          // ttsRecorder.start();
        }}
        // onTouchStart={() => {
        //   startRecord();
        //   console.log(222);
        // }}
        // onTouchEnd={() => {
        //   stopRecord();
        //   console.log(222);
        // }}
      >
        {url && <audio src={url} controls></audio>}
      </div>
    </div>
  );
}

export default AudioRecord;
