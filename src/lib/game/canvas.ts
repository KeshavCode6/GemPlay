import { Scene } from "../ai";
import { Character, characterMap } from "./character";

export class CanvasManager {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    animationFrameId: number | null = null;
    scene: Scene;
    background: HTMLImageElement;
    characters: Character[] = [];
    lastTime: number = 0; // Track the last frame time

    constructor(canvas: HTMLCanvasElement, scene: Scene) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx!.imageSmoothingEnabled = true;
        this.ctx!.imageSmoothingQuality = "low";

        this.scene = scene;
        this.background = new Image();
        this.background.src = `/backdrops/${this.scene.backdrop}.png`;

        scene.characters.forEach((option) => {
            this.characters.push(new Character(characterMap[option.character as keyof typeof characterMap], option.direction, this.canvas.width * Number(option.position), this.canvas.height - 25));
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

        this.characters.forEach((character) => {
            if (!this.ctx) return;
            character.update(this.ctx, deltaTime);
        });
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
