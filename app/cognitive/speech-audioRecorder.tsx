import { useState, useRef, useEffect } from "react";

enum StageStatus {
  Start = "",
  Recording = "Recording",
  Paused = "Paused",
  Stopped = "Stopped",
}

export const useAudioRecorder = () => {
  const [status, setStatus] = useState(StageStatus.Start);
  const [audioData, setAudioData] = useState<Blob | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setStatus(StageStatus.Recording);

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        setAudioChunks((prevChunks) => [...prevChunks, event.data]);
      };
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && status === StageStatus.Recording) {
      mediaRecorderRef.current.pause();
      setStatus(StageStatus.Paused);
    }
  };

  const resumeRecording = async () => {
    if (status === StageStatus.Paused && mediaRecorderRef.current) {
      mediaRecorderRef.current.resume();
      setStatus(StageStatus.Recording);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setStatus(StageStatus.Stopped);
    }
  };

  const resetRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    setAudioData(null);
    setAudioChunks([]);
    setStatus(StageStatus.Start);
    mediaRecorderRef.current = null;
  };

  const downloadRecording = () => {
    if (audioData) {
      const audioUrl = URL.createObjectURL(audioData);
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = "recording.wav";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const playRecording = () => {
    if (audioData) {
      const audioUrl = URL.createObjectURL(audioData);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  useEffect(() => {
    // 仅当录音完全停止时，生成最终的录音 Blob 对象
    if (status === StageStatus.Stopped && audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      setAudioData(audioBlob);
      // 不要在这里清空 audioChunks，以便可以在录音期间累积音频片段
    }
  }, [status, audioChunks]);

  return {
    startRecording,
    pauseRecording,
    stopRecording,
    playRecording,
    resetRecording,
    status,
    audioData,
  };
};
