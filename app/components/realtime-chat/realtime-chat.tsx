import VoiceIcon from "@/app/icons/voice.svg";
import VoiceOffIcon from "@/app/icons/voice-off.svg";
import Close24Icon from "@/app/icons/close-24.svg";
import PowerIcon from "@/app/icons/power.svg";

import styles from "./realtime-chat.module.scss";
import clsx from "clsx";

import { useState, useRef, useEffect } from "react";

import {
  useAccessStore,
  useChatStore,
  ChatMessage,
  createMessage,
} from "@/app/store";

import { IconButton } from "@/app/components/button";

import {
  Modality,
  RTClient,
  RTInputAudioItem,
  RTResponse,
  TurnDetection,
} from "rt-client";
import { AudioHandler } from "@/app/lib/audio";
import { uploadImage } from "@/app/utils/chat";

interface RealtimeChatProps {
  onClose?: () => void;
  onStartVoice?: () => void;
  onPausedVoice?: () => void;
}

export function RealtimeChat({
  onClose,
  onStartVoice,
  onPausedVoice,
}: RealtimeChatProps) {
  const currentItemId = useRef<string>("");
  const currentBotMessage = useRef<ChatMessage | null>();
  const currentUserMessage = useRef<ChatMessage | null>();
  const accessStore = useAccessStore.getState();
  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [modality, setModality] = useState("audio");
  const [isAzure, setIsAzure] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [deployment, setDeployment] = useState("");
  const [useVAD, setUseVAD] = useState(true);

  const clientRef = useRef<RTClient | null>(null);
  const audioHandlerRef = useRef<AudioHandler | null>(null);

  const apiKey = accessStore.openaiApiKey;

  const handleConnect = async () => {
    if (!isConnected) {
      try {
        setIsConnecting(true);
        clientRef.current = isAzure
          ? new RTClient(new URL(endpoint), { key: apiKey }, { deployment })
          : new RTClient(
              { key: apiKey },
              { model: "gpt-4o-realtime-preview-2024-10-01" },
            );
        const modalities: Modality[] =
          modality === "audio" ? ["text", "audio"] : ["text"];
        const turnDetection: TurnDetection = useVAD
          ? { type: "server_vad" }
          : null;
        clientRef.current.configure({
          instructions: "Hi",
          input_audio_transcription: { model: "whisper-1" },
          turn_detection: turnDetection,
          tools: [],
          temperature: 0.9,
          modalities,
        });
        startResponseListener();

        setIsConnected(true);
      } catch (error) {
        console.error("Connection failed:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      await disconnect();
    }
  };

  const disconnect = async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.close();
        clientRef.current = null;
        setIsConnected(false);
      } catch (error) {
        console.error("Disconnect failed:", error);
      }
    }
  };

  const startResponseListener = async () => {
    if (!clientRef.current) return;

    try {
      for await (const serverEvent of clientRef.current.events()) {
        if (serverEvent.type === "response") {
          await handleResponse(serverEvent);
        } else if (serverEvent.type === "input_audio") {
          await handleInputAudio(serverEvent);
        }
      }
    } catch (error) {
      if (clientRef.current) {
        console.error("Response iteration error:", error);
      }
    }
  };

  const handleResponse = async (response: RTResponse) => {
    for await (const item of response) {
      if (item.type === "message" && item.role === "assistant") {
        const botMessage = createMessage({
          role: item.role,
          content: "",
        });
        // add bot message first
        chatStore.updateTargetSession(session, (session) => {
          session.messages = session.messages.concat([botMessage]);
        });
        for await (const content of item) {
          if (content.type === "text") {
            for await (const text of content.textChunks()) {
              botMessage.content += text;
            }
          } else if (content.type === "audio") {
            const textTask = async () => {
              for await (const text of content.transcriptChunks()) {
                botMessage.content += text;
              }
            };
            const audioTask = async () => {
              audioHandlerRef.current?.startStreamingPlayback();
              for await (const audio of content.audioChunks()) {
                audioHandlerRef.current?.playChunk(audio);
              }
            };
            await Promise.all([textTask(), audioTask()]);
          }
          // update message.content
          chatStore.updateTargetSession((session) => {
            session.messages = session.messages.concat();
          });
        }
        // upload audio get audio_url
        const blob = audioHandlerRef.current?.savePlayFile();
        uploadImage(blob).then((audio_url) => {
          botMessage.audio_url = audio_url;
          // botMessage.date = new Date().toLocaleString();
          // update text and audio_url
          chatStore.updateTargetSession((session) => {
            session.messages = session.messages.concat();
          });
        });
      }
    }
  };

  const handleInputAudio = async (item: RTInputAudioItem) => {
    audioHandlerRef.current?.stopStreamingPlayback();
    await item.waitForCompletion();
    if (item.transcription) {
      const userMessage = createMessage({
        role: "user",
        content: item.transcription,
      });
      chatStore.updateTargetSession(session, (session) => {
        session.messages = session.messages.concat([userMessage]);
      });
      // save input audio_url, and update session
      const { audioStartMillis, audioEndMillis } = item;
      // upload audio get audio_url
      const blob = audioHandlerRef.current?.saveRecordFile(
        audioStartMillis,
        audioEndMillis,
      );
      uploadImage(blob).then((audio_url) => {
        userMessage.audio_url = audio_url;
        chatStore.updateTargetSession((session) => {
          session.messages = session.messages.concat();
        });
      });
    }
  };

  const toggleRecording = async () => {
    if (!isRecording && clientRef.current) {
      try {
        if (!audioHandlerRef.current) {
          audioHandlerRef.current = new AudioHandler();
          await audioHandlerRef.current.initialize();
        }
        await audioHandlerRef.current.startRecording(async (chunk) => {
          await clientRef.current?.sendAudio(chunk);
        });
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    } else if (audioHandlerRef.current) {
      try {
        audioHandlerRef.current.stopRecording();
        if (!useVAD) {
          const inputAudio = await clientRef.current?.commitAudio();
          await handleInputAudio(inputAudio!);
          await clientRef.current?.generateResponse();
        }
        setIsRecording(false);
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    }
  };

  useEffect(() => {
    const initAudioHandler = async () => {
      const handler = new AudioHandler();
      await handler.initialize();
      audioHandlerRef.current = handler;
    };

    initAudioHandler().catch(console.error);

    return () => {
      disconnect();
      audioHandlerRef.current?.close().catch(console.error);
    };
  }, []);

  //   useEffect(() => {
  //     if (
  //       clientRef.current?.getTurnDetectionType() === "server_vad" &&
  //       audioData
  //     ) {
  //       // console.log("appendInputAudio", audioData);
  //       // 将录制的16PCM音频发送给openai
  //       clientRef.current?.appendInputAudio(audioData);
  //     }
  //   }, [audioData]);

  //   useEffect(() => {
  //     console.log("isRecording", isRecording);
  //     if (!isRecording.current) return;
  //     if (!clientRef.current) {
  //       const apiKey = accessStore.openaiApiKey;
  //       const client = (clientRef.current = new RealtimeClient({
  //         url: "wss://api.openai.com/v1/realtime",
  //         apiKey,
  //         dangerouslyAllowAPIKeyInBrowser: true,
  //         debug: true,
  //       }));
  //       client
  //         .connect()
  //         .then(() => {
  //           // TODO 设置真实的上下文
  //           client.sendUserMessageContent([
  //             {
  //               type: `input_text`,
  //               text: `Hi`,
  //               // text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are one): the item name".`
  //             },
  //           ]);

  //           // 配置服务端判断说话人开启还是结束
  //           client.updateSession({
  //             turn_detection: { type: "server_vad" },
  //           });

  //           client.on("realtime.event", (realtimeEvent) => {
  //             // 调试
  //             console.log("realtime.event", realtimeEvent);
  //           });

  //           client.on("conversation.interrupted", async () => {
  //             if (currentBotMessage.current) {
  //               stopPlaying();
  //               try {
  //                 client.cancelResponse(
  //                   currentBotMessage.current?.id,
  //                   currentTime(),
  //                 );
  //               } catch (e) {
  //                 console.error(e);
  //               }
  //             }
  //           });
  //           client.on("conversation.updated", async (event: any) => {
  //             // console.log("currentSession", chatStore.currentSession());
  //             // const items = client.conversation.getItems();
  //             const content = event?.item?.content?.[0]?.transcript || "";
  //             const text = event?.item?.content?.[0]?.text || "";
  //             // console.log(
  //             //   "conversation.updated",
  //             //   event,
  //             //   "content[0]",
  //             //   event?.item?.content?.[0]?.transcript,
  //             //   "formatted",
  //             //   event?.item?.formatted?.transcript,
  //             //   "content",
  //             //   content,
  //             //   "text",
  //             //   text,
  //             //   event?.item?.status,
  //             //   event?.item?.role,
  //             //   items.length,
  //             //   items,
  //             // );
  //             const { item, delta } = event;
  //             const { role, id, status, formatted } = item || {};
  //             if (id && role == "assistant") {
  //               if (
  //                 !currentBotMessage.current ||
  //                 currentBotMessage.current?.id != id
  //               ) {
  //                 // create assistant message and save to session
  //                 currentBotMessage.current = createMessage({ id, role });
  //                 chatStore.updateCurrentSession((session) => {
  //                   session.messages = session.messages.concat([
  //                     currentBotMessage.current!,
  //                   ]);
  //                 });
  //               }
  //               if (currentBotMessage.current?.id != id) {
  //                 stopPlaying();
  //               }
  //               if (content) {
  //                 currentBotMessage.current.content = content;
  //                 chatStore.updateCurrentSession((session) => {
  //                   session.messages = session.messages.concat();
  //                 });
  //               }
  //               if (delta?.audio) {
  //                 // typeof delta.audio is Int16Array
  //                 // 直接播放
  //                 addInt16PCM(delta.audio);
  //               }
  //               // console.log(
  //               //   "updated try save wavFile",
  //               //   status,
  //               //   currentBotMessage.current?.audio_url,
  //               //   formatted?.audio,
  //               // );
  //               if (
  //                 status == "completed" &&
  //                 !currentBotMessage.current?.audio_url &&
  //                 formatted?.audio?.length
  //               ) {
  //                 // 转换为wav文件保存 TODO 使用mp3格式会更节省空间
  //                 const botMessage = currentBotMessage.current;
  //                 const wavFile = new WavPacker().pack(sampleRate, {
  //                   bitsPerSample: 16,
  //                   channelCount: 1,
  //                   data: formatted?.audio,
  //                 });
  //                 // 这里将音频文件放到对象里面wavFile.url可以使用<audio>标签播放
  //                 item.formatted.file = wavFile;
  //                 uploadImageRemote(wavFile.blob).then((audio_url) => {
  //                   botMessage.audio_url = audio_url;
  //                   chatStore.updateCurrentSession((session) => {
  //                     session.messages = session.messages.concat();
  //                   });
  //                 });
  //               }
  //               if (
  //                 status == "completed" &&
  //                 !currentBotMessage.current?.content
  //               ) {
  //                 chatStore.updateCurrentSession((session) => {
  //                   session.messages = session.messages.filter(
  //                     (m) => m.id !== currentBotMessage.current?.id,
  //                   );
  //                 });
  //               }
  //             }
  //             if (id && role == "user" && !text) {
  //               if (
  //                 !currentUserMessage.current ||
  //                 currentUserMessage.current?.id != id
  //               ) {
  //                 // create assistant message and save to session
  //                 currentUserMessage.current = createMessage({ id, role });
  //                 chatStore.updateCurrentSession((session) => {
  //                   session.messages = session.messages.concat([
  //                     currentUserMessage.current!,
  //                   ]);
  //                 });
  //               }
  //               if (content) {
  //                 // 转换为wav文件保存 TODO 使用mp3格式会更节省空间
  //                 const userMessage = currentUserMessage.current;
  //                 const wavFile = new WavPacker().pack(sampleRate, {
  //                   bitsPerSample: 16,
  //                   channelCount: 1,
  //                   data: formatted?.audio,
  //                 });
  //                 // 这里将音频文件放到对象里面wavFile.url可以使用<audio>标签播放
  //                 item.formatted.file = wavFile;
  //                 uploadImageRemote(wavFile.blob).then((audio_url) => {
  //                   // update message content
  //                   userMessage.content = content;
  //                   // update message audio_url
  //                   userMessage.audio_url = audio_url;
  //                   chatStore.updateCurrentSession((session) => {
  //                     session.messages = session.messages.concat();
  //                   });
  //                 });
  //               }
  //             }
  //           });
  //         })
  //         .catch((e) => {
  //           console.error("Error", e);
  //         });
  //     }
  //     return () => {
  //       stop();
  //       // TODO close client
  //       clientRef.current?.disconnect();
  //     };
  //   }, [isRecording.current]);

  const handleClose = () => {
    onClose?.();
    disconnect();
  };

  return (
    <div className={styles["realtime-chat"]}>
      <div
        className={clsx(styles["circle-mic"], {
          [styles["pulse"]]: true,
        })}
      >
        <div className={styles["icon-center"]}></div>
      </div>
      <div className={styles["bottom-icons"]}>
        <div>
          <IconButton
            icon={isRecording ? <VoiceOffIcon /> : <VoiceIcon />}
            onClick={toggleRecording}
            disabled={!isConnected}
            bordered
            shadow
          />
        </div>
        <div className={styles["icon-center"]}>
          <IconButton
            icon={<PowerIcon />}
            text={
              isConnecting
                ? "Connecting..."
                : isConnected
                ? "Disconnect"
                : "Connect"
            }
            onClick={handleConnect}
            disabled={isConnecting}
            bordered
            shadow
          />
        </div>
        <div onClick={handleClose}>
          <IconButton
            icon={<Close24Icon />}
            onClick={handleClose}
            bordered
            shadow
          />
        </div>
      </div>
    </div>
  );
}
