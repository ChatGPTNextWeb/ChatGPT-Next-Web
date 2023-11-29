type MediaRecorderEvent = BlobEvent | Event;

export enum StageStatus {
  Start = "",
  Recording = "Recording",
  Paused = "Paused",
  Stopped = "Stopped",
}

export class AudioRecorder {
  public stageStatus: StageStatus;

  private mediaRecorder: MediaRecorder | null;
  private audioChunks: Blob[];
  private onStatusChange: (status: StageStatus) => void;

  constructor(onStatusChange: (status: StageStatus) => void) {
    this.stageStatus = StageStatus.Start;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.onStatusChange = onStatusChange;
  }

  private setStageStatus = (newStatus: StageStatus): void => {
    this.stageStatus = newStatus;
    this.onStatusChange(newStatus);
  };

  public startRecording = async (): Promise<void> => {
    if (this.stageStatus === StageStatus.Paused && this.mediaRecorder) {
      this.mediaRecorder.resume();
      this.setStageStatus(StageStatus.Recording);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.setStageStatus(StageStatus.Recording);

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          this.audioChunks.push(event.data);
        };
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    }
  };

  public pauseRecording = (): void => {
    if (this.mediaRecorder && this.stageStatus === StageStatus.Recording) {
      this.mediaRecorder.requestData(); // 强制输出目前为止的录音数据
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.audioChunks.push(event.data);
        this.setStageStatus(StageStatus.Paused);
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
          this.setStageStatus(StageStatus.Stopped);
          resolve();
        };

        // 停止 MediaRecorder 和所有轨道
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      });
    }
  };

  public resetRecording = async (): Promise<void> => {
    // 将 this.mediaRecorder 赋值给局部变量, 避免错误: Object is possibly 'null'
    const mediaRecorder = this.mediaRecorder;

    if (mediaRecorder) {
      return new Promise((resolve) => {
        // 当 MediaRecorder 停止时，解析 Promise
        mediaRecorder.onstop = () => {
          this.setStageStatus(StageStatus.Start);
          resolve();
        };

        // 停止 MediaRecorder 和所有轨道
        mediaRecorder.stop();
        this.audioChunks = [];
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      });
    }
  };

  public getAudioData() {
    return new Blob(this.audioChunks, { type: "audio/wav" });
  }
}
