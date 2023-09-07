import React, { useState } from "react";
import axios from "axios";

function ChatAvatar() {
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false); // 用于跟踪请求是否进行中

  const subscriptionKey = "505a176b70a94096888bd14bd9f12dcf";
  const urlBase = "https://westus2.customvoice.api.speech.microsoft.com/api";

  const ssml =
    '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" xml:lang="zh-CN"><voice name="zh-CN-XiaoxiaoNeural">你好，我是微软AI虚拟人。</voice></speak>';

  const payload = {
    displayName: "avatar test",
    description: "<description>",
    textType: "SSML",
    inputs: [
      {
        text: ssml,
      },
    ],
    synthesisConfig: {
      voice: "en-US-JennyNeural", // # set voice name for plain text; ignored for ssml
    },
    properties: {
      talkingAvatarCharacter: "lisa", // # currently only one platform character (lisa)
      talkingAvatarStyle: "graceful-sitting", // # chosen from 5 styles (casual-sitting, graceful-sitting, graceful-standing, technical-sitting, technical-standing)
      videoFormat: "webm", // # mp4 or webm, webm is required for transparent background
      videoCodec: "vp9", // # hevc, h264 or vp9, vp9 is required for transparent background; default is hevc
      subtitleType: "soft_embedded",
      backgroundColor: "transparent",
    },
  };

  const handleButtonClick = async () => {
    setIsFetching(true); // 设置请求状态为进行中

    try {
      const response = await axios.post(
        `${urlBase}/texttospeech/3.1-preview1/batchsynthesis/talkingavatar`,
        payload,
        {
          headers: {
            Accept: "application/json",
            "Ocp-Apim-Subscription-Key": subscriptionKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status >= 400) {
        console.log("Job submission failed, check your subscription key");
        console.log(response.data);
      } else {
        console.log("Job submitted successfully");
        console.log("response: ", response);
        const jobId = response.data.id;

        // 轮询获取状态
        const pollStatus = async () => {
          try {
            // const result = await axios.get(
            //   `${urlBase}/texttospeech/3.1-preview1/batchsynthesis/talkingavatar/${jobId}`
            // );
            const result = await axios.get(
              `${urlBase}/texttospeech/3.1-preview1/batchsynthesis/talkingavatar/${jobId}`,
              {
                headers: {
                  "Ocp-Apim-Subscription-Key": subscriptionKey,
                },
              },
            );

            if (result.data.status === "Succeeded") {
              console.log("Synthesized video:", result.data.outputs.result);
              setVideoUrl(result.data.outputs.result);
              setIsFetching(false); // 设置请求状态为完成
            } else if (result.data.status === "Failed") {
              console.log("Synthesis failed");
              setIsFetching(false); // 设置请求状态为完成
            } else {
              console.log("Synthesis in progress, status:", result.data.status);
              setTimeout(pollStatus, 1000);
            }
          } catch (error) {
            console.error("Error polling status:", error);
            setIsFetching(false); // 设置请求状态为完成
          }
        };

        pollStatus();
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      setIsFetching(false); // 设置请求状态为完成
    }
  };

  return (
    <div className="App">
      <button onClick={handleButtonClick} disabled={isFetching}>
        {isFetching ? "Fetching..." : "Start Synthesis"}
      </button>
      {videoUrl && (
        <video controls width="400" height="300">
          <source src={videoUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}

export default ChatAvatar;
