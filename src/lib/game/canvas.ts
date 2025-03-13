import { Scene } from "../ai";
import { Character } from "./character";

export class CanvasManager {
    canvas: HTMLCanvasElement; // Canvas element
    ctx: CanvasRenderingContext2D | null; // Canvas rendering context
    animationFrameId: number | null = null; // ID for the animation frame

    // AI-generated scene info
    scene: Scene; // Scene information
    background: HTMLImageElement; // Background image
    characters: Map<string, Character> = new Map(); // Map of characters

    // Utility
    lastTime: number = 0; // Last time the update was called
    currentAction: number = 0; // Index of the current action
    nextTopic: () => void; // Function to call for the next topic
    speak: (src: string, speech: string) => void; // Function to handle speech
    done: boolean = false; // Flag to check if the scene is done
    activeAction: boolean = false; // Flag to check if an action is active
    resumeRecord: any; // Function to resume recording
    resumed: boolean = false; // Flag to check if recording has resumed

    constructor(
        canvas: HTMLCanvasElement,
        scene: Scene,
        nextTopic: () => void,
        speak: (src: string, speech: string) => void,
        resumeRecord: any,
    ) {
        this.canvas = canvas; // Set the canvas element
        this.ctx = canvas.getContext("2d"); // Get the canvas rendering context
        this.resumeRecord = resumeRecord; // Set the resume record function

        this.ctx!.imageSmoothingEnabled = true; // Enable image smoothing
        this.ctx!.imageSmoothingQuality = "low"; // Set image smoothing quality
        this.nextTopic = nextTopic; // Set the next topic function
        this.speak = speak; // Set the speak function
        this.scene = scene; // Set the scene information

        this.background = new Image(); // Create a new image element for the background
        this.background.src = `/backdrops/${this.scene.backdrop}.png`; // Set the background image source
        this.nextAction = this.nextAction.bind(this); // Bind the nextAction function

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

    // Draws the background and characters on the canvas
    draw() {
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the canvas

        if (this.background.complete) {
            this.ctx?.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height); // Draw the background image
        } else {
            this.background.onload = () => {
                this.ctx?.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height); // Draw the background image once loaded
            };
        }
    }

    // Updates the canvas and characters
    update(currentTime: number) {
        const deltaTime = (currentTime - this.lastTime) / 1000; // Calculate the time difference
        this.lastTime = currentTime; // Update the last time

        this.draw(); // Draw the background and characters

        this.animationFrameId = requestAnimationFrame((time) => this.update(time)); // Request the next animation frame
        for (const character of this.characters.values()) {
            if (!this.ctx) return;
            character.update(this.ctx, deltaTime); // Update each character
        }

        if (this.done) return; // Return if the scene is done

        const action = this.scene.actions[this.currentAction]; // Get the current action
        const actionCharacter = this.characters.get(action.character); // Get the character for the action
        let target: any = action.target; // Get the target for the action

        if (action.actionType == "move") {
            target = this.characters.get(action.target)?.x ?? 0; // Get the target position for move action
        }

        if (!this.activeAction && !this.done) {
            console.log(`${actionCharacter} ${action.actionType} ${target}`); // Log the action
            actionCharacter?.handleAction(action.actionType, target, this.nextAction); // Handle the action
            this.activeAction = true; // Set the active action flag
        }

        if (!this.resumed) {
            this.resumeRecord(); // Resume recording
            this.resumed = true; // Set the resumed flag
        }
    }

    // Handles the next action in the scene
    async nextAction() {
        this.currentAction += 1; // Increment the current action index
        this.activeAction = false; // Reset the active action flag

        console.log("scene ended?"); // Log the end of the scene

        if (this.currentAction == this.scene.actions.length) {
            this.done = true; // Set the done flag
            setTimeout(() => {
                if (this.nextTopic) {
                    this.nextTopic(); // Call the next topic function
                }
            }, 2000);
            return;
        }

        const previousAction = this.scene.actions[this.currentAction - 1]; // Get the previous action

        // Wait before executing the next action
        if (previousAction?.actionType === "attack01") {
            console.log("Attack action detected, waiting 5 seconds..."); // Log the attack action
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
        } else {
            await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 0.5 seconds
        }
    }

    // Starts the animation loop
    async start() {
        this.lastTime = performance.now(); // Set the last time to the current time
        this.update(this.lastTime); // Start the update loop

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
    }

    // Stops the animation loop
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId); // Cancel the animation frame
        }
    }
}
