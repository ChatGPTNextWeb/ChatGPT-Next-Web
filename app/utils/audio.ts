type TTSPlayer = {
  play: (audioBuffer: ArrayBuffer, onended: () => void | null) => Promise<void>;
  stop: () => void;
};

export function createTTSPlayer(): TTSPlayer {
  let audioContext: AudioContext | null = null;
  let audioBufferSourceNode: AudioBufferSourceNode | null = null;

  const play = async (audioBuffer: ArrayBuffer, onended: () => void | null) => {
    if (audioBufferSourceNode) {
      audioBufferSourceNode.stop();
      audioBufferSourceNode.disconnect();
    }
    audioContext = new AudioContext();
    const buffer = await audioContext.decodeAudioData(audioBuffer);
    audioBufferSourceNode = audioContext.createBufferSource();
    audioBufferSourceNode.buffer = buffer;
    audioBufferSourceNode.connect(audioContext.destination);
    audioBufferSourceNode.start();
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

  return { play, stop };
}
