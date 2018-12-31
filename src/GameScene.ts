
import * as Phaser from 'phaser';
import * as _ from 'underscore';


abstract class InputController {
    actions: {
        left: boolean;
        right: boolean;
        jump: boolean;
        action1: boolean;
    }

    abstract update(input);
}

class GamepadController extends InputController {
    padIndex: Number;

    constructor(padIndex: Number) {
        super();
        this.padIndex = padIndex;
    }

    update(input) {
        // reset movements
        this.actions = {
            left: false,
            right: false,
            jump: false,
            action1: false
        }

        let gamepad = input.gamepad.getPad(this.padIndex);
        //console.warn('No Gamepad at index %i found!', this.padIndex);
        // handle player movement
        if (gamepad && gamepad.axes[0].value < -0.1) {
            // move left
            this.actions.left = true;
        } else if (gamepad && gamepad.axes[0].value > 0.1) {
            // move right
            this.actions.right = true;
        }
        // perform jump
        if (gamepad && gamepad.buttons[0].value === 1) {
            this.actions.jump = true;
        }
        // perform action1
        if (gamepad && gamepad.buttons[1].value === 1) {
            this.actions.action1 = true;
        }
    }
}

class KeyboardController extends InputController {
    cursors: any;

    constructor(cursors) {
        super();
        this.cursors = cursors;
    }

    update(input) {
        // reset movements
        this.actions = {
            left: this.cursors.left.isDown,
            right: this.cursors.right.isDown,
            jump: this.cursors.up.isDown,
            action1: this.cursors.down.isDown
        }
    }
}

class Player {
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

    // jumps in air
    jumpsInAir: number = 0;
    maxJumpsInAir: number = 1;
    jumpPerformed: boolean = false;
    lastTimeOnGround: number = 0;

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

