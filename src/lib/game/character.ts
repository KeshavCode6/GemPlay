

interface AnimationSet {
    character: string
    idle: number,
    walk: number
}

export const characterMap = {
    "archer": {
        character: "archer",
        idle: 5,
        walk: 7
    },
    "soldier": {
        character: "soldier",
        idle: 5,
        walk: 7
    }
}

export class Character {
    animations: { [key: string]: HTMLImageElement[] } = {};
    currentAnimation: string = "";
    animationSet: AnimationSet;
    x: number;
    y: number;
    width: number;
    height: number;
    currentFrame: number = 0;
    frameSpeed: number;
    frameTimer: number;
    direction: string = "right"; // "left" or "right"
    speed: number = 2;
    speach: string | null = "";
    speak: any;
    canvas: HTMLCanvasElement;
    constructor(animationSet: AnimationSet, direction: string, x: number, canvas: HTMLCanvasElement, speak: any) {
        this.animationSet = animationSet;
        this.x = x;
        this.width = 30;
        this.canvas = canvas;
        this.height = 30;
        this.y = canvas.height - this.height;
        this.currentFrame = 0;
        this.frameSpeed = 0.1;
        this.frameTimer = 0;
        this.direction = direction;
        this.speak = speak;

        let animations = ["idle", "walk"];
        animations.forEach((animation: string) => {
            let currentAnimation = animation as keyof AnimationSet;
            let count = this.animationSet[currentAnimation] as number;
            let images = [];

            for (let index = 0; index < count; index++) {
                let image = new Image();
                image.src = `/characters/${this.animationSet.character}/${currentAnimation}/${index}.png`;
                images.push(image);
            }

            this.animations[currentAnimation] = images;
        });

        this.setAnimation("idle");
    }

    setAnimation(animation: string) {
        if (this.animations[animation] && animation !== this.currentAnimation) {
            this.currentAnimation = animation;
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }


    stop() {
        this.setAnimation("idle");
    }

    update(ctx: CanvasRenderingContext2D, deltaTime: number) {
        this.frameTimer += deltaTime;

        if (this.frameTimer >= this.frameSpeed) {
            this.frameTimer = 0;
            this.currentFrame += 1;

            if (this.currentFrame >= this.animations[this.currentAnimation].length) {
                this.currentFrame = 0;
            }
        }

        this.draw(ctx);
    }

    moveToTarget(target: number, nextAction: any) {
        const diff = target - this.x;

        if (diff < 0) {
            this.direction = "left";
        } else {
            this.direction = "right";
        }

        this.x += 0.5 * (this.direction === "left" ? -1 : 1);
        this.setAnimation("walk");

        if (Math.abs(this.x - target) <= 30) {
            this.setAnimation("idle");
            nextAction();
        }
    }

    handleAction(action: "move" | "speak" | "leave", target: any, nextAction: () => void) {
        if (action === "move") {
            if (typeof target === "number") {
                this.moveToTarget(target, nextAction);
            }
        }

        if (action === "leave") {
            if (target == "left") {
                this.moveToTarget(-10, nextAction);
            }
            else {
                this.moveToTarget(this.canvas.width + 10, nextAction);
            }
        }

        if (action === "speak" && typeof target === "string") {
            function capitalize(str: string) {
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            }

            if (!this.speach) {
                let name = capitalize(this.animationSet.character);

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

                setTimeout(() => {
                    this.speach = null;
                    this.speak(null, ""); // Clear speech bubble
                    nextAction(); // Move to the next action
                }, 3000);
            }

            this.speak(this.getFrame().src, this.speach);
        }
    }


    getFrame() {
        return this.animations[this.currentAnimation][this.currentFrame]
    }

    draw(ctx: CanvasRenderingContext2D) {
        const currentImage = this.getFrame();

        ctx.save();
        if (this.direction === "left") {
            ctx.scale(-1, 1);
            ctx.drawImage(currentImage, -Math.round(this.x) - this.width, this.y, this.width, this.height);
        } else {
            ctx.drawImage(currentImage, Math.round(this.x), this.y, this.width, this.height);
        }
        ctx.restore();
    }

}