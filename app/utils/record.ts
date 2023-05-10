function createJSNode(audioContext: any) {
  const BUFFER_SIZE = 4096;
  const INPUT_CHANNEL_COUNT = 2;
  const OUTPUT_CHANNEL_COUNT = 2;
  let creator =
    audioContext.createScriptProcessor || audioContext.createJavaScriptNode;
  creator = creator.bind(audioContext);
  return creator(BUFFER_SIZE, INPUT_CHANNEL_COUNT, OUTPUT_CHANNEL_COUNT);
}

function writeUTFBytes(view: any, offset: any, string: any) {
  const { length } = string;
  for (let i = 0; i < length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function mergeArray(list: any) {
  const length = list.length * list[0].length;
  const data = new Float32Array(length);
  let offset = 0;
  for (let i = 0; i < list.length; i += 1) {
    data.set(list[i], offset);
    offset += list[i].length;
  }
  return data;
}

function createWavFile(audioData: any) {
  const WAV_HEAD_SIZE = 44;
  const buffer = new ArrayBuffer(audioData.length * 2 + WAV_HEAD_SIZE);
  // 需要用一个view来操控buffer
  const view = new DataView(buffer);
  // 写入wav头部信息
  // RIFF chunk descriptor/identifier
  writeUTFBytes(view, 0, "RIFF");
  // RIFF chunk length
  view.setUint32(4, 44 + audioData.length * 2, true);
  // RIFF type
  writeUTFBytes(view, 8, "WAVE");
  // format chunk identifier
  // FMT sub-chunk
  writeUTFBytes(view, 12, "fmt ");
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // stereo (2 channels)
  view.setUint16(22, 2, true);
  // sample rate
  view.setUint32(24, 44100, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, 44100 * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2 * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data sub-chunk
  // data chunk identifier
  writeUTFBytes(view, 36, "data");
  // data chunk length
  view.setUint32(40, audioData.length * 2, true);
  // 写入wav头部，代码同上
  // 写入PCM数据
  const { length } = audioData;
  let index = 44;
  const volume = 1;
  for (let i = 0; i < length; i += 1) {
    view.setInt16(index, audioData[i] * (0x7fff * volume), true);
    index += 2;
  }
  return buffer;
}

function interleaveLeftAndRight(left: any, right: any) {
  const totalLength = left.length + right.length;
  const data = new Float32Array(totalLength);
  for (let i = 0; i < left.length; i += 1) {
    const k = i * 2;
    data[k] = left[i];
    data[k + 1] = right[i];
  }
  return data;
}

export { createJSNode, createWavFile, interleaveLeftAndRight, mergeArray };
