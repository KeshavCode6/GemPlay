function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export class Character {
    // Stores different animations with their corresponding images and frame counts
    animations: { [key: string]: { image: HTMLImageElement, frameCount: number } } = {};
    currentAnimation: string = ""; // Tracks the current animation
    animationSet: string; // The character's animation set (e.g., knight, mage)

    // Position and size properties
    x: number = 0;
    y: number = 0;
    width: number = 100;
    height: number = 100;

    // Sprite positioning offsets
    spriteOffsetX: number = 50;
    spriteOffsetY: number = 70;
    spriteWidth: number = 30;
    spriteHeight: number = 30;

    // Animation control properties
    currentFrame: number = 0;
    frameSpeed: number;
    frameTimer: number;

    // Movement properties
    direction: string = "right";
    speed: number = 2;
    targetPosition: number | null = null; // Stores movement target

    // Speech properties
    speach: string | null = "";
    speak: any;

    // Canvas reference for rendering
    canvas: HTMLCanvasElement;

    // Flags to ensure animations are loaded before being used
    animationsLoaded: boolean = false;
    frameSpacing: number = 2;

    // Callback function for the next action after completing a task
    nextAction: any;

    constructor(character: string, direction: string, x: number, canvas: HTMLCanvasElement, speak: any) {
        this.animationSet = character;
        this.canvas = canvas;
        this.direction = direction;
        this.speak = speak;

        this.currentFrame = 0;
        this.frameSpeed = 0.1;
        this.frameTimer = 0;

        // Set initial position
        this.setPosition(x, canvas.height - this.height);

        // Load character animations
        this.loadAnimations();
    }

    // Set character position with sprite offsets applied
    setPosition(x: number, y: number) {
        this.x = x - this.spriteOffsetX / 2;
        this.y = y + this.spriteOffsetY / 2;
    }

    // Load animations asynchronously
    async loadAnimations() {
        let animations = ["idle", "walk", "death", "attack01"];
        try {
            const loadPromises = animations.map(async (animation) => {
                const capitalizedAnimation = capitalize(animation);
                const animationSet = capitalize(this.animationSet);
                const image = new Image();
                image.src = `/characters/${this.animationSet}/${animationSet}-${capitalizedAnimation}.png`;

                return new Promise<void>((resolve) => {
                    image.onload = () => {
                        console.log(`Loaded ${animation} animation, width: ${image.width}`);
                        const frameCount = Math.floor(image.width / this.width);
                        this.animations[capitalizedAnimation] = { image, frameCount };
                        resolve();
                    };
                    image.onerror = () => {
                        console.error(`Failed to load animation: ${animation}`);
                        resolve();
                    };
                });
            });

            await Promise.all(loadPromises);
            this.animationsLoaded = true;
            console.log("All animations loaded successfully");
            this.setAnimation("Idle");
        } catch (error) {
            console.error("Error loading animations:", error);
        }
    }

    // Set the character's current animation
    setAnimation(animation: string) {
        console.log(`Attempting to set animation: ${animation}`);
        const capitalizedAnim = capitalize(animation);

        if (!this.animationsLoaded) {
            console.log("Animations not yet loaded, deferring animation change");
            return;
        }

        if (!this.animations[capitalizedAnim]) {
            console.error(`Animation "${capitalizedAnim}" not found`);
            return;
        }

        if (capitalizedAnim !== this.currentAnimation) {
            console.log(`Changing animation from ${this.currentAnimation} to ${capitalizedAnim}`);
            this.currentAnimation = capitalizedAnim;
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }

    // Stops the character's movement and resets animation to idle
    stop() {
        this.setAnimation("idle");
    }

    // Update function to handle animation frames and movement
    update(ctx: CanvasRenderingContext2D, deltaTime: number) {
        if (!this.animations[this.currentAnimation]) return;

        this.frameTimer += deltaTime;

        // Handle animation frame progression
        if (this.frameTimer >= this.frameSpeed) {
            this.frameTimer = 0;
            if (this.currentAnimation === "Death" || this.currentAnimation === "Attack01") {
                if (this.currentFrame < this.animations[this.currentAnimation].frameCount - 1) {
                    this.currentFrame++;
                }
            } else {
                this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentAnimation].frameCount;
            }
        }

        // Handle character movement towards target position
        if (this.targetPosition !== null) {
            const diff = this.targetPosition - this.x;
            this.direction = diff < 0 ? "left" : "right";
            this.x += this.speed * (this.direction === "left" ? -0.25 : 0.25);
            this.setAnimation("walk");

            if (Math.abs(this.x - this.targetPosition) <= 35) {
                this.targetPosition = null;
                this.setAnimation("idle");
                this.nextAction();
                this.nextAction = null;
            }
        }

        this.draw(ctx);
    }

    // Handles different character actions such as movement, speaking, leaving, and combat
    handleAction(action: "move" | "speak" | "leave" | "death" | "attack01", target: any, nextAction: () => void) {
        if (action === "move" && typeof target === "number") {
            this.targetPosition = target;
            this.nextAction = nextAction;
        }
        if (action === "leave") {
            this.targetPosition = target === "left" ? -100 : this.canvas.width + 200;
            this.nextAction = nextAction;
        }
        if (action === "speak" && typeof target === "string") {
            this.speach = `"${target}" says the ${capitalize(this.animationSet)}`;
            this.speak(this.speach);
            setTimeout(() => {
                this.speach = null;
                this.speak("");
                nextAction();
            }, 3500);
        }
    }

    // Draws the character on the canvas
    draw(ctx: CanvasRenderingContext2D) {
        if (!this.currentAnimation || !this.animations[this.currentAnimation]) return;
        const { image } = this.animations[this.currentAnimation];
        const sx = Math.floor(this.currentFrame) * this.width;
        ctx.save();
        if (this.direction === "left") {
            ctx.scale(-1, 1);
            ctx.drawImage(image, sx, 0, this.width, this.height, -Math.round(this.x) - this.width, this.y, this.width, this.height);
        } else {
            ctx.drawImage(image, sx, 0, this.width, this.height, Math.round(this.x), this.y, this.width, this.height);
        }
        ctx.restore();
    }
}
