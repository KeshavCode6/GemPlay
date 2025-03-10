import { createContext, useContext, useState } from "react";

type RecordingContextType = {
  startRecording: (canvas: HTMLCanvasElement, audio: HTMLAudioElement) => void;
  stopRecording: () => void;
  isRecording: boolean;
  videoUrl: string | null;
  videoBlob: Blob | null;
};

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined
);

let globalMediaRecorder: MediaRecorder | null = null;
let globalChunks: Blob[] = [];

export function RecordingProvider({ children }: { children: React.ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const startRecording = (canvas: HTMLCanvasElement, audio: any) => {
    if (!canvas || !audio || isRecording) return;

    const canvasStream = canvas.captureStream(30);
    const audioStream = audio.captureStream();
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });

    globalChunks = [];
    mediaRecorder.ondataavailable = (event) => globalChunks.push(event.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(globalChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setVideoBlob(blob);
    };

    mediaRecorder.start();
    globalMediaRecorder = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!globalMediaRecorder) return;
    globalMediaRecorder.stop();
    globalMediaRecorder = null;
    setIsRecording(false);
  };

  return (
    <RecordingContext.Provider
      value={{
        startRecording,
        stopRecording,
        isRecording,
        videoUrl,
        videoBlob,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error("useRecording must be used within a RecordingProvider");
  }
  return context;
}
