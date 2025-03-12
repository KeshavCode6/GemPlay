import { Scene } from "../ai";
import { Character } from "./character";

// Object to manage the game canvas
export class CanvasManager {
    // rendering constants
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    animationFrameId: number | null = null;

    // ai generated scene info
    scene: Scene;
    background: HTMLImageElement; // backdrop of the scene
    characters: Map<string, Character> = new Map(); // all involved characters

    // utility
    lastTime: number = 0;
    currentAction: number = 0;
    nextTopic: () => void; // function to move onto the next story path
    speak: (src: string, speech: string) => void; // the function to allow a character to speak
    done: boolean = false; // is the story done?
    activeAction: boolean = false;

    constructor(canvas: HTMLCanvasElement, scene: Scene, nextTopic: () => void, speak: (src: string, speech: string) => void) {
        // setting up constants
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // allowing pixel art to properly be rendered
        this.ctx!.imageSmoothingEnabled = true;
        this.ctx!.imageSmoothingQuality = "low";
        this.nextTopic = nextTopic;
        this.speak = speak;
        this.scene = scene;

        // setting up the backdrop
        this.background = new Image();
        this.background.src = `/backdrops/${this.scene.backdrop}.png`;
        this.nextAction = this.nextAction.bind(this);

        // initializing all the characters
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
        // resetting the screen
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // drawing the backdrop
        if (this.background.complete) {
            this.ctx?.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.background.onload = () => {
                this.ctx?.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
            };
        }
    }

    // main update loop
    update(currentTime: number) {
        // delate time to ensure consitent speed
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime; // Update last frame time

        // drawing the bacldrop
        this.draw();

        // updating each character
        this.animationFrameId = requestAnimationFrame((time) => this.update(time));
        for (const character of this.characters.values()) {
            if (!this.ctx) return;
            character.update(this.ctx, deltaTime);
        }

        // going through all the actions

        // stopping if we are done
        if (this.done) { return; }

        // what will happen next in the story
        const action = this.scene.actions[this.currentAction];
        const actionCharacter = this.characters.get(action.character)
        let target: any = action.target;

        // if the character is moving, get the x position of the character they are going to
        if (action.actionType == "move") {
            target = this.characters.get(action.target)?.x ?? 0;
        }

        // starting the action
        if (!this.activeAction && !this.done) {
            console.log(`${actionCharacter} ${action.actionType} ${target}`)
            actionCharacter?.handleAction(action.actionType, target, this.nextAction)
            this.activeAction = true; // ensuring the action is only started once
        }
    }

    // a function to move onto the next action
    nextAction() {
        this.currentAction += 1
        this.activeAction = false;

        // if all actions have been completed, finish
        if (this.currentAction >= this.scene.actions.length) {
            this.done = true;

            // pausing for 3 seconds before moving on
            setTimeout(() => {
                if (this.nextTopic) {
                    this.nextTopic();
                }
            }, 3000);
        }
    }

    // used for delatime
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
