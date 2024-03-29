import { InputController, GamepadController, KeyboardController } from "./InputController";
import { GameScene } from "../scene/GameScene";
import { InputDeviceOptions, InputDeviceType } from "./GameConfig";

export class Player {

    readonly scene: GameScene;

    private _isCatcher: boolean;
    inputController: InputController;
    sprite: Phaser.Physics.Arcade.Sprite = null; // sprite player controls
    physicsBody: Phaser.Physics.Arcade.Body;

    private freezeTimer: Phaser.Time.TimerEvent;
    /**
     * Game time at which freeze will end.
     */
    private freezeEndTime: number;
    private _isFrozen: boolean; // true if player cant move

    // player attributes
    speed: number = 1;
    /**
     * Multiplier of the jump velocity. Same as speed for horizontal movement.
     */
    jumpMultiplier: number = 1;
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



    /* Visualization */
    /**
     * Marks a catcher.
     */
    private catcherEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    /**
     * Emits particles with each player jump.
     */
    private jumpEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    /**
     * Determines animation names.
     */
    animationPrefix: string;
    animationKeys: {
        walk: string,
        idle: string,
        jump: string,
        hurt: string
    };

    
    constructor(scene: GameScene, sprite: Phaser.Physics.Arcade.Sprite, animationPrefix: string, inputOptions: InputDeviceOptions) {
        this.scene = scene;
        this.sprite = sprite;
        this.physicsBody = <Phaser.Physics.Arcade.Body> this.sprite.body;
        this.animationPrefix = animationPrefix;
        this.animationKeys = {
            walk: this.animationPrefix + '_walk',
            idle: this.animationPrefix + '_idle',
            jump: this.animationPrefix + '_jump',
            hurt: this.animationPrefix + '_hurt'
        };

        this.initEffects();
        this.initInputController(inputOptions);
        this.createAnimations(scene.anims);
    }

    private initEffects() {
        // create jump emitter
        let blueParticles = this.scene.add.particles('particle_blue');
        blueParticles.setDepth(-100);

        this.jumpEmitter = blueParticles.createEmitter({
            scale: 0.5,
            speed: 50,
            blendMode: Phaser.BlendModes.ADD,
            tint: [0x22aa22]
        });
        this.jumpEmitter.setFrequency(-1, 0);
        this.jumpEmitter.startFollow(this.sprite);

        // create catcher emitter
        let redParticles = this.scene.add.particles('particle_red');
        redParticles.setDepth(-100);

        this.catcherEmitter = redParticles.createEmitter({});
        this.catcherEmitter.setScale(0.5);
        this.catcherEmitter.setSpeed(50);
        this.catcherEmitter.setBlendMode(Phaser.BlendModes.ADD);
        if (!this._isCatcher) this.catcherEmitter.stop();

        this.catcherEmitter.startFollow(this.sprite);

    }
    
    /**
     * Init controls for this player.
     */
    private initInputController(inputOptions: InputDeviceOptions) {
        if (inputOptions.type === InputDeviceType.KEYBOARD) {
            // keyboard input
            this.inputController = new KeyboardController(
                this.scene.input,
                inputOptions.keys
            );
        } else if (inputOptions.type === InputDeviceType.GAMEPAD) {
            this.inputController = new GamepadController(
                inputOptions.index
            )
        } else {
            // other
            console.error('No game input implementation for ' + inputOptions.type);
        }
    }

    /**
     * Creates all animations of the player.
     * 
     * @param anims Animation manager of the scene.
     */
    private createAnimations(anims: Phaser.Animations.AnimationManager) {
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

    /**
     * Update player logic.
     * Called by the GameScene every update step.
     * 
     * @param totalTime 
     * @param delta 
     * @param scene 
     */
    update(totalTime: number, delta: number, scene: GameScene) {
        let input = scene.input;
        let sceneTime = scene.time;
        this.inputController.update(input);
        this.jetpackTime -= delta;
        // handle player movement
        if (!this._isFrozen) {
            // speed boost activated?
            if (!this.action1Cooldown && this.inputController.actions.action1) {
                this.activateAction1();
            }

            // used to try out custom player graphics (key: test_player)
            // this.sprite.anims.play = (key: string | Phaser.Animations.Animation, ignoreIfPlaying?: boolean, startFrame?: number): Phaser.GameObjects.GameObject => {return this.sprite.setTexture('test_player');};


            if (this.inputController.actions.left) {
                // move left
                this.sprite.setVelocityX(-320 * this.speed);
                if (this.physicsBody.onFloor() || this.sprite.body.touching.down) {
                    // play walk animation when on ground
                    this.sprite.anims.play(this.animationKeys.walk, true);
                }
                this.sprite.flipX = true;
            } else if (this.inputController.actions.right) {
                // move right
                this.sprite.setVelocityX(320 * this.speed);
                if (this.physicsBody.onFloor() || this.sprite.body.touching.down) {
                    // play walk animation when on ground
                    this.sprite.anims.play(this.animationKeys.walk, true);
                }
                this.sprite.flipX = false;
            } else {
                // stand still
                this.sprite.setVelocityX(0);
                if (this.physicsBody.onFloor() || this.sprite.body.touching.down) {
                    // play idle animation when on ground
                    this.sprite.anims.play(this.animationKeys.idle);
                } else {
                    // play jump animation when in air
                    this.sprite.anims.play(this.animationKeys.jump);
                }
            }

            // reset jumps in air if on floor
            if (this.physicsBody.onFloor() || this.sprite.body.touching.down) {
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
                    if (this.lastTimeOnGround < 5 || this.physicsBody.onFloor() || this.sprite.body.touching.down) {
                        this.jump(550);
                    } else if (this.jumpsInAir < this.maxJumpsInAir) {
                        // perform air jump
                        this.jumpsInAir++;
                        this.jump(400);
                    }
                }
            } else {
                this.jumpPerformed = false;
            }
        } else {
            this.sprite.setVelocityX(0);
            this.sprite.anims.play(this.animationKeys.hurt);
        }

        // check for world map interaction
        if (scene.objectGroup && scene.physics.world.overlap(this.sprite, scene.objectGroup)) {
            // jumping from an object is like being on the ground
            this.jumpsInAir = 0;
            this.lastTimeOnGround = 0;
            this.jump(800);
        }
    }

