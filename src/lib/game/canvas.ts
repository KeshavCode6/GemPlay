import { Scene } from "../ai";
import { Character } from "./character";

// Global storage for all recorded snippets across instances
const recordedSnippets: Blob[] = [];

export class CanvasManager {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    animationFrameId: number | null = null;

    // AI-generated scene info
    scene: Scene;
    background: HTMLImageElement;
    characters: Map<string, Character> = new Map();

    // Utility
    lastTime: number = 0;
    currentAction: number = 0;
    nextTopic: () => void;
    speak: (src: string, speech: string) => void;
    done: boolean = false;
    activeAction: boolean = false;

    // Recording setup
    mediaRecorder: MediaRecorder | null = null;
    recordedChunks: Blob[] = [];

    constructor(
        canvas: HTMLCanvasElement,
        scene: Scene,
        nextTopic: () => void,
        speak: (src: string, speech: string) => void
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.ctx!.imageSmoothingEnabled = true;
        this.ctx!.imageSmoothingQuality = "low";
        this.nextTopic = nextTopic;
        this.speak = speak;
        this.scene = scene;

        this.background = new Image();
        this.background.src = `/backdrops/${this.scene.backdrop}.png`;
        this.nextAction = this.nextAction.bind(this);

        // Initialize all characters
        scene.characters.forEach((option) => {
            this.characters.set(
                option.character,
                new Character(
                    option.character,
                    option.direction,
                    this.canvas.width * Number(option.position),
                    this.canvas,
                    speak
                )
            );
        });

        // Setup recording
        this.setupRecording();
    }

    addClip() {
        console.log("Recording stopped, storing snippet...");

        // Ensure data is properly captured before finalizing
        if (this.mediaRecorder?.state !== "inactive") {
            this.mediaRecorder?.requestData();
        }

        // Store snippet globally
        const blob = new Blob(this.recordedChunks, { type: "video/webm;codecs=vp8" });
        recordedSnippets.push(blob);
        console.log(recordedSnippets)
        console.log(`Stored snippet ${recordedSnippets.length} in global memory.`);
    }
    // Initialize the MediaRecorder
    setupRecording() {
        try {
            const stream = this.canvas.captureStream(30); // 30 FPS
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: "video/webm;codecs=vp8", // Use vp8 for broader browser support
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    console.log("Data available:", event.data);
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = this.addClip;

            this.mediaRecorder.onerror = (event) => {
                console.error("MediaRecorder error:", event);
            };

            console.log("MediaRecorder initialized successfully.");
        } catch (error) {
            console.error("Error setting up recording:", error);
        }
    }

    startRecording() {
        if (!this.mediaRecorder) {
            console.error("MediaRecorder is not initialized!");
            return;
        }
        if (this.mediaRecorder.state === "inactive") {
            this.recordedChunks = []; // Reset chunks
            this.mediaRecorder.start(1000); // Request data every 1 second
            console.log("Recording started...");
        }
    }

    stopRecording(): Promise<void> {
        return new Promise((resolve) => {
            if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
                console.log("Stopping recording...");
                this.mediaRecorder.requestData(); // Force final data save
                this.mediaRecorder.onstop = () => {
                    console.log("Recording stopped, storing snippet...");
                    this.addClip();
                    resolve();
                };
                this.mediaRecorder.stop();
            } else {
                resolve();
            }
        });
    }

    draw() {
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.background.complete) {
            this.ctx?.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.background.onload = () => {
                this.ctx?.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
            };
        }
    }

    update(currentTime: number) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.draw();

        this.animationFrameId = requestAnimationFrame((time) => this.update(time));
        for (const character of this.characters.values()) {
            if (!this.ctx) return;
            character.update(this.ctx, deltaTime);
        }

        if (this.done) return;

        const action = this.scene.actions[this.currentAction];
        const actionCharacter = this.characters.get(action.character);
        let target: any = action.target;

        if (action.actionType == "move") {
            target = this.characters.get(action.target)?.x ?? 0;
        }

        if (!this.activeAction && !this.done) {
            console.log(`${actionCharacter} ${action.actionType} ${target}`);
            actionCharacter?.handleAction(action.actionType, target, this.nextAction);
            this.activeAction = true;
        }
    }

    async nextAction() {
        this.currentAction += 1;
        this.activeAction = false;

        if (this.currentAction == this.scene.actions.length) {
            this.done = true;
            await this.stopRecording();
            setTimeout(() => {
                if (this.nextTopic) {
                    this.nextTopic();
                }
            }, 2000);
        }
    }

    async start() {
        this.lastTime = performance.now();
        this.update(this.lastTime);

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        this.startRecording();
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.stopRecording();
    }
}

// Function to merge and download all recorded snippets
export function downloadFinalRecording() {
    if (recordedSnippets.length === 0) {
        console.warn("No video snippets recorded.");
        return;
    }

    console.log("Merging all video snippets...");

    // Merge all recorded snippets into one Blob
    const finalBlob = new Blob(recordedSnippets, { type: "video/webm;codecs=vp8" });

    console.log("Final video ready for download.");

    // Trigger the download
    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas-final-recording.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log("Download triggered.");
}