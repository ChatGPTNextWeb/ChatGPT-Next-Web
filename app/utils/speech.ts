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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.stream = stream;
    } else {
      console.warn("Media Decives will work only with SSL");
      return;
    }

    this.audioChunks = [];

    // this.recorder.addEventListener("dataavailable", (event) => {
    //     this.audioChunks.push(event.data);
    // });

    this.mediaRecorder.start(1000);
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
        resolve();
      });

      this.mediaRecorder!.stop();
    });
  }
}

export class WebTranscriptionApi extends SpeechApi {
  private listeningStatus = false;
  private recognitionInstance: any | null = null;

  isListening = () => this.listeningStatus;

  constructor(transcriptionCallback?: TranscriptionCallback) {
    super();
    if (isFirefox()) return;
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
        this.onTranscription(result[0].transcript);
      }
    };
  }

  async start(): Promise<void> {
    this.listeningStatus = true;
    await this.recognitionInstance.start();
  }

  async stop(): Promise<void> {
    this.listeningStatus = false;
    await this.recognitionInstance.stop();
  }
}
