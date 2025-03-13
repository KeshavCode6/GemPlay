// Function to capitalize the first letter of a string and make the rest lowercase
function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export class Character {
    // Object to store animations with their respective images and frame counts
    animations: { [key: string]: { image: HTMLImageElement, frameCount: number } } = {};
    currentAnimation: string = ""; // Current animation being played
    animationSet: string; // Name of the character's animation set
    x: number = 0; // X position of the character on the canvas
    y: number = 0; // Y position of the character on the canvas
    width: number = 100; // Width of the character sprite
    height: number = 100; // Height of the character sprite
    spriteOffsetX: number = 50; // X offset for the sprite
    spriteOffsetY: number = 70; // Y offset for the sprite
    spriteWidth: number = 30; // Width of the sprite frame
    spriteHeight: number = 30; // Height of the sprite frame
    currentFrame: number = 0; // Current frame of the animation
    frameSpeed: number; // Speed at which frames change
    frameTimer: number; // Timer to track frame changes
    direction: string = "right"; // Direction the character is facing
    speed: number = 2; // Speed of the character's movement
    speach: string | null = ""; // Text for character speech
    speak: any; // Function to handle character speech
    canvas: HTMLCanvasElement; // Canvas element where the character is drawn
    animationsLoaded: boolean = false; // Flag to check if animations are loaded
    frameSpacing: number = 2; // Spacing between frames
    targetPosition: number | null = null; // Target position for character movement
    nextAction: any; // Next action to perform after reaching target
    isPlayingOnce: boolean = false; // Flag for one-time animations

    constructor(character: string, direction: string, x: number, canvas: HTMLCanvasElement, speak: any) {
        this.animationSet = character; // Set the character's animation set
        this.canvas = canvas; // Set the canvas element
        this.direction = direction; // Set the initial direction
        this.speak = speak; // Set the speak function
        this.animations = {}; // Initialize animations object
        this.currentFrame = 0; // Initialize current frame
        this.frameSpeed = 0.1; // Set frame speed
        this.frameTimer = 0; // Initialize frame timer

        this.setPosition(x, canvas.height - this.height); // Set initial position
        this.loadAnimations(); // Load animations
    }

    // Sets character position on canvas
    setPosition(x: number, y: number) {
        this.x = x - this.spriteOffsetX / 2; // Adjust x position with offset
        this.y = y + this.spriteOffsetY / 2; // Adjust y position with offset
    }

    // Loads animations from images
    async loadAnimations() {
        let animations = ["idle", "walk", "death", "attack01"]; // List of animations to load
        try {
            const loadPromises = animations.map(async (animation) => {
                const capitalizedAnimation = capitalize(animation); // Capitalize animation name
                const animationSet = capitalize(this.animationSet); // Capitalize animation set name
                const image = new Image(); // Create new image element
                image.src = `/characters/${this.animationSet}/${animationSet}-${capitalizedAnimation}.png`; // Set image source

                return new Promise<void>((resolve) => {
                    image.onload = () => {
                        console.log(`Loaded ${animation} animation, width: ${image.width}`); // Log successful load
                        const frameCount = Math.floor(image.width / this.width); // Calculate frame count
                        this.animations[capitalizedAnimation] = { image, frameCount }; // Store animation
                        resolve();
                    };
                    image.onerror = () => {
                        console.error(`Failed to load animation: ${animation}`); // Log error
                        resolve();
                    };
                });
            });

            await Promise.all(loadPromises); // Wait for all animations to load
            this.animationsLoaded = true; // Set animations loaded flag
            console.log("All animations loaded successfully"); // Log success
            this.setAnimation("Idle"); // Set initial animation to idle
        } catch (error) {
            console.error("Error loading animations:", error); // Log error
        }
    }

    // Changes the character's animation
    setAnimation(animation: string) {
        console.log(`Attempting to set animation: ${animation}`); // Log animation change attempt
        const capitalizedAnim = capitalize(animation); // Capitalize animation name

        if (!this.animationsLoaded) {
            console.log("Animations not yet loaded, deferring animation change"); // Log deferred change
            return;
        }

        if (!this.animations[capitalizedAnim]) {
            console.error(`Animation "${capitalizedAnim}" not found`); // Log missing animation
            return;
        }

        // Ensure we only restart if it's a different animation
        if (capitalizedAnim !== this.currentAnimation) {
            console.log(`Changing animation from ${this.currentAnimation} to ${capitalizedAnim}`); // Log animation change
            this.currentAnimation = capitalizedAnim; // Set current animation
            this.currentFrame = 0; // Reset current frame
            this.frameTimer = 0; // Reset frame timer

            // If it's a one-time animation, set the flag
            if (capitalizedAnim === "Death" || capitalizedAnim === "Attack01") {
                this.isPlayingOnce = true; // Set one-time flag
            } else {
                this.isPlayingOnce = false; // Reset one-time flag
            }
        }
    }

    // Stops the character and sets them to idle animation
    stop() {
        this.setAnimation("idle"); // Set animation to idle
    }

    // Updates the character's animation and movement
    update(ctx: CanvasRenderingContext2D, deltaTime: number) {
        if (!this.animations[this.currentAnimation]) return; // Return if no current animation

        this.frameTimer += deltaTime; // Update frame timer

        // Advance frames based on time
        if (this.frameTimer >= this.frameSpeed) {
            this.frameTimer = 0; // Reset frame timer

            if (this.isPlayingOnce) {
                // Stop at last frame if it's a one-time animation
                if (this.currentFrame < this.animations[this.currentAnimation].frameCount - 1) {
                    this.currentFrame++; // Advance frame
                }
            } else {
                // Loop normally for other animations
                this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentAnimation].frameCount; // Loop frames
            }
        }

        // Move towards target position if set
        if (this.targetPosition !== null) {
            const diff = this.targetPosition - this.x; // Calculate difference to target
            this.direction = diff < 0 ? "left" : "right"; // Set direction
            this.x += this.speed * (this.direction === "left" ? -0.5 : 0.5); // Move character
            this.setAnimation("walk"); // Set animation to walk

            // Stop moving when reaching the target
            if (Math.abs(this.x - this.targetPosition) <= 35) {
                this.targetPosition = null; // Clear target position
                this.setAnimation("idle"); // Set animation to idle
                this.nextAction(); // Perform next action
                this.nextAction = null; // Clear next action
            }
        }

        this.draw(ctx); // Draw character
    }

    // Handles different character actions
    handleAction(action: "move" | "speak" | "leave" | "death" | "attack01", target: any, nextAction: () => void) {
        if (action === "death" || action === "attack01") {
            this.setAnimation(action.toLowerCase()); // Set animation
            setTimeout(() => {
                nextAction(); // Perform next action after delay
            }, 1500);
            return;
        }

        if (action === "move" && typeof target === "number") {
            this.targetPosition = target; // Set target position
            this.nextAction = () => {
                nextAction(); // Set next action
            };
            return;
        }

        if (action === "leave") {
            this.targetPosition = target === "left" ? -100 : this.canvas.width + 200; // Set target position for leaving
            this.nextAction = () => {
                nextAction(); // Set next action
            };
            return;
        }

        if (action === "speak" && typeof target === "string") {
            let name = capitalize(this.animationSet); // Capitalize character name
            const variations = [
                `"${target}" says the ${name}`,
                `"${target}" whispers the ${name}`,
                `"${target}" exclaims the ${name}`,
                `"${target}" yells the ${name}`,
                `"${target}" murmurs the ${name}`,
                `"${target}" mutters the ${name}`,
                `"${target}" shouts the ${name}`,
                `"${target}" cries out the ${name}`,
                `"${target}" announces the ${name}`,
                `"${target}" proclaims the ${name}`,
                `"${target}" states the ${name}`,
                `"${target}" declares the ${name}`,
                `"${target}" growls the ${name}`,
                `"${target}" hisses the ${name}`,
                `"${target}" grumbles the ${name}`,
                `"${target}" snickers the ${name}`,
                `"${target}" chuckles the ${name}`,
                `"${target}" sneers the ${name}`,
                `"${target}" laughs the ${name}`,
                `"${target}" utters the ${name}`
            ];

            const speechText = variations[Math.floor(Math.random() * variations.length)]; // Select random speech variation

            // Ensure we wait for previous speech to complete
            setTimeout(() => {
                this.speach = speechText; // Set speech text
                this.speak(this.speach); // Perform speech

                setTimeout(() => {
                    this.speach = null; // Clear speech text
                    this.speak(""); // Clear speech
                    nextAction(); // Perform next action
                }, 3500);
            }, 100); // Small delay ensures proper sequencing
        }
    }

    // Draws the character on the canvas
    draw(ctx: CanvasRenderingContext2D) {
        if (!this.currentAnimation || !this.animations[this.currentAnimation]) return; // Return if no current animation

        const animation = this.animations[this.currentAnimation]; // Get current animation
        if (!animation || !animation.image) return; // Return if no animation image

        const { image } = animation; // Get animation image
        const sx = Math.floor(this.currentFrame) * this.width; // Calculate source x position
        const sy = 0; // Source y position
        const sw = this.width; // Source width
        const sh = this.height; // Source height

        ctx.save(); // Save canvas state
        if (this.direction === "left") {
            ctx.scale(-1, 1); // Flip canvas horizontally
            ctx.drawImage(image, sx, sy, sw, sh, -Math.round(this.x) - this.width, this.y, this.width, this.height); // Draw image flipped
        } else {
            ctx.drawImage(image, sx, sy, sw, sh, Math.round(this.x), this.y, this.width, this.height); // Draw image normally
        }
        ctx.restore(); // Restore canvas state
    }
}