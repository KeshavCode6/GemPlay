function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export class Character {
    animations: { [key: string]: { image: HTMLImageElement, frameCount: number } } = {};
    currentAnimation: string = "";
    animationSet: string;
    x: number = 0;
    y: number = 0;
    width: number = 100;
    height: number = 100;
    spriteOffsetX: number = 50;
    spriteOffsetY: number = 70;
    spriteWidth: number = 30;
    spriteHeight: number = 30;
    currentFrame: number = 0;
    frameSpeed: number;
    frameTimer: number;
    direction: string = "right";
    speed: number = 2;
    speach: string | null = "";
    speak: any;
    canvas: HTMLCanvasElement;
    animationsLoaded: boolean = false;
    frameSpacing: number = 2;
    targetPosition: number | null = null; // Stores movement target
    nextAction: any;

    constructor(character: string, direction: string, x: number, canvas: HTMLCanvasElement, speak: any) {
        this.animationSet = character;
        this.canvas = canvas;
        this.direction = direction;
        this.speak = speak;
        this.animations = {};
        this.currentFrame = 0;
        this.frameSpeed = 0.1;
        this.frameTimer = 0;

        this.setPosition(x, canvas.height - this.height);
        this.loadAnimations();
    }

    setPosition(x: number, y: number) {
        this.x = x - this.spriteOffsetX / 2;
        this.y = y + this.spriteOffsetY / 2;
    }

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

    stop() {
        this.setAnimation("idle");
    }

    update(ctx: CanvasRenderingContext2D, deltaTime: number) {
        if (!this.animations[this.currentAnimation]) return;

        this.frameTimer += deltaTime;

        if (this.frameTimer >= this.frameSpeed) {
            this.frameTimer = 0;

            if (!(this.currentAnimation == "death" && this.currentFrame == this.animations[this.currentAnimation].frameCount)) {
                this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentAnimation].frameCount;
            }
        }

        // Move towards target position if set
        if (this.targetPosition !== null) {
            const diff = this.targetPosition - this.x;
            this.direction = diff < 0 ? "left" : "right";
            this.x += this.speed * (this.direction === "left" ? -0.25 : .25);
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

    handleAction(action: "move" | "speak" | "leave" | "death" | "attack01", target: any, nextAction: () => void) {
        if (action === "death" || action === "attack01") {
            this.setAnimation(action.toLowerCase());
            setTimeout(() => {
                if (action !== "death") this.setAnimation("idle");
                nextAction();
            }, 3000);
        }

        if (action === "move" && typeof target === "number") {
            this.targetPosition = target;
            this.nextAction = nextAction;
        }

        if (action === "leave") {
            this.targetPosition = target === "left" ? -100 : this.canvas.width + 200;
            this.nextAction = nextAction;
        }

        if (action === "speak" && typeof target === "string") {
            if (!this.speach) {
                let name = capitalize(this.animationSet);
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

                this.speach = variations[Math.floor(Math.random() * variations.length)];
                this.speak(this.speach);
                setTimeout(() => {
                    this.speach = null;
                    this.speak("");
                    nextAction();
                }, 3000);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.currentAnimation || !this.animations[this.currentAnimation]) return;

        const animation = this.animations[this.currentAnimation];
        if (!animation || !animation.image) return;

        const { image } = animation;
        const sx = Math.floor(this.currentFrame) * this.width;
        const sy = 0;
        const sw = this.width;
        const sh = this.height;

        ctx.save();
        if (this.direction === "left") {
            ctx.scale(-1, 1);
            ctx.drawImage(image, sx, sy, sw, sh, -Math.round(this.x) - this.width, this.y, this.width, this.height);
        } else {
            ctx.drawImage(image, sx, sy, sw, sh, Math.round(this.x), this.y, this.width, this.height);
        }
        ctx.restore();
    }
}
