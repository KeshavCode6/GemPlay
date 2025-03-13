import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createStoryPathWithRetry } from "@/lib/ai";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, StopCircle, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Story } from "./Story";
import Background from "@/components/Background";
import { Link, useNavigate } from "react-router";
import { useReactMediaRecorder } from "react-media-recorder";

export default function StoryScreen() {
  const storyPath = useRef<any>(null);
  const [active, setActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false); // Flag to wait for mediaBlobUrl

  const [currentNode, setCurrentNode] = useState<{
    topic: string;
    paths?: any[];
  } | null>(null);
  const story: string[] = [];
  const navigate = useNavigate();

  const { startRecording, stopRecording, pauseRecording, resumeRecording, mediaBlobUrl } = useReactMediaRecorder({
    screen: true,
    audio: false,
    video: false
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";

    async function getTopics() {
      if (storyPath.current) return;
      const t = await createStoryPathWithRetry();
      storyPath.current = t;
      setCurrentNode(t);
    }

    if (!currentNode && !storyPath.current) {
      getTopics();
    }
  }, []);

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
      pauseRecording()
    }
    setIsRecording(!isRecording);
  }

  function activeOption(index: number) {
    if (currentNode?.paths) {
      setCurrentNode(currentNode.paths[index]);
      story.push(currentNode.paths[index]);
      setActive(true);
    }
  }

  function resumeRecord() {
    resumeRecording();
  }

  function goToExport() {
    setShouldNavigate(true); // Wait for mediaBlobUrl before navigating
    stopRecording();
  }

  useEffect(() => {
    if (shouldNavigate && mediaBlobUrl) {
      navigate("/export", { state: { videoUrl: mediaBlobUrl } });
    }
  }, [mediaBlobUrl, shouldNavigate, navigate]);

  return (
    <motion.div
      initial={{ backgroundColor: "#FFFBF2", overflow: "hidden" }}
      animate={{ backgroundColor: active ? "#BD9DF9" : "#D9F99D" }}
      exit={{ overflow: "auto" }}
      onAnimationEnd={() => {
        document.body.style.overflow = "auto";
      }}
      transition={{ duration: 1 }}
      className="min-h-screen flex flex-col items-center p-4 md:p-8"
    >
      <Background />
      <motion.div
        initial={{ x: -1000, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 14,
        }}
        className="flex items-center justify-center z-50 absolute inset-0"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active ? "topics" : "story"}
            initial={{ y: active ? 1000 : -1000, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: active ? -1000 : 1000, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!active ? (
              <Card className="w-[50vw] gap-0 p-8 flex flex-col relative">
                <p className="text-black font-bold text-2xl">Choose a topic!</p>
                <p className="text-muted-foreground">
                  The rest of the story depends on what you pick
                </p>
                <Button
                  onClick={toggleRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className="absolute top-4 right-4 text-white"
                >
                  {isRecording ? <StopCircle /> : <Video />}
                </Button>
                {currentNode ? (
                  <div className="grid grid-cols-1 gap-1 mt-8">
                    {currentNode.paths?.length !== 0 && currentNode.paths ? (
                      currentNode.paths?.map(
                        (
                          option: { topic: string; paths: any },
                          index: number
                        ) => (
                          <Button
                            className="w-full h-[8rem] text-lg text-white"
                            key={index}
                            onClick={() => {
                              activeOption(index);
                            }}
                          >
                            <span className="mx-4 text-wrap">
                              {option.topic}
                            </span>
                          </Button>
                        )
                      )
                    ) : (
                      <div className="my-32 w-full flex justify-center text-2xl font-bold">
                        THE END!!
                      </div>
                    )}
                    <Button
                      variant={"destructive"}
                      onClick={isRecording ? goToExport : () => { navigate("/") }}
                      className="w-full h-[4rem] text-lg text-white"
                    >
                      <LogOut /> Exit
                    </Button>
                  </div>
                ) : (
                  <>
                    <Loading />
                    <Link to={"/"}>
                      <Button
                        variant={"destructive"}
                        className="w-full h-[4rem] text-lg text-white"
                      >
                        <LogOut /> Go Back
                      </Button>
                    </Link>
                  </>
                )}
              </Card>
            ) : (
              <Story
                currentNode={currentNode}
                nextTopic={() => {
                  setActive(false);
                  pauseRecording();
                }}
                resumeRecord={resumeRecord}
                story={story}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
