export class AudioHandler {
  private context: AudioContext;
  private workletNode: AudioWorkletNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private readonly sampleRate = 24000;

  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  private playbackQueue: AudioBufferSourceNode[] = [];
  private playBuffer: Int16Array[] = [];

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
    this.playBuffer = [];
  }

  playChunk(chunk: Uint8Array) {
    if (!this.isPlaying) return;

    const int16Data = new Int16Array(chunk.buffer);
    this.playBuffer.push.apply(this.playBuffer, int16Data); // save playBuffer

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
  _saveData(data: Int16Array, bytesPerSample = 16): Blob {
    const headerLength = 44;
    const numberOfChannels = 1;
    const dataLength = data.length;
    const wav = new Uint8Array(headerLength + dataLength * 2);
    const view = new DataView(wav.buffer);
    view.setUint32(0, 1380533830, false); // RIFF identifier 'RIFF'
    view.setUint32(4, 36 + dataLength * 2, true); // file length minus RIFF identifier length and file description length
    view.setUint32(8, 1463899717, false); // RIFF type 'WAVE'
    view.setUint32(12, 1718449184, false); // format chunk identifier 'fmt '
    view.setUint32(16, 16, true); // format chunk length
    view.setUint16(20, 1, true); // sample format (raw)
    view.setUint16(22, numberOfChannels, true); // channel count
    view.setUint32(24, this.sampleRate, true); // sample rate
    view.setUint32(28, this.sampleRate * 4, true); // byte rate (sample rate * block align)
    view.setUint16(32, numberOfChannels * 2, true); // block align (channel count * bytes per sample)
    view.setUint16(34, bytesPerSample, true); // bits per sample
    view.setUint32(36, 1684108385, false); // data chunk identifier 'data'
    view.setUint32(40, dataLength * 2, true); // data chunk length
    for (let i = 0; i < dataLength; i++) {
      view.setInt16(44 + i * 2, data[i], true);
    }
    return new Blob([view], { type: "audio/mpeg" });
  }
  savePlayFile() {
    return this._saveData(this.playBuffer);
  }
  async close() {
    this.workletNode?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    await this.context.close();
  }
}