    update(totalTime, delta, scene) {
        let input = scene.input;
        let sceneTime = scene.time;
        this.inputController.update(input);
        // handle player movement
        if (!this.isFrozen) {
            // speed boost activated?
            if (!this.action1Cooldown && this.inputController.actions.action1) {
                // activate speed boost
                this.speed = 1.5;
                this.action1Cooldown = true;
                // play particle animation
                var particles = scene.add.particles('particle_red');
                let speedBoostEmitter = particles.createEmitter();
                speedBoostEmitter.setPosition(0, 35);
                speedBoostEmitter.setScale(0.5, 0.5);
                speedBoostEmitter.setSpeed(50);
                speedBoostEmitter.setBlendMode(Phaser.BlendModes.SCREEN);
                speedBoostEmitter.startFollow(this.sprite);
                speedBoostEmitter.z = -1;
                sceneTime.delayedCall(1500, () => { this.speed = 1; particles.destroy(); }, [], this);
                sceneTime.delayedCall(5000, () => { this.action1Cooldown = false; this.speed = 1;}, [], this);
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
    }
}



export class GameScene extends Phaser.Scene {
    // list of all players
    players: Player[] = [];
    // effect that marks catcher
    catcherEmitter = null;

    remainingGameTime = 5 * 60 * 1000;

    // index of loaded map
    mapIndex: Number = -1;

    constructor() {
        super({ key: 'GameScene', active: true });
    }
    
    preload() {
        // load players
        this.load.atlas('players', 'assets/sprites/aliens.png', 'assets/sprites/aliens.json');

        // load particles
        this.load.image('particle_blue', 'assets/particles/blue.png');
        this.load.image('particle_red', 'assets/particles/red.png');

        // load tilemap
        this.load.image('base_tiles', 'assets/tiles/base_spritesheet.png');
        this.load.image('building_tiles', 'assets/tiles/buildings.png');
        this.load.image('candy_tiles', 'assets/tiles/candy.png');
        this.load.image('ice_tiles', 'assets/tiles/ice.png');
        this.load.image('mushroom_tiles', 'assets/tiles/mushroom.png');
        this.load.image('request_tiles', 'assets/tiles/request.png');

        let maps = [
            '/assets/tilemaps/marcs_world.json',
            '/assets/tilemaps/standard.json',
            '/assets/tilemaps/flat.json',
            '/assets/tilemaps/catchmejump1.json',
            '/assets/tilemaps/catchmejump2.json',
            '/assets/tilemaps/catchmejump3.json',
            '/assets/tilemaps/catchmejump4.json',
            '/assets/tilemaps/superjump.json',
            '/assets/tilemaps/mighty.json',
            '/assets/tilemaps/megamap.json',
            '/assets/tilemaps/spring.json'
        ];
        // load a random map
        this.mapIndex = _.random(maps.length - 1);
        maps.forEach((mapKey, index) => {
            this.load.tilemapTiledJSON("map_" + index, mapKey);
        });

    }


    create() {

        //  First create a particle manager
        //  A single manager can be responsible for multiple emitters
        //  The manager also controls which particle texture is used by _all_ emitter
        var particles = this.add.particles('particle_blue');

        this.catcherEmitter = particles.createEmitter({});
        this.catcherEmitter.setScale(0.5, 0.5);
        this.catcherEmitter.setSpeed(50);
        this.catcherEmitter.setBlendMode(Phaser.BlendModes.ADD);

        


        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const map = this.make.tilemap({key: 'map_' + this.mapIndex});
        const baseTiles = map.addTilesetImage('base_platformer', 'base_tiles');
        const buildingTiles = map.addTilesetImage('building', 'building_tiles');
        const candyTiles = map.addTilesetImage('candy', 'candy_tiles');
        const iceTiles = map.addTilesetImage('ice', 'ice_tiles');
        const mushroomTiles = map.addTilesetImage('mushroom', 'mushroom_tiles');
        const requestTiles = map.addTilesetImage('request', 'request_tiles');

        const tilesets = [
            baseTiles,
            buildingTiles,
            candyTiles,
            iceTiles,
            mushroomTiles,
            requestTiles
        ]
    
        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const belowLayer = map.createStaticLayer('Below Player', tilesets, 0, 0);
        const worldLayer = map.createStaticLayer('World', tilesets, 0, 0);
        const aboveLayer = map.createStaticLayer('Above Player', tilesets, 0, 0);
        const objectLayer = map.createDynamicLayer('Objects', tilesets, 0, 0);

        if (objectLayer) {
            console.log('Object layer loaded');
        }

        // unwalkable tiles are marked as collidable
        worldLayer.setCollisionByProperty({collides: true});

        


        // debug graphics for tilemap collisions
        /*const debugGraphics = this.add.graphics().setAlpha(0.75);
        worldLayer.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });*/



        // create players
        // add first player
        let playerSprite1 = this.physics.add.sprite(500, 300, 'players', 'alienGreen_stand');
        playerSprite1.setCollideWorldBounds(true);
        playerSprite1.setSize(56, 88);

        //let player1InputController = new KeyboardController(this.input.keyboard.createCursorKeys());
        let player1InputController = new GamepadController(0);

        let player1 = new Player(player1InputController, playerSprite1, 'alienGreen');
        this.players.push(player1);
        // first player is initial catcher
        player1.isCatcher = true;
        this.catcherEmitter.startFollow(player1.sprite);

        // add second player
        let playerSprite2 = this.physics.add.sprite(300, 300, 'players', 'alienBlue_stand');
        playerSprite2.setCollideWorldBounds(true);
        playerSprite2.setSize(56, 88);

        /*let player2InputController = new KeyboardController(
            this.input.keyboard.addKeys(
                {
                    up: Phaser.Input.Keyboard.KeyCodes.W,
                    down: Phaser.Input.Keyboard.KeyCodes.S,
                    left: Phaser.Input.Keyboard.KeyCodes.A,
                    right: Phaser.Input.Keyboard.KeyCodes.D
                }
            )
        );*/
        let player2InputController = new GamepadController(1);

        let player2 = new Player(player2InputController, playerSprite2, 'alienBlue');
        this.players.push(player2);

        let playerSprite3 = this.physics.add.sprite(800, 300, 'players', 'alienPink_stand');
        playerSprite3.setCollideWorldBounds(true);
        playerSprite3.setSize(56, 88);

        let player3InputController = new KeyboardController(
            this.input.keyboard.addKeys(
                {
                    up: Phaser.Input.Keyboard.KeyCodes.UP,
                    down: Phaser.Input.Keyboard.KeyCodes.SPACE,
                    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                    right: Phaser.Input.Keyboard.KeyCodes.RIGHT
                }
            )
        );

        let player3 = new Player(player3InputController, playerSprite3, 'alienPink');
        this.players.push(player3);


        // load player animations
        this.players.forEach(player => {
            player.createAnimations(this.anims);
        });


        // enable collision between platforms and player
        this.players.forEach(player => {
            this.physics.add.collider(player.sprite, worldLayer);
        });
        // listen to player to player events
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i; j < this.players.length; j++) {
                if (i != j) {
                    this.physics.add.collider(this.players[i].sprite, this.players[j].sprite, this.playersCollided, null, this);
                }
            }
        }



        // set bounds
        this.physics.world.setBounds(0, 0, map.width * map.tileWidth, map.height * map.tileHeight);
        //this.cameras.main.setBounds(-200, -200, 1600, 1600);


        // ensure game size is set properly
        this.game.resize(window.innerWidth, window.innerHeight);
        this.cameras.main.setSize(window.innerWidth, window.innerHeight);
        // add resize listener
        window.addEventListener('resize', () => {
            this.game.resize(window.innerWidth, window.innerHeight);
            this.cameras.main.setSize(window.innerWidth, window.innerHeight);
        });

        /*objectLayer.setTileLocationCallback(0, 28, 10, 1, function() {
            console.log('overlap');
            playerSprite3.setVelocityY(-1000);
        }, this);

        this.physics.add.overlap(playerSprite3, objectLayer);*/
    }

