import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { createSceneWithRetry } from "@/lib/ai";
import { ChevronRight, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CanvasManager } from "@/lib/game/canvas";
import { AnimatePresence, motion } from "framer-motion";

export function Story({
  currentNode,
  nextTopic,
  story,
  resumeRecord,
}: {
  currentNode: { topic: string; paths?: any } | undefined | null;
  nextTopic: () => void;
  story: string[];
  resumeRecord: any;
}) {
  // References for canvas and audio elements
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State management
  const [canvasManager, setCanvasManager] = useState<CanvasManager | null>(
    null
  );
  const [speech, setSpeech] = useState<string>("");
  const [volume, setVolume] = useState<number>(0.5);

  useEffect(() => {
    if (currentNode) {
      // Generate scene based on the current node and story context
      createSceneWithRetry(currentNode, story).then((scene) => {
        if (canvasRef.current) {
          // Initialize the canvas manager for rendering
          const manager = new CanvasManager(
            canvasRef.current,
            scene,
            nextTopic,
            speak,
            resumeRecord
          );
          setCanvasManager(manager);
          manager.start();
        }

        // Stop previous audio if any
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // Set up and play background music
        audioRef.current = new Audio(`/music/${scene.music}.mp3`);
        audioRef.current.loop = true;
        audioRef.current.volume = volume; // Apply current volume
        audioRef.current
          .play()
          .catch((err) => console.error("Audio play error:", err));
      });
    }

    // Cleanup function to stop canvas and audio on unmount
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

  // Update speech text
  const speak = (speech: string) => {
    setSpeech(speech);
  };

  // If no current node exists, return nothing
  if (!currentNode) {
    return null;
  }

  return (
    <Card className="w-[70vw] aspect-video gap-0 p-8 flex flex-col relative">
      {/* Top section with topic and controls */}
      <div className="flex justify-between w-full mb-4">
        <div className="flex flex-col">
          <p className="font-semibold text-muted-foreground text-sm">
            You picked
          </p>
          <p className="font-bold text-2xl]">{currentNode.topic}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Volume control */}
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
          {/* Skip button */}
          <Button variant={"outline"} onClick={nextTopic}>
            Skip <ChevronRight />
          </Button>
        </div>
      </div>

      {/* Canvas for game scene */}
      <div className="relative w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full pixelated" />

        {/* Animated speech box */}
        <AnimatePresence mode="wait">
          {speech && (
            <motion.div
              key="speech-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-4 left-8 right-8 rounded-lg bg-black/[0.8] flex items-center space-x-4 p-4"
            >
              <p className="text-white w-full text-center font-bold text-lg">
                {speech}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
