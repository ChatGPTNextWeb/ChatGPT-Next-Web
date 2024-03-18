import { ChatGPTApi } from "../client/platforms/openai";
import { getSTTLang } from "../locales";

export type TranscriptionCallback = (transcription: string) => void;

export abstract class SpeechApi {
  protected onTranscription: TranscriptionCallback = () => {};

  abstract isListening(): boolean;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;

  onTranscriptionReceived(callback: TranscriptionCallback) {
    this.onTranscription = callback;
  }

  protected async getMediaStream(): Promise<MediaStream | null> {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } else if (navigator.getUserMedia) {
      return new Promise((resolve, reject) => {
        navigator.getUserMedia({ audio: true }, resolve, reject);
      });
    } else {
      console.warn("当前浏览器不支持 getUserMedia");
      return null;
    }
  }

  protected createRecorder(stream: MediaStream): MediaRecorder | null {
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      return new MediaRecorder(stream, { mimeType: "audio/webm" });
    } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
      return new MediaRecorder(stream, { mimeType: "audio/ogg" });
    } else {
      console.warn("当前浏览器不支持 MediaRecorder");
      return null;
    }
  }
}

export class OpenAITranscriptionApi extends SpeechApi {
  private listeningStatus = false;
  private recorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  isListening = () => this.listeningStatus;

  constructor(transcriptionCallback?: TranscriptionCallback) {
    super();
    if (transcriptionCallback) {
      this.onTranscriptionReceived(transcriptionCallback);
    }
  }

  async start(): Promise<void> {
    const stream = await this.getMediaStream();
    if (!stream) {
      console.error("无法获取音频流");
      return;
    }

    this.recorder = this.createRecorder(stream);
    if (!this.recorder) {
      console.error("无法创建 MediaRecorder");
      return;
    }

    this.audioChunks = [];

    this.recorder.addEventListener("dataavailable", (event) => {
      this.audioChunks.push(event.data);
    });

    this.recorder.start();
    this.listeningStatus = true;
  }

  async stop(): Promise<void> {
    if (!this.recorder || !this.listeningStatus) {
      return;
    }

    return new Promise((resolve) => {
      this.recorder!.addEventListener("stop", async () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        const llm = new ChatGPTApi();
        const transcription = await llm.transcription({ file: audioBlob });
        this.onTranscription(transcription);
        this.listeningStatus = false;
        resolve();
      });

      this.recorder!.stop();
    });
  }
}

export class WebTranscriptionApi extends SpeechApi {
  private listeningStatus = false;
  private recognitionInstance: any | null = null;

  isListening = () => this.listeningStatus;

  constructor(transcriptionCallback?: TranscriptionCallback) {
    super();
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    this.recognitionInstance = new SpeechRecognition();
    this.recognitionInstance.continuous = true;
    this.recognitionInstance.interimResults = true;
    this.recognitionInstance.lang = getSTTLang();
    if (transcriptionCallback) {
      this.onTranscriptionReceived(transcriptionCallback);
    }
    this.recognitionInstance.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        if (!this.isListening) {
          this.onTranscriptionReceived(result[0].transcript);
        }
      }
    };
  }

  async start(): Promise<void> {
    await this.recognitionInstance.start();
    this.listeningStatus = true;
  }

  async stop(): Promise<void> {
    await this.recognitionInstance.stop();
    this.listeningStatus = false;
  }
}
