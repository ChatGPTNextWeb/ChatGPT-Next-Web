type TTSPlayer = {
  init: () => void;
  play: (audioBuffer: ArrayBuffer, onended: () => void | null) => Promise<void>;
  stop: () => void;
};

export function createTTSPlayer(): TTSPlayer {
  let audioContext: AudioContext | null = null;
  let audioBufferSourceNode: AudioBufferSourceNode | null = null;

  const init = () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.suspend();
  };

  const play = async (audioBuffer: ArrayBuffer, onended: () => void | null) => {
    if (audioBufferSourceNode) {
      audioBufferSourceNode.stop();
      audioBufferSourceNode.disconnect();
    }

    const buffer = await audioContext!.decodeAudioData(audioBuffer);
    audioBufferSourceNode = audioContext!.createBufferSource();
    audioBufferSourceNode.buffer = buffer;
    audioBufferSourceNode.connect(audioContext!.destination);
    audioContext!.resume().then(() => {
      audioBufferSourceNode!.start();
    });
    audioBufferSourceNode.onended = onended;
  };

  const stop = () => {
    if (audioBufferSourceNode) {
      audioBufferSourceNode.stop();
      audioBufferSourceNode.disconnect();
      audioBufferSourceNode = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  };

  return { init, play, stop };
}

export function arrayBufferToWav(buffer: ArrayBuffer): ArrayBuffer {
  const numOfChannels = 1; // Mono
  const sampleRate = 24000; // 24kHz
  const bitsPerSample = 16;

  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;

  // WAV header size is 44 bytes
  const wavHeaderSize = 44;
  const dataSize = buffer.byteLength;
  const totalSize = wavHeaderSize + dataSize;

  const wavBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(wavBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalSize - 8, true); // File size minus RIFF header
  writeString(view, 8, "WAVE");

  // FMT sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
  view.setUint16(20, 1, true); // Audio format (1 for PCM)
  view.setUint16(22, numOfChannels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, byteRate, true); // Byte rate
  view.setUint16(32, blockAlign, true); // Block align
  view.setUint16(34, bitsPerSample, true); // Bits per sample

  // Data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true); // Data size

  // Write the PCM samples
  const audioData = new Uint8Array(buffer);
  const wavData = new Uint8Array(wavBuffer);
  wavData.set(audioData, wavHeaderSize);

  return wavBuffer;
}

// Helper function to write a string to the DataView
function writeString(view: DataView, offset: number, string: string) {
  if (offset + string.length > view.byteLength) {
    throw new Error("String is too long for the available space in DataView");
  }
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