    private activateAction1() {
        let sceneTime = this.scene.time;

        // the action function returns if the skill has been used
        this.action1Cooldown = this.activateSpeedBoost();

        if (this.action1Cooldown) {
            // cooldown of 5 seconds
            sceneTime.delayedCall(5000, () => {
                this.action1Cooldown = false;
            }, [], this);
        }
    }

    /**
     * Throw a player into his moving direction.
     */
    private activateSuperJump(): boolean {
        this.jump(800);
        return true;
    }

    private activateSpeedBoost(): boolean {
        let scene = this.scene;
        let sceneTime = this.scene.time;
        
        // activate speed boost
        this.speed = 1.5;
        this.jumpMultiplier = 1.5;
        
        // play particle animation
        var particles = scene.add.particles('particle_blue');
        let speedBoostEmitter = particles.createEmitter({});
        speedBoostEmitter.setPosition(0, 35);
        speedBoostEmitter.setScale(0.5);
        speedBoostEmitter.setSpeed(50);
        speedBoostEmitter.setBlendMode(Phaser.BlendModes.SCREEN);
        speedBoostEmitter.startFollow(this.sprite);
        sceneTime.delayedCall(1500, () => {
            // reset multipliers
            this.speed = 1;
            this.jumpMultiplier = 1;
            particles.destroy();
        }, [], this);
        sceneTime.delayedCall(5000, () => {
            this.action1Cooldown = false;
            // notify user that speed boost is available again
            let speedBoostNotificationParticles = scene.add.particles('particle_blue');
            let speedBoostNotification = speedBoostNotificationParticles.createEmitter({});
            speedBoostNotification.setScale(0.5);
            speedBoostNotification.setSpeed(300);
            speedBoostNotification.setBlendMode(Phaser.BlendModes.ADD);
            speedBoostNotification.startFollow(this.sprite);
            sceneTime.delayedCall(150, () => {speedBoostNotificationParticles.destroy();}, [], this);
        }, [], this);

        return true;
    }

    /* Player Actions */

    /**
     * Freeze the player for the given amount of time.
     * A frozen player is unable to move.
     * 
     * If a player is already frozen the freeze time only applies if the new freeze time is longer than the old one.
     * 
     * @param time 
     */
    freeze(time: number) {
        if (!this.freezeTimer || this.freezeEndTime < this.scene.time.now + time) {
            if (this.freezeTimer) {
                this.freezeTimer.destroy();
            }
            this.freezeEndTime = this.scene.time.now + time;
            this._isFrozen = true;
            this.freezeTimer = this.scene.time.addEvent({
                delay: time,
                callback: () => {
                    this._isFrozen = false;
                    this.freezeTimer = null;
                }
            });
        }
    }

    /**
     * Performs a player jump.
     * Emits jump particles and plays the jump animation.
     * 
     * The default strength is 550.
     */
    jump(strength: number = 550) {
        this.sprite.setVelocityY(-strength * this.jumpMultiplier);
        this.sprite.anims.play(this.animationKeys.jump);
        let particleNum = strength / 250;
        particleNum *= particleNum;
        this.jumpEmitter.emitParticle(particleNum);
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
        var particles = scene.add.particles('particle_blue');
        let speedBoostEmitter = particles.createEmitter({});
        speedBoostEmitter.setPosition(0, 35);
        speedBoostEmitter.setScale(0.5);
        speedBoostEmitter.setSpeed(50);
        speedBoostEmitter.setBlendMode(Phaser.BlendModes.SCREEN);
        speedBoostEmitter.startFollow(this.sprite);
        scene.time.delayedCall(time, () => { particles.destroy(); this.jetpackTime = 0; this.maxJumpsInAir = this.MAX_AIR_JUMPS;}, [], this);

    }

    /* Getter and Setter */

    get isFrozen(): boolean {
        return this._isFrozen;
    }

    get isCatcher(): boolean {
        return this._isCatcher;
    }

    set isCatcher(isCatcher: boolean) {
        if (isCatcher === true && this._isCatcher === true) {
            return; // change nothing
        }

        if (isCatcher) {
            // freeze if catcher
            this.freeze(this.scene.gameConfig.options.catcherFreezeTime);
            this.catcherEmitter.start();
        } else {
            this.catcherEmitter.stop();
        }
        
        // update internal value
        this._isCatcher = isCatcher;
    }
}