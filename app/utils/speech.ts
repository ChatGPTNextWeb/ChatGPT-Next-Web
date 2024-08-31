import { ChatGPTApi } from "../client/platforms/openai";
import { getSTTLang } from "../locales";
import { isFirefox } from "../utils";

export type TranscriptionCallback = (transcription: string) => void;

export abstract class SpeechApi {
  protected onTranscription: TranscriptionCallback = () => {};

  abstract isListening(): boolean;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;

  onTranscriptionReceived(callback: TranscriptionCallback) {
    this.onTranscription = callback;
  }
}

export class OpenAITranscriptionApi extends SpeechApi {
  private listeningStatus = false;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioChunks: Blob[] = [];

  isListening = () => this.listeningStatus;

  constructor(transcriptionCallback?: TranscriptionCallback) {
    super();
    if (transcriptionCallback) {
      this.onTranscriptionReceived(transcriptionCallback);
    }
  }

  async start(): Promise<void> {
    // 如果已经在监听，先停止当前的会话
    if (this.listeningStatus) {
      await this.stop();
    }

    // @ts-ignore
    navigator.getUserMedia =
      // @ts-ignore
      navigator.getUserMedia ||
      // @ts-ignore
      navigator.webkitGetUserMedia ||
      // @ts-ignore
      navigator.mozGetUserMedia ||
      // @ts-ignore
      navigator.msGetUserMedia;

    if (navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.stream = stream;
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };
      } catch (error) {
        console.error("Error accessing media devices:", error);
        return;
      }
    } else {
      console.warn("Media Devices will work only with SSL");
      return;
    }

    this.audioChunks = [];
    this.mediaRecorder!.start(1000);
    this.listeningStatus = true;
  }

  async stop(): Promise<void> {
    if (!this.mediaRecorder || !this.listeningStatus) {
      return;
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.addEventListener("stop", async () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        const llm = new ChatGPTApi();
        const transcription = await llm.transcription({ file: audioBlob });
        this.onTranscription(transcription);
        this.listeningStatus = false;

        // 停止所有音轨
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        resolve();
      });

      this.mediaRecorder!.stop();
    });
  }
}

export class WebTranscriptionApi extends SpeechApi {
  private listeningStatus = false;
  private recognitionInstance: any | null = null;
  private shouldContinueListening = false;

  isListening = () => this.listeningStatus;

  constructor(transcriptionCallback?: TranscriptionCallback) {
    super();
    this.initRecognition();
    if (transcriptionCallback) {
      this.onTranscriptionReceived(transcriptionCallback);
    }
  }

  private initRecognition(): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("SpeechRecognition is not supported in this browser");
      return;
    }

    this.recognitionInstance = new SpeechRecognition();
    this.recognitionInstance.continuous = true;
    this.recognitionInstance.interimResults = true;
    this.recognitionInstance.lang = getSTTLang();

    this.recognitionInstance.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        this.onTranscription(result[0].transcript);
      }
    };

    this.recognitionInstance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        this.listeningStatus = false;
        this.shouldContinueListening = false;
      }
    };

    this.recognitionInstance.onend = () => {
      console.log("Speech recognition ended");
      this.listeningStatus = false;
      if (this.shouldContinueListening) {
        console.log("Restarting speech recognition");
        this.start();
      }
    };
  }

  async start(): Promise<void> {
    if (this.listeningStatus) {
      console.warn("Speech recognition is already active.");
      return;
    }

    if (!this.recognitionInstance) {
      this.initRecognition();
    }

    if (!this.recognitionInstance) {
      throw new Error("Failed to initialize speech recognition");
    }

    this.shouldContinueListening = true;

    return new Promise((resolve, reject) => {
      const startRecognition = () => {
        try {
          this.recognitionInstance.start();
          this.listeningStatus = true;
          console.log("Speech recognition started");
          resolve();
        } catch (error) {
          console.error("Error starting speech recognition:", error);
          this.listeningStatus = false;
          this.shouldContinueListening = false;
          reject(error);
        }
      };

      startRecognition();
    });
  }

  async stop(): Promise<void> {
    this.shouldContinueListening = false;

    if (!this.listeningStatus || !this.recognitionInstance) {
      return;
    }

    return new Promise<void>((resolve) => {
      const onStop = () => {
        this.listeningStatus = false;
        this.recognitionInstance.removeEventListener("end", onStop);
        console.log("Speech recognition stopped");
        resolve();
      };

      this.recognitionInstance.addEventListener("end", onStop);

      try {
        this.recognitionInstance.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
        onStop();
      }
    });
  }
}
