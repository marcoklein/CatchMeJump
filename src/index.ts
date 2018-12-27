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

var game = new Phaser.Game(config);
var platforms = null;
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

function preload ()
{
    this.load.image('platform', 'assets/sprites/platform.png');
    
    
    // load players
    this.load.atlas('players', 'assets/sprites/aliens.png', 'assets/sprites/aliens.json');

    // load particles
    this.load.image('particle_blue', 'assets/particles/blue.png');

    // load tilemap
    this.load.image('base_tiles', 'assets/tiles/base_spritesheet.png');
}


function create ()
{
    
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
    player1.setCollideWorldBounds(true);

    player2 = this.physics.add.sprite(300, 300, 'players', 'alienBlue_stand');
    player2.setCollideWorldBounds(true);

    
    // load player animations
    this.anims.create({
        key: 'player1Walk',
        frames: this.anims.generateFrameNames('players', {prefix: 'alienGreen_walk', start: 1, end: 2}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'player1Idle',
        frames: [{key: 'players', frame: 'alienGreen_stand'}],
        frameRate: 10
    });
    this.anims.create({
        key: 'player1Jump',
        frames: [{key: 'players', frame: 'alienGreen_jump'}],
        frameRate: 10
    });
    this.anims.create({
        key: 'player1Hurt',
        frames: [{key: 'players', frame: 'alienGreen_hurt'}],
        frameRate: 10
    });
    
    this.anims.create({
        key: 'player2Walk',
        frames: this.anims.generateFrameNames('players', {prefix: 'alienBlue_walk', start: 1, end: 2}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'player2Idle',
        frames: [{key: 'players', frame: 'alienBlue_stand'}],
        frameRate: 10
    });
    this.anims.create({
        key: 'player2Jump',
        frames: [{key: 'players', frame: 'alienBlue_jump'}],
        frameRate: 10
    });
    this.anims.create({
        key: 'player2Hurt',
        frames: [{key: 'players', frame: 'alienBlue_hurt'}],
        frameRate: 10
    });

    

    // add platforms to world
    platforms = this.physics.add.staticGroup();

    platforms.create(500, 150, 'platform');
    platforms.create(-200, 300, 'platform');
    platforms.create(400, 450, 'platform');


    // create tilemap
    const level = [
        [  -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1 ],
        [  -1,   -1,   -2,   -3,   -1,   -1,   -1,   1,   -2,   -3,   -1 ],
        [  -1,   -5,   -6,   -7,   -1,   -1,   -1,   -5,   -6,   -7,   -1 ],
        [  -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1 ],
        [  -1,   -1,   -1,  -14,  -13,  -14,   -1,   -1,   -1,   -1,   -1 ],
        [  -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1 ],
        [  -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1 ],
        [  -1,   -1,  9,  9,  9,  9,  9,   -1,   -1,   -1,  9 ],
        [  -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,   -1,  -1,  -1 ],
        [ -1,  -1,  -1,   -1,   -1,   -1,   -1,   -1,  -1,  -1,  -1 ],
        [ 9,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9 ]
      ];
    
    // When loading from an array, make sure to specify the tileWidth and tileHeight
    const map = this.make.tilemap({ data: level, tileWidth: 70, tileHeight: 70 });
    const tiles = map.addTilesetImage('base_tiles');
    const layer = map.createStaticLayer(0, tiles, 0, 0);


    layer.setCollisionBetween(0, 100);



    // enable collision between platforms and player
    this.physics.add.collider(player1, platforms);
    this.physics.add.collider(player2, platforms);
    this.physics.add.collider(player1, layer);
    this.physics.add.collider(player2, layer);
    // listen to player to player events
    this.physics.add.collider(player1, player2, playersCollided, null, this);

    // init keyboard
    cursors1 = this.input.keyboard.createCursorKeys();

    // cursors for player2
    cursors2 = this.input.keyboard.addKeys(
        {up:Phaser.Input.Keyboard.KeyCodes.W,
        down:Phaser.Input.Keyboard.KeyCodes.S,
        left:Phaser.Input.Keyboard.KeyCodes.A,
        right:Phaser.Input.Keyboard.KeyCodes.D});


}

function playersCollided(playerA, playerB) {
    if (player2Freeze || player1Freeze) {
        // do not allow catches during freeze time
        return;
    }
    if (catcherIndex === 0) {
        catcherIndex = 1;
        player2Freeze = 3000;
        this.time.delayedCall(3000, () => {player2Freeze = 0;}, [], this);
    } else {
        catcherIndex = 0;
        player1Freeze = 3000;
        this.time.delayedCall(3000, () => {player1Freeze = 0;}, [], this);
    }
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
}