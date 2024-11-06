export class AudioHandler {
  private context: AudioContext;
  private workletNode: AudioWorkletNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private readonly sampleRate = 24000;

  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  private playbackQueue: AudioBufferSourceNode[] = [];

  constructor() {
    this.context = new AudioContext({ sampleRate: this.sampleRate });
  }

  async initialize() {
    await this.context.audioWorklet.addModule("/audio-processor.js");
  }

  async startRecording(onChunk: (chunk: Uint8Array) => void) {
    try {
      if (!this.workletNode) {
        await this.initialize();
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: this.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      await this.context.resume();
      this.source = this.context.createMediaStreamSource(this.stream);
      this.workletNode = new AudioWorkletNode(
        this.context,
        "audio-recorder-processor",
      );

      this.workletNode.port.onmessage = (event) => {
        if (event.data.eventType === "audio") {
          const float32Data = event.data.audioData;
          const int16Data = new Int16Array(float32Data.length);

          for (let i = 0; i < float32Data.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Data[i]));
            int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          const uint8Data = new Uint8Array(int16Data.buffer);
          onChunk(uint8Data);
        }
      };

      this.source.connect(this.workletNode);
      this.workletNode.connect(this.context.destination);

      this.workletNode.port.postMessage({ command: "START_RECORDING" });
    } catch (error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }

  stopRecording() {
    if (!this.workletNode || !this.source || !this.stream) {
      throw new Error("Recording not started");
    }

    this.workletNode.port.postMessage({ command: "STOP_RECORDING" });

    this.workletNode.disconnect();
    this.source.disconnect();
    this.stream.getTracks().forEach((track) => track.stop());
  }
  startStreamingPlayback() {
    this.isPlaying = true;
    this.nextPlayTime = this.context.currentTime;
  }

  stopStreamingPlayback() {
    this.isPlaying = false;
    this.playbackQueue.forEach((source) => source.stop());
    this.playbackQueue = [];
  }

  playChunk(chunk: Uint8Array) {
    if (!this.isPlaying) return;

    const int16Data = new Int16Array(chunk.buffer);

    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / (int16Data[i] < 0 ? 0x8000 : 0x7fff);
    }

    const audioBuffer = this.context.createBuffer(
      1,
      float32Data.length,
      this.sampleRate,
    );
    audioBuffer.getChannelData(0).set(float32Data);

    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.context.destination);

    const chunkDuration = audioBuffer.length / this.sampleRate;

    source.start(this.nextPlayTime);

    this.playbackQueue.push(source);
    source.onended = () => {
      const index = this.playbackQueue.indexOf(source);
      if (index > -1) {
        this.playbackQueue.splice(index, 1);
      }
    };

    this.nextPlayTime += chunkDuration;

    if (this.nextPlayTime < this.context.currentTime) {
      this.nextPlayTime = this.context.currentTime;
    }
  }
  async close() {
    this.workletNode?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    await this.context.close();
  }
}
