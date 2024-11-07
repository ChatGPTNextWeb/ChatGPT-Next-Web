import { useDebouncedCallback } from "use-debounce";
import VoiceIcon from "@/app/icons/voice.svg";
import VoiceOffIcon from "@/app/icons/voice-off.svg";
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
  Voice,
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

  const [status, setStatus] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [modality, setModality] = useState("audio");
  const [isAzure, setIsAzure] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [deployment, setDeployment] = useState("");
  const [useVAD, setUseVAD] = useState(true);
  const [voice, setVoice] = useState<Voice>("alloy");
  const [temperature, setTemperature] = useState(0.9);

  const clientRef = useRef<RTClient | null>(null);
  const audioHandlerRef = useRef<AudioHandler | null>(null);

  const apiKey = accessStore.openaiApiKey;

  const handleConnect = async () => {
    if (isConnecting) return;
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
          instructions: "",
          voice,
          input_audio_transcription: { model: "whisper-1" },
          turn_detection: turnDetection,
          tools: [],
          temperature,
          modalities,
        });
        startResponseListener();

        setIsConnected(true);
        try {
          const recentMessages = chatStore.getMessagesWithMemory();
          for (const message of recentMessages) {
            const { role, content } = message;
            if (typeof content === "string") {
              await clientRef.current.sendItem({
                type: "message",
                role: role as any,
                content: [
                  {
                    type: (role === "assistant" ? "text" : "input_text") as any,
                    text: content as string,
                  },
                ],
              });
            }
          }
        } catch (error) {
          console.error("Set message failed:", error);
        }
      } catch (error) {
        console.error("Connection failed:", error);
        setStatus("Connection failed");
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
          chatStore.updateTargetSession(session, (session) => {
            session.messages = session.messages.concat();
          });
        }
        // upload audio get audio_url
        const blob = audioHandlerRef.current?.savePlayFile();
        uploadImage(blob!).then((audio_url) => {
          botMessage.audio_url = audio_url;
          // botMessage.date = new Date().toLocaleString();
          // update text and audio_url
          chatStore.updateTargetSession(session, (session) => {
            session.messages = session.messages.concat();
          });
        });
      }
    }
  };

  const handleInputAudio = async (item: RTInputAudioItem) => {
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
      uploadImage(blob!).then((audio_url) => {
        userMessage.audio_url = audio_url;
        chatStore.updateTargetSession(session, (session) => {
          session.messages = session.messages.concat();
        });
      });
    }
    // stop streaming play after get input audio.
    audioHandlerRef.current?.stopStreamingPlayback();
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

  useEffect(
    useDebouncedCallback(() => {
      const initAudioHandler = async () => {
        const handler = new AudioHandler();
        await handler.initialize();
        audioHandlerRef.current = handler;
        await handleConnect();
        await toggleRecording();
      };

      initAudioHandler().catch((error) => {
        setStatus(error);
        console.error(error);
      });

      return () => {
        if (isRecording) {
          toggleRecording();
        }
        audioHandlerRef.current?.close().catch(console.error);
        disconnect();
      };
    }),
    [],
  );

  // update session params
  useEffect(() => {
    clientRef.current?.configure({ voice });
  }, [voice]);
  useEffect(() => {
    clientRef.current?.configure({ temperature });
  }, [temperature]);

  const handleClose = async () => {
    onClose?.();
    if (isRecording) {
      await toggleRecording();
    }
    disconnect().catch(console.error);
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
            type={isRecording ? "danger" : isConnected ? "primary" : null}
          />
        </div>
        <div className={styles["icon-center"]}>{status}</div>
        <div>
          <IconButton
            icon={<PowerIcon />}
            onClick={handleClose}
            type={isConnecting || isConnected ? "danger" : "primary"}
          />
        </div>
      </div>
    </div>
  );
}
