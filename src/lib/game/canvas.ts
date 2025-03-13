import { Scene } from "../ai";
import { Character } from "./character";


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
    resumeRecord: any;
    resumed: boolean = false;

    constructor(
        canvas: HTMLCanvasElement,
        scene: Scene,
        nextTopic: () => void,
        speak: (src: string, speech: string) => void,
        resumeRecord: any,
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.resumeRecord = resumeRecord;

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

        if (!this.resumed) {
            this.resumeRecord();
            this.resumed = true;
        }
    }

    async nextAction() {
        this.currentAction += 1;
        this.activeAction = false;

        console.log("scene ended?");

        if (this.currentAction == this.scene.actions.length) {
            this.done = true;
            setTimeout(() => {
                if (this.nextTopic) {
                    this.nextTopic();
                }
            }, 2000);
            return;
        }

        const previousAction = this.scene.actions[this.currentAction - 1];

        // Wait before executing the next action
        if (previousAction?.actionType === "attack01") {
            console.log("Attack action detected, waiting 5 seconds...");
            await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
    async start() {
        this.lastTime = performance.now();
        this.update(this.lastTime);

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}