    playersCollided(playerA: any, playerB: any) {
        // find catcher player object
        playerA = _.find(this.players, player => {return player.sprite === playerA});
        playerB = _.find(this.players, player => {return player.sprite === playerB});
        if (playerA.isFrozen || playerB.isFrozen) {
            // do not allow catches during freeze time
            return;
        }
        if (playerA.isCatcher) {
            playerA.isCatcher = false;
            // promote playerB as catcher
            playerB.isCatcher = true;
            playerB.isFrozen = true;
            // attach catcher effect to playerB
            this.catcherEmitter.startFollow(playerB.sprite);
            this.time.delayedCall(3000, () => { playerB.isFrozen = false; }, [], this);
        } else if (playerB.isCatcher) {
            playerB.isCatcher = false;
            // promote playerA as catcher
            playerA.isCatcher = true;
            playerA.isFrozen = true;
            // attach catcher effect to playerA
            this.catcherEmitter.startFollow(playerA.sprite);
            this.time.delayedCall(3000, () => { playerA.isFrozen = false; }, [], this);
        }
    }

    /**
     * Updates camera position too always see all players.
     */
    updateCameraPosition(cam) {
        // find center point of all players
        const CAM_OFFSET = 600;
        const MIN_OFFSET = 400;

        // determine player bounds (area all players lay in)
        var playerBounds = {
            x1: null,
            y1: null,
            x2: null,
            y2: null,
            get width() {
                return Math.max(this.x2 - this.x1, MIN_OFFSET) + CAM_OFFSET;
            },
            get height() {
                return Math.max(this.y2 - this.y1, MIN_OFFSET) + CAM_OFFSET;
            }
        }
        // determine edges of player area
        this.players.forEach(player => {
            if (playerBounds.x1 === null || player.sprite.x < playerBounds.x1) {
                // player is further to the left
                playerBounds.x1 = player.sprite.x;
            }
            if (playerBounds.x2 === null || player.sprite.x > playerBounds.x2) {
                // player is further to the right
                playerBounds.x2 = player.sprite.x;
            }
            if (playerBounds.y1 === null || player.sprite.y < playerBounds.y1) {
                // player is further to the top
                playerBounds.y1 = player.sprite.y;
            }
            if (playerBounds.y2 === null || player.sprite.y > playerBounds.y2) {
                // player is further to the bottom
                playerBounds.y2 = player.sprite.y;
            }
        });

        // calculate center point
        cam.pan(
            (playerBounds.x2 - playerBounds.x1) / 2 + playerBounds.x1, // x position
            (playerBounds.y2 - playerBounds.y1) / 2 + playerBounds.y1, // y position
            100,
            'Linear'
        );

        // calculate scale ratio
        let zoomX = playerBounds.width / cam.width;
        let zoomY = playerBounds.height / cam.height;

        // zoom smoothly to desired scale
        cam.zoomTo(
            1 / Math.max(zoomX, zoomY),
            100,
            'Linear'
        );

    }

    update(time, delta) {
        //this.physics.world.gravity = new Phaser.Math.Vector2(0, 400);
        if (this.remainingGameTime > 0) {
            // game is running
            this.remainingGameTime -= delta;
            // update players
            this.players.forEach(player => {
                player.update(time, delta, this);
            });
            // update camera
            this.updateCameraPosition(this.cameras.main);
        } else {
            // game finished - do nothing
            this.scene.pause();
        }

    }

}