class AudioRecorder {
  private mediaRecorder: MediaRecorder | null;
  private audioChunks: Blob[];

  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  public startRecording = async (): Promise<void> => {
    if (this.mediaRecorder) {
      this.mediaRecorder.resume();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          this.audioChunks.push(event.data);
        };
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    }
  };

  public pauseRecording = (): void => {
    if (this.mediaRecorder) {
      this.mediaRecorder.requestData(); // 强制输出目前为止的录音数据
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.audioChunks.push(event.data);
      };
      this.mediaRecorder.pause();
    }
  };

  public stopRecording = async (): Promise<void> => {
    // 将 this.mediaRecorder 赋值给局部变量, 避免错误: Object is possibly 'null'
    const mediaRecorder = this.mediaRecorder;

    if (mediaRecorder) {
      return new Promise((resolve) => {
        // 当 MediaRecorder 停止时，解析 Promise
        mediaRecorder.onstop = () => {
          resolve();
        };

        // 停止 MediaRecorder 和所有轨道
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        this.mediaRecorder = null;
      });
    }

    return Promise.resolve(); // 当 mediaRecorder 不存在时返回立即解析的 Promise
  };

  public resetRecording = (): void => {
    this.stopRecording();
    this.audioChunks = [];
  };

  public getAudioData() {
    return new Blob(this.audioChunks, { type: "audio/wav" });
  }
}

// this should be a global object, so that change pages, it can still recording
export const recorder = new AudioRecorder();
