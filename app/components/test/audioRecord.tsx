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
import stylesVoice from "../voice.module.scss";
function AudioRecord() {
  const [url, setUrl] = useState<string>();
  const [isRecordModalVisible, setIsRecordModalVisible] =
    useState<boolean>(false);
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

  const cancleRecord = () => {
    mediaStream.getAudioTracks()[0].stop();
    mediaNode.disconnect();
    jsNode.disconnect();
  };

  const stopRecord = () => {
    // 停止录音
    cancleRecord();
    const leftData = mergeArray(leftDataList);
    const rightData = mergeArray(rightDataList);
    const allData = interleaveLeftAndRight(leftData, rightData);
    const wavBuffer = createWavFile(allData);
    const blob = new Blob([new Uint8Array(wavBuffer)]);
    const blobUrl = URL.createObjectURL(blob);
    setUrl(blobUrl);
  };

  const startRecord = () => {
    console.log(909999);
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
        console.log(88888, err);
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
      {url && <audio controls src={url} />}
      <div
        onClick={() => {
          stopRecord();
          // console.log(1111111);
          // setIsRecordModalVisible(true);
        }}
      >
        停止
      </div>
      <div
        className={styles["chat-input-panel-inner"]}
        onClick={() => {
          startRecord();
          console.log(1111111);
          setIsRecordModalVisible(true);
        }}
      >
        按住说话
      </div>
      {isRecordModalVisible && (
        <div
          className={styles["record-modal-box"]}
          onTouchStart={() => {
            console.log(222222);
            startRecord();
            // setIsRecordModalVisible(true);
          }}
          // onTouchMove={() => {
          //   console.log(333333);
          //   cancleRecord();
          //   setIsRecordModalVisible(false);
          // }}
          onTouchEnd={() => {
            console.log(444444);
            stopRecord();
            setIsRecordModalVisible(false);
          }}
        >
          <div className={styles["record-icon-box"]}>
            <div className={styles["record-icon-info"]}>
              <div className={styles["record-icon-info-text"]}>
                <div> 松开发送</div>
                <div> 滑动取消</div>
              </div>
              <div className={styles["record-voice-box"]}>
                <div className={stylesVoice["voice-box"]}>
                  <div className={stylesVoice["voice-symbol"]}>
                    <div
                      className={`${stylesVoice["voice-circle"]} ${stylesVoice["first"]}`}
                    ></div>
                    <div
                      className={`${stylesVoice["voice-circle"]} ${stylesVoice["second"]} ${stylesVoice["second-animation"]}`}
                    ></div>
                    <div
                      className={`${stylesVoice["voice-circle"]} ${stylesVoice["third"]} ${stylesVoice["third-animation"]}`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioRecord;
