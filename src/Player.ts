import { InputController } from "./InputController";
import { GameScene } from "./GameScene";

export class Player {
    isCatcher: boolean;
    isFrozen: boolean; // true if player cant move
    inputController: InputController;
    sprite: any = null; // sprite player controls
    /**
     * Determines animation names.
     */
    animationPrefix: string;

    // player attributes
    speed: number = 1;
    score: number = 0;

    // actions
    action1Cooldown: boolean = false;

    MAX_AIR_JUMPS = 1;

    // jumps in air
    jumpsInAir: number = 0;
    maxJumpsInAir: number = this.MAX_AIR_JUMPS;
    jumpPerformed: boolean = false;
    lastTimeOnGround: number = 0;

    jetpackTime: number;

    animationKeys: {
        walk: string,
        idle: string,
        jump: string,
        hurt: string
    };
    
    constructor(inputController: InputController, sprite: any, animationPrefix: string) {
        this.inputController = inputController;
        this.sprite = sprite;
        this.animationPrefix = animationPrefix;
        this.animationKeys = {
            walk: this.animationPrefix + '_walk',
            idle: this.animationPrefix + '_idle',
            jump: this.animationPrefix + '_jump',
            hurt: this.animationPrefix + '_hurt'
        }
    }

    createAnimations(anims: any) {
        console.log(this.animationKeys);
        console.log(this.animationPrefix);
        anims.create({
            key: this.animationKeys.walk,
            frames: anims.generateFrameNames('players', { prefix: (this.animationPrefix + '_walk'), start: 1, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        anims.create({
            key: this.animationKeys.idle,
            frames: [{ key: 'players', frame: (this.animationPrefix + '_stand') }],
            frameRate: 10
        });
        anims.create({
            key: this.animationKeys.jump,
            frames: [{ key: 'players', frame: (this.animationPrefix + '_jump') }],
            frameRate: 10
        });
        anims.create({
            key: this.animationKeys.hurt,
            frames: [{ key: 'players', frame: (this.animationPrefix + '_hurt') }],
            frameRate: 10
        });
    }

    update(totalTime: number, delta: number, scene: GameScene) {
        let input = scene.input;
        let sceneTime = scene.time;
        this.inputController.update(input);
        this.jetpackTime -= delta;
        // handle player movement
        if (!this.isFrozen) {
            // speed boost activated?
            if (!this.action1Cooldown && this.inputController.actions.action1) {
                // activate speed boost
                this.speed = 1.5;
                this.action1Cooldown = true;
                // play particle animation
                var particles = scene.add.particles('particle_red');
                let speedBoostEmitter = particles.createEmitter({});
                speedBoostEmitter.setPosition(0, 35);
                speedBoostEmitter.setScale(0.5);
                speedBoostEmitter.setSpeed(50);
                speedBoostEmitter.setBlendMode(Phaser.BlendModes.SCREEN);
                speedBoostEmitter.startFollow(this.sprite);
                sceneTime.delayedCall(1500, () => { this.speed = 1; particles.destroy(); }, [], this);
                sceneTime.delayedCall(5000, () => {
                    this.action1Cooldown = false; this.speed = 1;
                    let speedBoostNotificationParticles = scene.add.particles('particle_red');
                    let speedBoostNotification = speedBoostNotificationParticles.createEmitter({});
                    speedBoostNotification.setScale(0.5);
                    speedBoostNotification.setSpeed(300);
                    speedBoostNotification.setBlendMode(Phaser.BlendModes.ADD);
                    speedBoostNotification.startFollow(this.sprite);
                    sceneTime.delayedCall(150, () => {speedBoostNotificationParticles.destroy();}, [], this);
                }, [], this);
            }


            if (this.inputController.actions.left) {
                // move left
                this.sprite.setVelocityX(-320 * this.speed);
                if (this.sprite.body.onFloor() || this.sprite.body.touching.down) {
                    // play walk animation when on ground
                    this.sprite.anims.play(this.animationKeys.walk, true);
                }
                this.sprite.flipX = true;
            } else if (this.inputController.actions.right) {
                // move right
                this.sprite.setVelocityX(320 * this.speed);
                if (this.sprite.body.onFloor() || this.sprite.body.touching.down) {
                    // play walk animation when on ground
                    this.sprite.anims.play(this.animationKeys.walk, true);
                }
                this.sprite.flipX = false;
            } else {
                // stand still
                this.sprite.setVelocityX(0);
                if (this.sprite.body.onFloor() || this.sprite.body.touching.down) {
                    // play idle animation when on ground
                    this.sprite.anims.play(this.animationKeys.idle);
                } else {
                    // play jump animation when in air
                    this.sprite.anims.play(this.animationKeys.jump);
                }
            }

            // reset jumps in air if on floor
            if (this.sprite.body.onFloor() || this.sprite.body.touching.down) {
                this.jumpsInAir = 0;
                this.lastTimeOnGround = 0;
            } else {
                // count frames till last time on ground to perform smoother jumps
                this.lastTimeOnGround++;
            }
            // perform jump
            // jump performed "entprellt" the jump action - otherwise jumps will be executed
            // all at once
            if (this.inputController.actions.jump) {
                if (!this.jumpPerformed) {
                    this.jumpPerformed = true;
                    if (this.lastTimeOnGround < 5 || this.sprite.body.onFloor() || this.sprite.body.touching.down) {
                        this.sprite.setVelocityY(-550 * this.speed);
                        this.sprite.anims.play(this.animationKeys.jump);
                    } else if (this.jumpsInAir < this.maxJumpsInAir) {
                        // perform air jump
                        this.jumpsInAir++;
                        this.sprite.setVelocityY(-400 * this.speed);
                        this.sprite.anims.play(this.animationKeys.jump);
                    }
                }
            } else {
                this.jumpPerformed = false;
            }
        } else {
            this.sprite.setVelocityX(0);
            this.sprite.anims.play(this.animationKeys.hurt);
        }

        // calculate score
        if (!this.isCatcher) {
            this.score += delta;
        }

        // check for world map interaction
        if (scene.objectGroup && scene.physics.world.overlap(this.sprite, scene.objectGroup)) {
            // jumping from an object is like being on the ground
            this.jumpsInAir = 0;
            this.lastTimeOnGround = 0;
            this.sprite.setVelocityY(-800 * this.speed);
        }
    }

    activateJetpack(time, scene) {
        if (this.jetpackTime > 0) {
            return;
        }
        // activate speed boost
        this.jetpackTime = 1;
        //this.speed = 1.5;
        this.maxJumpsInAir = 1000;
        //this.action1Cooldown = true;
        // play particle animation
        var particles = scene.add.particles('particle_red');
        let speedBoostEmitter = particles.createEmitter({});
        speedBoostEmitter.setPosition(0, 35);
        speedBoostEmitter.setScale(0.5);
        speedBoostEmitter.setSpeed(50);
        speedBoostEmitter.setBlendMode(Phaser.BlendModes.SCREEN);
        speedBoostEmitter.startFollow(this.sprite);
        scene.time.delayedCall(time, () => { particles.destroy(); this.jetpackTime = 0; this.maxJumpsInAir = this.MAX_AIR_JUMPS;}, [], this);

    }
}