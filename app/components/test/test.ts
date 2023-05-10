/*
 * @Autor: lychengtranscode
 * @Date: 2020-01-13 16:12:22
 */
export class TransWorker {
  public transcode: any;

  public onmessage: Function = (e: any) => {
    this.transcode.transToAudioData(e.data);
  };

  public transToAudioData(audioDataStr: any, fromRate = 16000, toRate = 22505) {
    let outputS16 = this.transcode.base64ToS16(audioDataStr);
    let output = this.transcode.transS16ToF32(outputS16);
    output = this.transcode.transSamplingRate(output, fromRate, toRate);
    output = Array.from(output);
    self.postMessage({
      data: output,
      rawAudioData: Array.from(outputS16),
    });
  }

  public transSamplingRate(data: any, fromRate = 44100, toRate = 16000) {
    var fitCount = Math.round(data.length * (toRate / fromRate));
    var newData = new Float32Array(fitCount);
    var springFactor = (data.length - 1) / (fitCount - 1);
    newData[0] = data[0];
    for (let i = 1; i < fitCount - 1; i++) {
      var tmp = i * springFactor;
      var before = Math.floor(tmp).toFixed();
      var after = Math.ceil(tmp).toFixed();
      var atPoint = tmp - Number(before);
      newData[i] = data[before] + (data[after] - data[before]) * atPoint;
    }
    newData[fitCount - 1] = data[data.length - 1];
    return newData;
  }

  public transS16ToF32(input: any) {
    var tmpData = [];
    for (let i = 0; i < input.length; i++) {
      var d = input[i] < 0 ? input[i] / 0x8000 : input[i] / 0x7fff;
      tmpData.push(d);
    }
    return new Float32Array(tmpData);
  }
  public base64ToS16(base64AudioData: any) {
    base64AudioData = atob(base64AudioData);
    const outputArray = new Uint8Array(base64AudioData.length);
    for (let i = 0; i < base64AudioData.length; ++i) {
      outputArray[i] = base64AudioData.charCodeAt(i);
    }
    return new Int16Array(new DataView(outputArray.buffer).buffer);
  }
}
