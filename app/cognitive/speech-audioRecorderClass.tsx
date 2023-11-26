type MediaRecorderEvent = BlobEvent | Event;

export enum StageStatus {
  Start = "",
  Recording = "Recording",
  Paused = "Paused",
  Stopped = "Stopped",
}

export class AudioRecorder {
  public stageStatus: StageStatus;
  // public audioData: Blob | null;

  private mediaRecorder: MediaRecorder | null;
  private audioChunks: Blob[];
  private onStatusChange: (status: StageStatus) => void;

  constructor(onStatusChange: (status: StageStatus) => void) {
    this.stageStatus = StageStatus.Start;
    // this.audioData = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.onStatusChange = onStatusChange;
  }

  private setStageStatus = (newStatus: StageStatus): void => {
    this.stageStatus = newStatus;
    this.onStatusChange(newStatus);
  };

  // public startRecording = async (): Promise<void> => {
  //   if (this.stageStatus === StageStatus.Paused && this.mediaRecorder) {
  //     this.mediaRecorder.resume();
  //     this.setStageStatus(StageStatus.Recording);
  //   } else {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //       this.mediaRecorder = new MediaRecorder(stream);
  //       this.mediaRecorder.start();
  //       this.setStageStatus(StageStatus.Recording);

  //       this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
  //         this.audioChunks.push(event.data);
  //         // this.audioData = new Blob(this.audioChunks, { 'type': 'audio/wav' }); // 立即更新 audioData
  //       };
  //     } catch (err) {
  //       console.error('Error accessing media devices.', err);
  //     }
  //   }
  // };
  public startRecording = async (): Promise<void> => {
    if (this.stageStatus === StageStatus.Start) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          this.audioChunks.push(event.data);
          // this.audioData = new Blob(this.audioChunks, { 'type': 'audio/wav' }); // 立即更新 audioData
        };
        this.setStageStatus(StageStatus.Recording);
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
        // this.audioData = new Blob(this.audioChunks, { 'type': 'audio/wav' }); // 立即更新 audioData
        this.setStageStatus(StageStatus.Paused);
      };
      this.mediaRecorder.pause();
    }
  };

  public resumeRecording = async (): Promise<void> => {
    if (this.mediaRecorder && this.stageStatus === StageStatus.Paused) {
      this.mediaRecorder.resume();
      this.setStageStatus(StageStatus.Recording);
    }
  };

  public stopRecording = (): void => {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      this.setStageStatus(StageStatus.Stopped);
      // this.setStageStatus(StageStatus.Paused);
    }
  };

  public getAudioData() {
    return new Blob(this.audioChunks, { type: "audio/wav" });
  }

  public resetRecording = (): void => {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    this.audioChunks = [];
    this.setStageStatus(StageStatus.Start);
  };
}
