import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { createScene } from "@/lib/ai";
import { ChevronRight, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CanvasManager } from "@/lib/game/canvas";
import { useRecording } from "@/lib/recorder";

export function Story({
  currentNode,
  nextTopic,
}: {
  currentNode: { topic: string; paths?: any } | undefined | null;
  nextTopic: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [canvasManager, setCanvasManager] = useState<CanvasManager | null>(
    null
  );
  const [speech, setSpeech] = useState<string>("");
  const [volume, setVolume] = useState<number>(0.5);

  const { startRecording } = useRecording();

  useEffect(() => {
    if (currentNode) {
      createScene(currentNode).then((scene) => {
        if (canvasRef.current) {
          const manager = new CanvasManager(
            canvasRef.current,
            scene,
            nextTopic,
            speak
          );
          setCanvasManager(manager);
          manager.start();
        }

        // Stop previous audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // Create and play new audio
        audioRef.current = new Audio(`/music/${scene.music}.mp3`);
        audioRef.current.loop = true;
        audioRef.current.volume = volume; // Set initial volume
        audioRef.current
          .play()
          .catch((err) => console.error("Audio play error:", err));
      });
    }

    if (canvasRef.current && audioRef.current) {
      startRecording(canvasRef.current, audioRef.current);
    }

    return () => {
      canvasManager?.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentNode]);

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const speak = (speech: string) => {
    setSpeech(speech);
  };

  if (!currentNode) {
    return null;
  }

  return (
    <Card className="w-[70vw] aspect-video gap-0 p-8 flex flex-col relative">
      <div className="flex justify-between w-full mb-4">
        <div className="flex flex-col">
          <p className="font-semibold text-muted-foreground text-sm">
            You picked
          </p>
          <p className="font-bold text-2xl]">{currentNode.topic}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.01}
              className="w-24"
            />
          </div>
          <Button variant={"outline"} onClick={nextTopic}>
            Skip <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full pixelated" />

        {speech && (
          <div className="absolute top-4 left-8 right-8 rounded-lg bg-black/[0.8] flex items-center space-x-4 p-4">
            <p className="text-white w-full text-center font-bold text-lg">{speech}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
