import { Scene } from "../ai";
import { Character, characterMap } from "./character";

export class CanvasManager {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    animationFrameId: number | null = null;
    scene: Scene;
    background: HTMLImageElement;
    characters: Map<string, Character> = new Map();
    lastTime: number = 0; // Track the last frame time
    currentAction: number = 0;
    nextTopic: () => void;
    speak: (src: string, speech: string) => void;
    done: boolean = false;

    constructor(canvas: HTMLCanvasElement, scene: Scene, nextTopic: () => void, speak: (src: string, speech: string) => void) {
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

        scene.characters.forEach((option) => {
            const charKey = option.character;
            const characterData = characterMap[charKey as keyof typeof characterMap];

            if (characterData) {
                this.characters.set(
                    charKey,
                    new Character(
                        characterData,
                        option.direction,
                        this.canvas.width * Number(option.position),
                        this.canvas,
                        speak
                    )
                );
            } else {
                console.error(`Character "${charKey}" not found in characterMap.`);
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
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime; // Update last frame time

        this.draw();
        this.animationFrameId = requestAnimationFrame((time) => this.update(time));

        for (const character of this.characters.values()) {
            if (!this.ctx) return;
            character.update(this.ctx, deltaTime);
        }

        if (this.done) { return; }

        const action = this.scene.actions[this.currentAction];
        const actionCharacter = this.characters.get(action.character)
        let target: any = action.target;

        if (action.actionType == "move") {
            target = this.characters.get(action.target)?.x ?? 0;
        }

        actionCharacter?.handleAction(action.actionType, target, this.nextAction)
    }

    nextAction() {
        this.currentAction += 1

        if (this.currentAction >= this.scene.actions.length) {
            this.done = true;
            setTimeout(() => {
                if (this.nextTopic) {
                    this.nextTopic();
                }
            }, 5000);
        }
    }

    start() {
        this.lastTime = performance.now();
        this.update(this.lastTime);
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}
