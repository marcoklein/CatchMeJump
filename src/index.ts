import * as Phaser from 'phaser';
import * as _ from 'underscore';

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 400,
    height: 600,
    // enable physics
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            //debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    input: {
        gamepad: true
    }
};

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
        console.warn('No Gamepad at index %i found!', this.padIndex);
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

    // actions
    action1Cooldown: boolean = false;

    // jumps in air
    jumpsInAir: number = 0;
    maxJumpsInAir: number = 1;
    jumpPerformed: boolean = false;

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

    update(scene) {
        let input = scene.input;
        let time = scene.time;
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
                time.delayedCall(1500, () => { this.speed = 1; particles.destroy(); }, [], this);
                time.delayedCall(5000, () => { this.action1Cooldown = false; this.speed = 1;}, [], this);
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
            }
            // perform jump
            // jump performed "entprellt" the jump action - otherwise jumps will be executed
            // all at once
            if (this.inputController.actions.jump) {
                if (!this.jumpPerformed) {
                    this.jumpPerformed = true;
                    if (this.sprite.body.onFloor() || this.sprite.body.touching.down) {
                        this.sprite.setVelocityY(-500 * this.speed);
                        this.sprite.anims.play(this.animationKeys.jump);
                    } else if (this.jumpsInAir < this.maxJumpsInAir) {
                        // perform air jump
                        this.jumpsInAir++;
                        this.sprite.setVelocityY(-500 * this.speed);
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
    }
}

// phaser game object
var game = new Phaser.Game(config);

// list of players
let players: Player[] = [];

var catcherEmitter = null;

function setCatcher() {

}

function preload() {
    // load players
    this.load.atlas('players', 'assets/sprites/aliens.png', 'assets/sprites/aliens.json');

    // load particles
    this.load.image('particle_blue', 'assets/particles/blue.png');
    this.load.image('particle_red', 'assets/particles/red.png');

    // load tilemap
    this.load.image('base_tiles', 'assets/tiles/base_spritesheet.png');
    this.load.tilemapTiledJSON("map", "/assets/tilemaps/flat.json");

}


function create() {

    //  First create a particle manager
    //  A single manager can be responsible for multiple emitters
    //  The manager also controls which particle texture is used by _all_ emitter
    var particles = this.add.particles('particle_blue');

    catcherEmitter = particles.createEmitter();

    catcherEmitter.setPosition(500, 300);
    catcherEmitter.setScale(0.5, 0.5);
    catcherEmitter.setSpeed(50);
    catcherEmitter.setBlendMode(Phaser.BlendModes.ADD);

    


    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const map = this.make.tilemap({key: 'map'});
    const tileset = map.addTilesetImage('base_platformer', 'base_tiles');
  
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer('Below Player', tileset, 0, 0);
    const worldLayer = map.createStaticLayer('World', tileset, 0, 0);
    const aboveLayer = map.createStaticLayer('Above Player', tileset, 0, 0);

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

    let player1InputController = new KeyboardController(this.input.keyboard.createCursorKeys());
    //let player1InputController = new GamepadController(0);

    let player1 = new Player(player1InputController, playerSprite1, 'alienGreen');
    players.push(player1);
    // first player is initial catcher
    player1.isCatcher = true;

    // add second player
    let playerSprite2 = this.physics.add.sprite(300, 300, 'players', 'alienBlue_stand');
    playerSprite2.setCollideWorldBounds(true);

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
    players.push(player2);

    let playerSprite3 = this.physics.add.sprite(800, 300, 'players', 'alienPink_stand');
    playerSprite3.setCollideWorldBounds(true);

    let player3InputController = new KeyboardController(
        this.input.keyboard.addKeys(
            {
                up: Phaser.Input.Keyboard.KeyCodes.Z,
                down: Phaser.Input.Keyboard.KeyCodes.H,
                left: Phaser.Input.Keyboard.KeyCodes.G,
                right: Phaser.Input.Keyboard.KeyCodes.J
            }
        )
    );

    let player3 = new Player(player3InputController, playerSprite3, 'alienPink');
    players.push(player3);


    // load player animations
    players.forEach(player => {
        player.createAnimations(this.anims);
    });


    // enable collision between platforms and player
    this.physics.add.collider(players[0].sprite, worldLayer);
    this.physics.add.collider(players[1].sprite, worldLayer);
    /*for (let i = 0; i < players.length; i++) {
        for (let j = i; j < players.length; j++) {
            if (i != j) {
                this.physics.add.collider(players[i], players[j]);
            }
        }
    }*/


    // listen to player to player events
    this.physics.add.collider(players[0].sprite, players[1].sprite, playersCollided, null, this);

    // set bounds
    this.physics.world.setBounds(0, 0, 1400, 1400);
    //this.cameras.main.setBounds(-200, -200, 1600, 1600);


    // ensure game size is set properly
    game.resize(window.innerWidth, window.innerHeight);
    this.cameras.main.setSize(window.innerWidth, window.innerHeight);
    // add resize listener
    window.addEventListener('resize', () => {
        game.resize(window.innerWidth, window.innerHeight);
        this.cameras.main.setSize(window.innerWidth, window.innerHeight);
    });


}

function playersCollided(playerA: any, playerB: any) {
    // find catcher player object
    playerA = _.find(players, player => {return player.sprite === playerA});
    playerB = _.find(players, player => {return player.sprite === playerB});
    if (playerA.isFrozen || playerB.isFrozen) {
        // do not allow catches during freeze time
        return;
    }
    if (playerA.isCatcher) {
        playerA.isCatcher = false;
        // promote playerB as catcher
        playerB.isCatcher = true;
        playerB.isFrozen = true;
        this.time.delayedCall(3000, () => { playerB.isFrozen = false; }, [], this);
    } else if (playerB.isCatcher) {
        playerB.isCatcher = false;
        // promote playerA as catcher
        playerA.isCatcher = true;
        playerA.isFrozen = true;
        this.time.delayedCall(3000, () => { playerA.isFrozen = false; }, [], this);
    }
}

/**
 * Updates camera position too always see all players.
 */
function updateCameraPosition(cam) {
    // find center point of all players
    const CAM_OFFSET = 600;
    const MIN_OFFSET = 400;

    // determine player bounds (area all players lay in)
    var playerBounds = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        get width() {
            return Math.max(this.x2 - this.x1, MIN_OFFSET) + CAM_OFFSET;
        },
        get height() {
            return Math.max(this.y2 - this.y1, MIN_OFFSET) + CAM_OFFSET;
        }
    }
    if (players[0].sprite.x < players[1].sprite.x) {
        // player 1 is left
        playerBounds.x1 = players[0].sprite.x;
        playerBounds.x2 = players[1].sprite.x;
    } else {
        // player 2 is left or on equal x position
        playerBounds.x1 = players[1].sprite.x;
        playerBounds.x2 = players[0].sprite.x;
    }
    if (players[0].sprite.y < players[1].sprite.y) {
        // player 1 is below player2
        playerBounds.y1 = players[0].sprite.y;
        playerBounds.y2 = players[1].sprite.y;
    } else {
        // player 2 is below or on equal height
        playerBounds.y1 = players[1].sprite.y;
        playerBounds.y2 = players[0].sprite.y;
    }

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

function update() {
    players.forEach(player => {
        player.update(this);
    });

    // find catcher
    let catcher = _.find(players, player => {return player.isCatcher});
    catcherEmitter.setPosition(catcher.sprite.x, catcher.sprite.y);

    updateCameraPosition(this.cameras.main);
}