

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

    constructor(animationSet: AnimationSet, direction: string, x: number, y: number) {
        this.animationSet = animationSet;
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.currentFrame = 0;
        this.frameSpeed = 0.1;
        this.frameTimer = 0;
        this.direction = direction;

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
        if (this.animations[animation]) {
            this.currentAnimation = animation;
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }

    move(direction: string) {
        this.direction = direction;
        this.setAnimation("walk");

        switch (direction) {
            case "left":
                this.x -= this.speed;
                break;
            case "right":
                this.x += this.speed;
                break;
            case "up":
                this.y -= this.speed;
                break;
            case "down":
                this.y += this.speed;
                break;
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

    draw(ctx: CanvasRenderingContext2D) {
        const currentImage = this.animations[this.currentAnimation][this.currentFrame];

        ctx.save();
        if (this.direction === "left") {
            ctx.scale(-1, 1);
            ctx.drawImage(currentImage, -this.x - this.width, this.y, this.width, this.height);
        } else {
            ctx.drawImage(currentImage, this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
}
