import * as Phaser from 'phaser';

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    // enable physics
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

class Player {
    catcher: Boolean;
    freeze: Boolean;
    cursors: null;
}

class World {
    players: Player[] = [];
}

var game = new Phaser.Game(config);

let world = null;

var player1 = null;
var player2 = null;
var player1Freeze = 0;
var player2Freeze = 0;
var cursors1 = null;
var cursors2 = null;

var catcherIndex = 0; // 0 means player 1 is catcher, 1 means player 2 is catcher...
var catcherEmitter = null;

function setCatcher() {

}

function preload() {
    // load players
    this.load.atlas('players', 'assets/sprites/aliens.png', 'assets/sprites/aliens.json');

    // load particles
    this.load.image('particle_blue', 'assets/particles/blue.png');

    // load tilemap
    this.load.image('base_tiles', 'assets/tiles/base_spritesheet.png');
    this.load.tilemapTiledJSON("map", "/assets/tilemaps/standard.json");
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


    // create player
    player1 = this.physics.add.sprite(500, 300, 'players', 'alienGreen_stand');
    //player1.setCollideWorldBounds(true);

    player2 = this.physics.add.sprite(300, 300, 'players', 'alienBlue_stand');
    //player2.setCollideWorldBounds(true);


    // load player animations
    this.anims.create({
        key: 'player1Walk',
        frames: this.anims.generateFrameNames('players', { prefix: 'alienGreen_walk', start: 1, end: 2 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'player1Idle',
        frames: [{ key: 'players', frame: 'alienGreen_stand' }],
        frameRate: 10
    });
    this.anims.create({
        key: 'player1Jump',
        frames: [{ key: 'players', frame: 'alienGreen_jump' }],
        frameRate: 10
    });
    this.anims.create({
        key: 'player1Hurt',
        frames: [{ key: 'players', frame: 'alienGreen_hurt' }],
        frameRate: 10
    });

    this.anims.create({
        key: 'player2Walk',
        frames: this.anims.generateFrameNames('players', { prefix: 'alienBlue_walk', start: 1, end: 2 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'player2Idle',
        frames: [{ key: 'players', frame: 'alienBlue_stand' }],
        frameRate: 10
    });
    this.anims.create({
        key: 'player2Jump',
        frames: [{ key: 'players', frame: 'alienBlue_jump' }],
        frameRate: 10
    });
    this.anims.create({
        key: 'player2Hurt',
        frames: [{ key: 'players', frame: 'alienBlue_hurt' }],
        frameRate: 10
    });



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


    // enable collision between platforms and player
    this.physics.add.collider(player1, worldLayer);
    this.physics.add.collider(player2, worldLayer);
    // listen to player to player events
    this.physics.add.collider(player1, player2, playersCollided, null, this);

    // init keyboard
    cursors1 = this.input.keyboard.createCursorKeys();

    // cursors for player2
    cursors2 = this.input.keyboard.addKeys(
        {
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        }
    );

    // set bounds
    this.physics.world.setBounds(0, 0, 1400, 1400);
    //this.cameras.main.setBounds(0, 0, 1400, 1400);


}

function playersCollided(playerA, playerB) {
    if (player2Freeze || player1Freeze) {
        // do not allow catches during freeze time
        return;
    }
    if (catcherIndex === 0) {
        catcherIndex = 1;
        player2Freeze = 3000;
        this.time.delayedCall(3000, () => { player2Freeze = 0; }, [], this);
    } else {
        catcherIndex = 0;
        player1Freeze = 3000;
        this.time.delayedCall(3000, () => { player1Freeze = 0; }, [], this);
    }
}

/**
 * Updates camera position too always see all players.
 */
function updateCameraPosition(cam) {
    // find center point of all players

    // determine player bounds (area all players lay in)
    var playerBounds = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        get width() {
            return this.x2 - this.x1;
        },
        get height() {
            return this.y2 - this.y1;
        }
    }
    if (player1.x < player2.x) {
        // player 1 is left
        playerBounds.x1 = player1.x;
        playerBounds.x2 = player2.x;
    } else {
        // player 2 is left or on equal x position
        playerBounds.x1 = player2.x;
        playerBounds.x2 = player1.x;
    }
    if (player1.y > player2.y) {
        // player 1 is above player2
        playerBounds.y1 = player1.y;
        playerBounds.y2 = player2.y;
    } else {
        // player 2 is above or on equal height
        playerBounds.y1 = player2.y;
        playerBounds.y2 = player1.y;
    }

    // calculate center point
    cam.centerOn(
        (playerBounds.x2 - playerBounds.x1) / 2 + playerBounds.x1, // x position
        (playerBounds.y2 - playerBounds.y1) / 2 + playerBounds.y1  // y position
    );

    // calculate scale ratio
    //cam.setScale(

    //)

}


function update() {
    // handle player movement
    if (player1Freeze <= 0) {
        if (cursors1.left.isDown) {
            // move left
            player1.setVelocityX(-160);
            if (player1.body.onFloor() || player1.body.touching.down) {
                // play walk animation when on ground
                player1.anims.play('player1Walk', true);
            }
            player1.flipX = true;
        } else if (cursors1.right.isDown) {
            // move right
            player1.setVelocityX(160);
            if (player1.body.onFloor() || player1.body.touching.down) {
                // play walk animation when on ground
                player1.anims.play('player1Walk', true);
            }
            player1.flipX = false;
        } else {
            // stand still
            player1.setVelocityX(0);
            if (player1.body.onFloor() || player1.body.touching.down) {
                // play idle animation when on ground
                player1.anims.play('player1Idle');
            } else {
                // play jump animation when in air
                player1.anims.play('player1Jump');
            }
        }

        // perform jump
        if (cursors1.up.isDown && (player1.body.onFloor() || player1.body.touching.down)) {
            player1.setVelocityY(-330);
            player1.anims.play('player1Jump');
        }
    } else {
        player1.setVelocityX(0);
        player1.anims.play('player1Hurt');
    }


    // handle player movement
    if (player2Freeze <= 0) {
        if (cursors2.left.isDown) {
            // move left
            player2.setVelocityX(-160);
            if (player2.body.onFloor() || player2.body.touching.down) {
                // play walk animation when on ground
                player2.anims.play('player2Walk', true);
            }
            player2.flipX = true;
        } else if (cursors2.right.isDown) {
            // move right
            player2.setVelocityX(160);
            if (player2.body.onFloor() || player2.body.touching.down) {
                // play walk animation when on ground
                player2.anims.play('player2Walk', true);
            }
            player2.flipX = false;
        } else {
            // stand still
            player2.setVelocityX(0);
            if (player2.body.onFloor() || player2.body.touching.down) {
                // play idle animation when on ground
                player2.anims.play('player2Idle');
            } else {
                // play jump animation when in air
                player2.anims.play('player2Jump');
            }
        }

        // perform jump
        if (cursors2.up.isDown && (player2.body.onFloor() || player2.body.touching.down)) {
            player2.setVelocityY(-330);
            player2.anims.play('player2Jump');
        }
    } else {
        player2.setVelocityX(0);
        player2.anims.play('player2Hurt');
    }

    // move catcher emitter
    if (catcherIndex === 0) {
        // player1 is catcher
        catcherEmitter.setPosition(player1.x, player1.y);
    } else {
        catcherEmitter.setPosition(player2.x, player2.y);
    }

    updateCameraPosition(this.cameras.main);
}